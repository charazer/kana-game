import { test, expect } from '@playwright/test';
import { Selectors } from './fixtures/selectors';
import { navigateToGame, startGame } from './fixtures/helpers';

/**
 * Test suite for keyboard input flows during gameplay
 */
test.describe('User Input', () => {
  test('should accept and display keyboard input during gameplay', async ({ page }) => {
    await navigateToGame(page);
    await startGame(page);
    
    // Type a character
    await page.keyboard.type('a');
    
    // Input echo should update with the typed character
    await expect(page.locator(Selectors.inputEcho)).toContainText('a');
    
    // Game should still be running
    await expect(page.locator(Selectors.score)).toBeVisible();
  });

  test('should handle backspace to delete input', async ({ page }) => {
    await navigateToGame(page);
    await startGame(page);
    
    // Type multiple characters
    await page.keyboard.type('abc');
    
    await expect(page.locator(Selectors.inputEcho)).toContainText('abc');
    
    // Delete one character
    await page.keyboard.press('Backspace');
    
    await expect(page.locator(Selectors.inputEcho)).not.toContainText('abc');
  });

  test('should block input when paused and resume when unpaused', async ({ page }) => {
    await navigateToGame(page);
    await startGame(page);
    
    const initialScore = await page.locator(Selectors.score).textContent();
    
    // Pause the game
    await page.keyboard.press('Space');
    await expect(page.locator(Selectors.pausedIndicator)).toBeVisible();
    
    // Try typing while paused  
    await page.keyboard.type('test');
    
    // Score should remain unchanged
    await expect(page.locator(Selectors.score)).toHaveText(initialScore || '0');
    
    // Resume game
    await page.keyboard.press('Space');
    await expect(page.locator(Selectors.pausedIndicator)).toHaveClass(/hidden/);
    
    // Input should work again after resume
    await page.keyboard.type('a');
    await expect(page.locator(Selectors.inputEcho)).not.toHaveText('_');
  });
});
