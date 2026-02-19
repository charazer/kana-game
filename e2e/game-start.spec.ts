import { test, expect } from '@playwright/test';
import { Selectors } from './fixtures/selectors';
import { navigateToGame, startGame } from './fixtures/helpers';

/**
 * Test suite for game initialization flows
 */
test.describe('Game Start', () => {
  test('should complete initial load and start game flow', async ({ page }) => {
    await navigateToGame(page);
    
    // Can start via button
    await startGame(page);
    await expect(page.locator(Selectors.score)).toHaveText('0');
  });

  test('should start game with Enter key', async ({ page }) => {
    await navigateToGame(page);
    
    await page.keyboard.press('Enter');
    
    await expect(page.locator(Selectors.startScreen)).toBeHidden();
  });

  test('should restart and reset game state', async ({ page }) => {
    await navigateToGame(page);
    
    // Start and end game
    await startGame(page);
    await page.keyboard.press('Escape');
    await expect(page.locator(Selectors.confirmEndModal)).toBeVisible();
    await page.keyboard.press('y');

    // Restart game
    await page.click(Selectors.restartButton);
    
    // Game state should be reset
    await expect(page.locator(Selectors.gameOver)).toHaveClass(/hidden/);
    await expect(page.locator(Selectors.score)).toHaveText('0');
    const hearts = page.locator(`${Selectors.lives} img${Selectors.heartIcon}`);
    await expect(hearts).toHaveCount(3);
  });
});
