import { test, expect } from '@playwright/test';

/**
 * Test suite for keyboard input flows during gameplay
 */
test.describe('User Input', () => {
  test('should accept and display keyboard input during gameplay', async ({ page }) => {
    await page.goto('/');
    await page.click('#start');
    
    // Type a character
    await page.keyboard.type('a');
    
    // Input echo should update with the typed character
    await expect(page.locator('#input-echo')).toContainText('a');
    
    // Game should still be running
    await expect(page.locator('#score')).toBeVisible();
  });

  test('should handle backspace to delete input', async ({ page }) => {
    await page.goto('/');
    await page.click('#start');
    
    // Type multiple characters
    await page.keyboard.type('abc');
    
    await expect(page.locator('#input-echo')).toContainText('abc');
    
    // Delete one character
    await page.keyboard.press('Backspace');
    
    await expect(page.locator('#input-echo')).not.toContainText('abc');
  });

  test('should block input when paused and resume when unpaused', async ({ page }) => {
    await page.goto('/');
    await page.click('#start');
    
    const initialScore = await page.locator('#score').textContent();
    
    // Pause the game
    await page.keyboard.press('Space');
    await expect(page.locator('#paused-indicator')).toBeVisible();
    
    // Try typing while paused  
    await page.keyboard.type('test');
    
    // Score should remain unchanged
    await expect(page.locator('#score')).toHaveText(initialScore || '0');
    
    // Resume game
    await page.keyboard.press('Space');
    await expect(page.locator('#paused-indicator')).toHaveClass(/hidden/);
    
    // Input should work again after resume
    await page.keyboard.type('a');
    await expect(page.locator('#input-echo')).not.toHaveText('_');
  });
});
