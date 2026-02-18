import { test, expect } from '@playwright/test';
import { Selectors } from './fixtures/selectors';
import { navigateToGame, startGame, pauseGame } from './fixtures/helpers';

/**
 * Test suite for game controls (pause, end, restart)
 */
test.describe('Game Controls', () => {
  test('should pause the game when clicking pause button', async ({ page }) => {
    await navigateToGame(page);
    await startGame(page);
    
    // Pause indicator should be hidden initially
    await expect(page.locator(Selectors.pausedIndicator)).toHaveClass(/hidden/);
    
    // Pause the game
    await pauseGame(page);
  });

  test('should pause and resume with Space key', async ({ page }) => {
    await navigateToGame(page);
    
    // Start the game with Enter key
    await page.keyboard.press('Enter');
    await expect(page.locator(Selectors.startScreen)).toBeHidden();
    
    // Press Space to pause
    await page.keyboard.press('Space');
    await expect(page.locator(Selectors.pausedIndicator)).toBeVisible();
    
    // Press Space again to resume
    await page.keyboard.press('Space');
    await expect(page.locator(Selectors.pausedIndicator)).toHaveClass(/hidden/);
  });

  test('should end the game when clicking end button', async ({ page }) => {
    await navigateToGame(page);
    await startGame(page);
    
    // Click end game button
    await page.click(Selectors.endGameButton);
    
    // Game over screen should be visible
    await expect(page.locator(Selectors.gameOver)).toBeVisible();
    await expect(page.locator(Selectors.gameOver)).not.toHaveClass(/hidden/);
  });

  test('should end the game with Escape key', async ({ page }) => {
    await navigateToGame(page);
    
    // Start the game with Enter key
    await page.keyboard.press('Enter');
    await expect(page.locator(Selectors.startScreen)).toBeHidden();
    
    // Press Escape to end
    await page.keyboard.press('Escape');
    
    // Game over screen should be visible
    await expect(page.locator(Selectors.gameOver)).toBeVisible();
  });

  test('should restart the game from game over screen', async ({ page }) => {
    await navigateToGame(page);
    
    // Start and immediately end the game
    await page.keyboard.press('Enter');
    await page.keyboard.press('Escape');
    
    await expect(page.locator(Selectors.gameOver)).toBeVisible();
    
    // Restart the game
    await page.click(Selectors.restartButton);
    
    await expect(page.locator(Selectors.gameOver)).toHaveClass(/hidden/);
    await expect(page.locator(Selectors.score)).toHaveText('0');
  });
});
