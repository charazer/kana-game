import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E tests
 * Differentiates between local development and GitHub Actions CI environment
 * 
 * See https://playwright.dev/docs/test-configuration
 */

// Detect if running in GitHub Actions
const isGitHubActions = !!process.env.GITHUB_ACTIONS;

export default defineConfig({
  testDir: './e2e',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on GitHub Actions if you accidentally left test.only in the source code */
  forbidOnly: isGitHubActions,
  
  /* Retry failed tests on GitHub Actions for flake resistance */
  retries: isGitHubActions ? 2 : 0,
  
  /* Use fewer workers on GitHub Actions for stability and resource management */
  workers: isGitHubActions ? 1 : undefined,
  
  /* Timeout for each test */
  timeout: 30 * 1000, // 30 seconds
  
  /* Reporter to use */
  reporter: isGitHubActions 
    ? [['html'], ['github']] // GitHub Actions annotations + HTML report
    : 'html', // Local: just HTML report
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:5173',
    
    /* Enable traces for debugging - 'on-first-retry' captures traces only when tests are retried */
    trace: isGitHubActions ? 'off' : 'on-first-retry',
    
    /* Capture screenshots only for failing tests */
    screenshot: isGitHubActions ? 'off' : 'only-on-failure',
    
    /* Record videos but retain them only for failing tests */
    video: isGitHubActions ? 'off' : 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run local dev server before starting the tests */
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !isGitHubActions, // Always start fresh server on GitHub Actions
    timeout: 120 * 1000,
    stdout: 'ignore', // Reduce noise in logs
    stderr: 'pipe',
  },
});
