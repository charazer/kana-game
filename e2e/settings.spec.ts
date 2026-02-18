import { test, expect } from '@playwright/test';
import { Selectors } from './fixtures/selectors';
import { navigateToGame, openSettings, closeSettings, startGame } from './fixtures/helpers';

/**
 * Test suite for settings configuration flows
 */
test.describe('Settings', () => {
  test('should open, configure, and close settings modal flow', async ({ page }) => {
    await navigateToGame(page);    
    
    // Open settings
    await openSettings(page);
    
    // Change a setting
    const gameModeSelect = page.locator(Selectors.gameModeSelect);
    await gameModeSelect.selectOption('practice');
    await expect(gameModeSelect).toHaveValue('practice');
    
    // Close modal
    await closeSettings(page);
    
    // Setting should persist when reopening
    await openSettings(page);
    await expect(gameModeSelect).toHaveValue('practice');
  });

  test('should change kana set and start game with new setting', async ({ page }) => {
    await navigateToGame(page);
    await openSettings(page);
    
    // Change to katakana
    const kanaSetSelect = page.locator(Selectors.kanaSetSelect);
    await kanaSetSelect.selectOption('katakana');
    
    await closeSettings(page);
    
    // Start game and verify tokens spawn
    await startGame(page);
    
    const tokens = page.locator(Selectors.tokens);
    await expect(tokens.first()).toBeVisible();
    expect(await tokens.count()).toBeGreaterThan(0);
  });

  test('should persist settings across page reloads', async ({ page }) => {
    await navigateToGame(page);
    await openSettings(page);
    
    // Change multiple settings
    await page.locator(Selectors.gameModeSelect).selectOption('practice');
    await page.locator(Selectors.kanaSetSelect).selectOption('mixed');
    
    // Dakuten defaults to checked, so clicking unchecks it
    const dakuten = page.locator(Selectors.includeDakuten);
    const initialState = await dakuten.isChecked();
    await dakuten.click();
    
    await closeSettings(page);
    
    // Reload page
    await page.reload();
    
    // Verify settings persisted
    await openSettings(page);
    await expect(page.locator(Selectors.gameModeSelect)).toHaveValue('practice');
    await expect(page.locator(Selectors.kanaSetSelect)).toHaveValue('mixed');
    
    // Dakuten should be in opposite state from initial
    const dakutenAfterReload = await dakuten.isChecked();
    expect(dakutenAfterReload).toBe(!initialState);
  });

  test('should adjust audio settings and persist them', async ({ page }) => {
    await navigateToGame(page);
    await openSettings(page);
    
    // Change volume
    const volumeSlider = page.locator(Selectors.musicVolume);
    await volumeSlider.fill('75');
    await expect(page.locator(Selectors.musicVolumeValue)).toHaveText('75%');
    
    await closeSettings(page);
    
    // Reload and verify persistence
    await page.reload();
    await openSettings(page);
    await expect(volumeSlider).toHaveValue('75');
  });
});
