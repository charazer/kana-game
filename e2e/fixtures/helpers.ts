/**
 * Test helper functions for common E2E actions
 */

import { type Page, expect } from '@playwright/test';
import { Selectors } from './selectors';

/**
 * Navigates to the game and waits for it to be ready
 */
export async function navigateToGame(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page).toHaveTitle(/Kana Game/);
}

/**
 * Starts the game by clicking the start button
 */
export async function startGame(page: Page): Promise<void> {
  await page.click(Selectors.startButton);
  await expect(page.locator(Selectors.startScreen)).toBeHidden();
}

/**
 * Opens the settings modal
 */
export async function openSettings(page: Page): Promise<void> {
  await page.click(Selectors.settingsButton);
  await expect(page.locator(Selectors.settingsModal)).toBeVisible();
}

/**
 * Closes the settings modal
 */
export async function closeSettings(page: Page): Promise<void> {
  await page.click(Selectors.settingsClose);
  await expect(page.locator(Selectors.settingsModal)).toHaveClass(/hidden/);
}

/**
 * Changes the game mode setting
 */
export async function setGameMode(page: Page, mode: 'practice' | 'challenge'): Promise<void> {
  await openSettings(page);
  await page.locator(Selectors.gameModeSelect).selectOption(mode);
  await closeSettings(page);
}

/**
 * Changes the kana set setting
 */
export async function setKanaSet(page: Page, kanaSet: 'hiragana' | 'katakana' | 'mixed'): Promise<void> {
  await openSettings(page);
  await page.locator(Selectors.kanaSetSelect).selectOption(kanaSet);
  await closeSettings(page);
}

/**
 * Pauses the game
 */
export async function pauseGame(page: Page): Promise<void> {
  await page.click(Selectors.pauseButton);
  await expect(page.locator(Selectors.pausedIndicator)).toBeVisible();
}

/**
 * Resumes the game
 */
export async function resumeGame(page: Page): Promise<void> {
  await page.click(Selectors.pauseButton);
  await expect(page.locator(Selectors.pausedIndicator)).toHaveClass(/hidden/);
}

/**
 * Gets the first visible token and returns its kana-id attribute
 */
export async function getFirstTokenId(page: Page): Promise<string | null> {
  const firstToken = page.locator(Selectors.tokens).first();
  await expect(firstToken).toBeVisible();
  return firstToken.getAttribute('data-kana-id');
}

/**
 * Types the correct answer for the first token
 */
export async function answerFirstToken(page: Page): Promise<void> {
  const tokenId = await getFirstTokenId(page);
  if (tokenId) {
    await page.keyboard.type(tokenId);
  }
}
