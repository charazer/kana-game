import { test, expect } from '@playwright/test';

/**
 * Test suite for game controls (pause, end, restart)
 */
test.describe('Game Controls', () => {
  test('should pause the game when clicking pause button', async ({ page }) => {
    await page.goto('/');
    
    // Start the game
    await page.click('#start');
    await expect(page.locator('#start-screen')).toBeHidden();
    
    // Pause indicator should be hidden initially
    await expect(page.locator('#paused-indicator')).toHaveClass(/hidden/);
    
    // Click pause button
    await page.click('#pause');
    
    // Paused indicator should be visible
    await expect(page.locator('#paused-indicator')).not.toHaveClass(/hidden/);
    await expect(page.locator('#paused-indicator')).toBeVisible();
  });

  test('should pause and resume with Space key', async ({ page }) => {
    await page.goto('/');
    
    // Start the game
    await page.keyboard.press('Enter');
    await expect(page.locator('#start-screen')).toBeHidden();
    
    // Press Space to pause
    await page.keyboard.press('Space');
    await expect(page.locator('#paused-indicator')).toBeVisible();
    
    // Press Space again to resume
    await page.keyboard.press('Space');
    await expect(page.locator('#paused-indicator')).toHaveClass(/hidden/);
  });

  test('should end the game when clicking end button', async ({ page }) => {
    await page.goto('/');
    
    // Start the game
    await page.click('#start');
    await expect(page.locator('#start-screen')).toBeHidden();
    
    // Click end game button
    await page.click('#end-game');
    
    // Game over screen should be visible
    await expect(page.locator('#game-over')).toBeVisible();
    await expect(page.locator('#game-over')).not.toHaveClass(/hidden/);
  });

  test('should end the game with Escape key', async ({ page }) => {
    await page.goto('/');
    
    // Start the game
    await page.keyboard.press('Enter');
    await expect(page.locator('#start-screen')).toBeHidden();
    
    // Press Escape to end
    await page.keyboard.press('Escape');
    
    // Game over screen should be visible
    await expect(page.locator('#game-over')).toBeVisible();
  });

  test('should restart the game from game over screen', async ({ page }) => {
    await page.goto('/');
    
    // Start and immediately end the game
    await page.keyboard.press('Enter');
    await page.keyboard.press('Escape');
    
    await expect(page.locator('#game-over')).toBeVisible();
    
    // Restart the game
    await page.click('#restart');
    
    await expect(page.locator('#game-over')).toHaveClass(/hidden/);
    await expect(page.locator('#score')).toHaveText('0');
  });
});
