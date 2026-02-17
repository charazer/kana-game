import { test, expect } from '@playwright/test';

/**
 * Test suite for accessibility flows and keyboard navigation
 */
test.describe('Accessibility', () => {
  test('should support full keyboard navigation flow', async ({ page }) => {
    await page.goto('/');
    
    // Can focus and activate settings with keyboard
    const settingsButton = page.locator('#settings-btn');
    await settingsButton.focus();
    await expect(settingsButton).toBeFocused();
    await settingsButton.click();
    await expect(page.locator('#settings-modal')).toBeVisible();
    
    // Can close modal with keyboard
    await page.keyboard.press('Escape');
    await expect(page.locator('#settings-modal')).toHaveClass(/hidden/);
    
    // Can start game with keyboard
    const startButton = page.locator('#start');
    await startButton.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#start-screen')).toBeHidden();
    
    // Can control game with keyboard
    await page.keyboard.press('Space'); // Pause
    await expect(page.locator('#paused-indicator')).toBeVisible();
    
    await page.keyboard.press('Space'); // Resume
    await expect(page.locator('#paused-indicator')).toHaveClass(/hidden/);
    
    await page.keyboard.press('Escape'); // End game
    await expect(page.locator('#game-over')).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Should be able to start game on mobile
    await page.click('#start');
    await expect(page.locator('#start-screen')).toBeHidden();
    
    // Should be able to open settings on mobile
    await page.keyboard.press('Escape');
    await page.click('#settings-btn');
    await expect(page.locator('#settings-modal')).toBeVisible();
    
    // Should be able to close modal on mobile
    await page.click('#settings-close');
    await expect(page.locator('#settings-modal')).toHaveClass(/hidden/);
  });
});
