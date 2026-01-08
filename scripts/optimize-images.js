#!/usr/bin/env node

/**
 * Image optimization script
 * Converts PNG images to WebP format for better performance
 * 
 * Usage: node scripts/optimize-images.js
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const images = [
  {
    input: 'src/assets/img/background.png',
    output: 'src/assets/img/background.webp',
    resize: { width: 1920, height: 1280, fit: 'cover' },
    quality: 85
  }
];

async function optimizeImages() {
  console.log('🖼️  Optimizing images...\n');
  
  for (const img of images) {
    const inputPath = join(projectRoot, img.input);
    const outputPath = join(projectRoot, img.output);
    
    if (!existsSync(inputPath)) {
      console.log(`⚠️  Skipping ${img.input} (not found)`);
      continue;
    }
    
    try {
      const info = await sharp(inputPath)
        .resize(img.resize)
        .webp({ quality: img.quality })
        .toFile(outputPath);
      
      const inputSize = (await sharp(inputPath).metadata()).size;
      const savings = ((1 - info.size / inputSize) * 100).toFixed(1);
      
      console.log(`✅ ${img.input}`);
      console.log(`   → ${img.output}`);
      console.log(`   📦 ${(inputSize / 1024 / 1024).toFixed(2)}MB → ${(info.size / 1024).toFixed(1)}KB (${savings}% smaller)\n`);
    } catch (error) {
      console.error(`❌ Error processing ${img.input}:`, error.message);
    }
  }
  
  console.log('✨ Done!');
}

optimizeImages().catch(console.error);
