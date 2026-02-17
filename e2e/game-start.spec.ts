import { test, expect } from '@playwright/test';

/**
 * Test suite for game initialization flows
 */
test.describe('Game Start', () => {
  test('should complete initial load and start game flow', async ({ page }) => {
    await page.goto('/');
    
    // Page loads successfully
    await expect(page).toHaveTitle(/Kana Game/);
    
    // Can start via button
    await page.click('#start');
    await expect(page.locator('#start-screen')).toBeHidden();
    await expect(page.locator('#score')).toHaveText('0');
  });

  test('should start game with Enter key', async ({ page }) => {
    await page.goto('/');
    
    await page.keyboard.press('Enter');
    
    await expect(page.locator('#start-screen')).toBeHidden();
  });

  test('should restart and reset game state', async ({ page }) => {
    await page.goto('/');
    
    // Start and end game
    await page.click('#start');
    await page.keyboard.press('Escape');
    
    // Restart game
    await page.click('#restart');
    
    // Game state should be reset
    await expect(page.locator('#game-over')).toHaveClass(/hidden/);
    await expect(page.locator('#score')).toHaveText('0');
    const hearts = page.locator('#lives img.heart-icon');
    await expect(hearts).toHaveCount(3);
  });
});
