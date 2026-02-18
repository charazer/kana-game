import { test, expect } from '@playwright/test';
import { Selectors } from './fixtures/selectors';
import { navigateToGame, openSettings, closeSettings } from './fixtures/helpers';

/**
 * Test suite for accessibility flows and keyboard navigation
 */
test.describe('Accessibility', () => {
  test('should support full keyboard navigation flow', async ({ page }) => {
    await navigateToGame(page);
    
    // Can start game with keyboard
    const startButton = page.locator(Selectors.startButton);
    await startButton.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator(Selectors.startScreen)).toBeHidden();
    
    // Can control game with keyboard
    await page.keyboard.press('Space'); // Pause
    await expect(page.locator(Selectors.pausedIndicator)).toBeVisible();
    
    await page.keyboard.press('Space'); // Resume
    await expect(page.locator(Selectors.pausedIndicator)).toHaveClass(/hidden/);
    
    await page.keyboard.press('Escape'); // End game
    await expect(page.locator(Selectors.gameOver)).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateToGame(page);
    
    // Should be able to start game on mobile
    await page.click(Selectors.startButton);
    await expect(page.locator(Selectors.startScreen)).toBeHidden();
    
    // Should be able to open settings on mobile
    await page.keyboard.press('Escape');
    await openSettings(page);
    
    // Should be able to close modal on mobile
    await closeSettings(page);
  });
});
