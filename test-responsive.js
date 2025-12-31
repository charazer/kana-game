#!/usr/bin/env node
/**
 * Responsive visual testing script
 * Tests the game at various resolutions and captures screenshots
 */

const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Test resolutions
const RESOLUTIONS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'laptop', width: 1366, height: 768 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile-landscape', width: 667, height: 375 },
  { name: 'mobile-portrait', width: 375, height: 667 },
  { name: 'small-mobile', width: 320, height: 568 },
];

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

async function waitForServer(url, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log('✓ Dev server is ready');
        return true;
      }
    } catch (e) {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error('Dev server failed to start');
}

async function captureScreenshots() {
  console.log('🚀 Starting responsive visual tests...\n');

  // Start Vite dev server
  console.log('Starting Vite dev server...');
  const viteProcess = spawn('npm', ['run', 'dev'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });

  let serverUrl = 'http://localhost:5173';
  
  // Listen for the server URL from Vite output
  viteProcess.stdout.on('data', (data) => {
    const output = data.toString();
    const match = output.match(/Local:\s+(http:\/\/[^\s]+)/);
    if (match) {
      serverUrl = match[1];
    }
  });

  try {
    // Wait for server to be ready
    await waitForServer(serverUrl);

    // Launch browser
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Test each resolution
    for (const resolution of RESOLUTIONS) {
      console.log(`\n📱 Testing ${resolution.name} (${resolution.width}x${resolution.height})`);
      
      await page.setViewport({
        width: resolution.width,
        height: resolution.height,
        deviceScaleFactor: 1,
      });

      await page.goto(serverUrl, { waitUntil: 'networkidle2' });
      
      // Wait a bit for animations to settle
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capture screenshot
      const screenshotPath = path.join(screenshotsDir, `${resolution.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`  ✓ Screenshot saved: ${screenshotPath}`);

      // Calculate header height and game area height
      const measurements = await page.evaluate(() => {
        const header = document.querySelector('header');
        const gameArea = document.querySelector('#game-area');
        const body = document.body;
        
        return {
          headerHeight: header ? header.offsetHeight : 0,
          gameAreaHeight: gameArea ? gameArea.offsetHeight : 0,
          viewportHeight: window.innerHeight,
          headerPercent: header ? Math.round((header.offsetHeight / window.innerHeight) * 100) : 0,
          gameAreaPercent: gameArea ? Math.round((gameArea.offsetHeight / window.innerHeight) * 100) : 0,
        };
      });

      console.log(`  Header: ${measurements.headerHeight}px (${measurements.headerPercent}% of viewport)`);
      console.log(`  Game area: ${measurements.gameAreaHeight}px (${measurements.gameAreaPercent}% of viewport)`);
      
      if (measurements.headerPercent > 40) {
        console.log(`  ⚠️  WARNING: Header takes up ${measurements.headerPercent}% of viewport (recommended < 40%)`);
      } else if (measurements.headerPercent > 30) {
        console.log(`  ⚡ NOTICE: Header takes up ${measurements.headerPercent}% of viewport (could be more compact)`);
      } else {
        console.log(`  ✓ Header size is reasonable`);
      }
    }

    await browser.close();
    console.log('\n✅ All screenshots captured successfully!');
    console.log(`📁 Screenshots saved in: ${screenshotsDir}\n`);

  } catch (error) {
    console.error('❌ Error during testing:', error);
    process.exit(1);
  } finally {
    // Kill the Vite server
    console.log('Shutting down dev server...');
    viteProcess.kill('SIGTERM');
    
    // Give it a moment to shut down gracefully
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Force kill if still running
    try {
      process.kill(viteProcess.pid, 0);
      viteProcess.kill('SIGKILL');
    } catch (e) {
      // Process already terminated
    }
  }
}

captureScreenshots().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
