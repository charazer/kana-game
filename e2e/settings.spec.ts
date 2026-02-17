import { test, expect } from '@playwright/test';

/**
 * Test suite for settings configuration flows
 */
test.describe('Settings', () => {
  test('should open, configure, and close settings modal flow', async ({ page }) => {
    await page.goto('/');    
    
    // Open settings
    await page.click('#settings-btn');
    await expect(page.locator('#settings-modal')).toBeVisible();
    
    // Change a setting
    const gameModeSelect = page.locator('#game-mode');
    await gameModeSelect.selectOption('practice');
    await expect(gameModeSelect).toHaveValue('practice');
    
    // Close modal
    await page.click('#settings-close');
    await expect(page.locator('#settings-modal')).toHaveClass(/hidden/);
    
    // Setting should persist when reopening
    await page.click('#settings-btn');
    await expect(gameModeSelect).toHaveValue('practice');
  });

  test('should change kana set and start game with new setting', async ({ page }) => {
    await page.goto('/');
    await page.click('#settings-btn');
    
    // Change to katakana
    const kanaSetSelect = page.locator('#kana-set');
    await kanaSetSelect.selectOption('katakana');
    
    await page.click('#settings-close');
    
    // Start game and verify tokens spawn
    await page.click('#start');
    await page.waitForTimeout(1000);
    
    const tokens = page.locator('#tokens .token');
    expect(await tokens.count()).toBeGreaterThan(0);
  });

  test('should persist settings across page reloads', async ({ page }) => {
    await page.goto('/');
    await page.click('#settings-btn');
    
    // Change multiple settings
    await page.locator('#game-mode').selectOption('practice');
    await page.locator('#kana-set').selectOption('mixed');
    
    // Dakuten defaults to checked, so clicking unchecks it
    const dakuten = page.locator('#include-dakuten');
    const initialState = await dakuten.isChecked();
    await dakuten.click();
    
    await page.click('#settings-close');
    
    // Reload page
    await page.reload();
    
    // Verify settings persisted
    await page.click('#settings-btn');
    await expect(page.locator('#game-mode')).toHaveValue('practice');
    await expect(page.locator('#kana-set')).toHaveValue('mixed');
    
    // Dakuten should be in opposite state from initial
    const dakutenAfterReload = await dakuten.isChecked();
    expect(dakutenAfterReload).toBe(!initialState);
  });

  test('should adjust audio settings and persist them', async ({ page }) => {
    await page.goto('/');
    await page.click('#settings-btn');
    
    // Change volume
    const volumeSlider = page.locator('#music-volume');
    await volumeSlider.fill('75');
    await expect(page.locator('#music-volume-value')).toHaveText('75%');
    
    await page.click('#settings-close');
    
    // Reload and verify persistence
    await page.reload();
    await page.click('#settings-btn');
    await expect(volumeSlider).toHaveValue('75');
  });
});
