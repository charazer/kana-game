import { test, expect } from '@playwright/test';
import { SPEED_INCREASE_INTERVAL } from '../src/game/constants/constants';
import { Selectors } from './fixtures/selectors';
import { navigateToGame, startGame, setGameMode, answerFirstToken, getFirstTokenId } from './fixtures/helpers';

/**
 * Test suite for core gameplay mechanics with actual game state verification
 */
test.describe('Gameplay', () => {
  test('should increase score when typing correct answers', async ({ page }) => {
    await navigateToGame(page);
    await startGame(page);
    
    // Initial score should be 0
    await expect(page.locator(Selectors.score)).toHaveText('0');
    
    // Answer the first token
    await answerFirstToken(page);
    
    // Score should have increased from 0
    await expect(page.locator(Selectors.score)).not.toHaveText('0');
  });

  test('should increase combo on consecutive correct answers', async ({ page }) => {
    await navigateToGame(page);
    await startGame(page);
    
    // Wait for first token to be visible
    await page.locator(Selectors.tokens).first().waitFor({ state: 'visible' });
    
    // Initial combo should be 0x
    await expect(page.locator(Selectors.combo)).toHaveText('0x');
    
    // Answer first token correctly
    const firstTokenId = await getFirstTokenId(page);
    if (!firstTokenId) throw new Error('No token found');
    await page.keyboard.type(firstTokenId);
    
    // Wait for combo to update to 1x
    await expect(page.locator(Selectors.combo)).toHaveText('1x');
    
    // Wait for game to process answer and spawn new token
    // This is necessary due to game timing - answering too quickly
    // can result in answering the same token twice
    await page.waitForTimeout(300);
    
    // Answer second token correctly
    const secondTokenId = await getFirstTokenId(page);
    if (!secondTokenId) throw new Error('No token found');
    await page.keyboard.type(secondTokenId);
    
    // Combo should be 2x (assertion will wait for update)
    await expect(page.locator(Selectors.combo)).toHaveText('2x');
  });

  test('should display and update speed multiplier in challenge mode', async ({ page }) => {
    await navigateToGame(page);
    await setGameMode(page, 'challenge');
    
    // Install fake timers after page setup but before starting game
    await page.clock.install({ time: 0 });
    
    await startGame(page);
    
    // Speed should be visible and start at 1.0x  
    await expect(page.locator(Selectors.speed)).toHaveText('1.0x');
    
    // Fast-forward past the speed increase interval using fake timers
    const secondsToAdvance = SPEED_INCREASE_INTERVAL + 1;
    for (let i = 0; i < secondsToAdvance; i++) {
      await page.clock.runFor(1000);
      
      // Answer tokens every couple iterations to keep game alive
      if (i % 2 === 0) {
        const token = page.locator(Selectors.tokens).first();
        const tokenId = await token.getAttribute('data-kana-id');
        if (tokenId) {
          await page.keyboard.type(tokenId);
        }
      }
    }
    
    // Speed should have increased from 1.0x
    await expect(page.locator(Selectors.speed)).not.toHaveText('1.0x');
  });

  test('should lose lives when tokens reach danger zone in challenge mode', async ({ page }) => {
    await navigateToGame(page);
    await setGameMode(page, 'challenge');
    
    // Install fake timers after page setup but before starting game
    await page.clock.install({ time: 0 });
    
    await startGame(page);
    
    // Initial lives should show 3 filled hearts
    const hearts = page.locator(`${Selectors.lives} ${Selectors.heartIcon}`);
    await expect(hearts).toHaveCount(3);
    
    // Fast-forward time while checking for life loss
    const emptyHeart = page.locator(`${Selectors.lives} ${Selectors.emptyHeart}`).first();
    
    for (let i = 0; i < 20; i++) {
      await page.clock.runFor(1000);
      // Check periodically to reduce overhead
      if (i % 2 === 0 && await emptyHeart.isVisible()) {
        break;
      }
    }
    
    // At least one life should be lost
    await expect(emptyHeart).toBeVisible();
  });

  test('should not show lives in practice mode', async ({ page }) => {
    await navigateToGame(page);
    await setGameMode(page, 'practice');
    
    await startGame(page);
    
    // Lives display should be hidden in practice mode
    const livesBox = page.locator(Selectors.livesBox);
    await expect(livesBox).not.toBeVisible();
  });

  test('should persist high scores across game sessions', async ({ page }) => {
    await navigateToGame(page);
    
    // Check initial high scores
    await expect(page.locator(Selectors.highScoresStart)).toBeVisible();
    
    // Play a quick game and score some points
    await startGame(page);
    
    // Answer a token and wait for score to update
    const tokenId = await getFirstTokenId(page);
    if (tokenId) {
      await page.keyboard.type(tokenId);
      await expect(page.locator(Selectors.score)).not.toHaveText('0');
    }
    
    await page.keyboard.press('Escape');
    await expect(page.locator(Selectors.confirmEndModal)).toBeVisible();
    await page.keyboard.press('y');

    // High scores should be shown on game over
    await expect(page.locator(Selectors.highScoresEnd)).toBeVisible();
    
    // Restart and check high scores persist
    await page.click(Selectors.restartButton);
    await page.keyboard.press('Escape');
    await expect(page.locator(Selectors.confirmEndModal)).toBeVisible();
    await page.keyboard.press('y');

    await expect(page.locator(Selectors.highScoresEnd)).toBeVisible();
  });
});
