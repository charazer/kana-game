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

    // Click end game button — confirm modal should appear
    await page.click(Selectors.endGameButton);
    await expect(page.locator(Selectors.confirmEndModal)).toBeVisible();

    // Confirm ending the game
    await page.click(Selectors.confirmEndYes);

    // Game over screen should be visible
    await expect(page.locator(Selectors.gameOver)).toBeVisible();
    await expect(page.locator(Selectors.gameOver)).not.toHaveClass(/hidden/);
  });

  test('should dismiss confirm modal and continue game when clicking No', async ({ page }) => {
    await navigateToGame(page);
    await startGame(page);

    // Open confirm modal
    await page.click(Selectors.endGameButton);
    await expect(page.locator(Selectors.confirmEndModal)).toBeVisible();

    // Dismiss via No button
    await page.click(Selectors.confirmEndNo);
    await expect(page.locator(Selectors.confirmEndModal)).toHaveClass(/hidden/);

    // Game over screen should NOT be visible — game continues
    await expect(page.locator(Selectors.gameOver)).toHaveClass(/hidden/);
  });

  test('should end the game with Escape key', async ({ page }) => {
    await navigateToGame(page);

    // Start the game with Enter key
    await page.keyboard.press('Enter');
    await expect(page.locator(Selectors.startScreen)).toBeHidden();

    // Press Escape — confirm modal should appear
    await page.keyboard.press('Escape');
    await expect(page.locator(Selectors.confirmEndModal)).toBeVisible();

    // Confirm with Y key
    await page.keyboard.press('y');

    // Game over screen should be visible
    await expect(page.locator(Selectors.gameOver)).toBeVisible();
  });

  test('should dismiss confirm modal with N key and continue game', async ({ page }) => {
    await navigateToGame(page);

    await page.keyboard.press('Enter');
    await expect(page.locator(Selectors.startScreen)).toBeHidden();

    // Open confirm modal via Escape
    await page.keyboard.press('Escape');
    await expect(page.locator(Selectors.confirmEndModal)).toBeVisible();

    // Dismiss via N key
    await page.keyboard.press('n');
    await expect(page.locator(Selectors.confirmEndModal)).toHaveClass(/hidden/);

    // Game should still be running — game over screen not shown
    await expect(page.locator(Selectors.gameOver)).toHaveClass(/hidden/);
  });

  test('should restart the game from game over screen', async ({ page }) => {
    await navigateToGame(page);

    // Start and end the game via confirm modal
    await page.keyboard.press('Enter');
    await page.keyboard.press('Escape');
    await expect(page.locator(Selectors.confirmEndModal)).toBeVisible();
    await page.keyboard.press('y');

    await expect(page.locator(Selectors.gameOver)).toBeVisible();

    // Restart the game
    await page.click(Selectors.restartButton);

    await expect(page.locator(Selectors.gameOver)).toHaveClass(/hidden/);
    await expect(page.locator(Selectors.score)).toHaveText('0');
  });
});
