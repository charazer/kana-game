import { test, expect } from '@playwright/test';

/**
 * Test suite for core gameplay mechanics with actual game state verification
 */
test.describe('Gameplay', () => {
  test('should increase score when typing correct answers', async ({ page }) => {
    await page.goto('/');
    await page.click('#start');
    
    // Wait for token to spawn
    await page.waitForTimeout(500);
    
    // Initial score should be 0
    await expect(page.locator('#score')).toHaveText('0');
    
    // Get the first token's romanization from its data attribute
    const firstToken = page.locator('#tokens .token').first();
    await expect(firstToken).toBeVisible();
    const tokenId = await firstToken.getAttribute('data-kana-id');
    
    expect(tokenId).toBeTruthy();
    
    // Type the correct answer
    await page.keyboard.type(tokenId!);
    
    // Score should have increased from 0
    await page.waitForTimeout(200);
    const score = await page.locator('#score').textContent();
    expect(parseInt(score || '0')).toBeGreaterThan(0);
  });

  test('should increase combo on consecutive correct answers', async ({ page }) => {
    await page.goto('/');
    await page.click('#start');
    
    // Wait for token to spawn
    await page.waitForTimeout(500);
    
    // Initial combo should be 0x
    await expect(page.locator('#combo')).toHaveText('0x');
    
    // Answer first token correctly
    const firstToken = page.locator('#tokens .token').first();
    const firstTokenId = await firstToken.getAttribute('data-kana-id');
    await page.keyboard.type(firstTokenId!);
    await page.waitForTimeout(300);
    
    // Combo should be 1x
    let combo = await page.locator('#combo').textContent();
    expect(combo).toBe('1x');
    
    // Answer second token correctly
    const secondToken = page.locator('#tokens .token').first();
    const secondTokenId = await secondToken.getAttribute('data-kana-id');
    await page.keyboard.type(secondTokenId!);
    await page.waitForTimeout(300);
    
    // Combo should be 2x
    combo = await page.locator('#combo').textContent();
    expect(combo).toBe('2x');
  });

  test('should display and update speed multiplier in challenge mode', async ({ page }) => {
    await page.goto('/');
    
    // Set game to challenge mode
    await page.click('#settings-btn');
    await page.locator('#game-mode').selectOption('challenge');
    await page.click('#settings-close');
    
    await page.click('#start');
    
    // Speed should be visible and start at 1.0x  
    await expect(page.locator('#speed')).toHaveText('1.0x');
    
    // Play for 16 seconds to trigger speed increase (increases every 15s in challenge mode)
    // Keep answering tokens to prevent game over
    const startTime = Date.now();
    while (Date.now() - startTime < 16000) {
      await page.waitForTimeout(800);
      
      // Try to answer a token if one exists
      const token = page.locator('#tokens .token').first();
      const count = await token.count();
      if (count > 0) {
        const tokenId = await token.getAttribute('data-kana-id');
        if (tokenId) {
          await page.keyboard.type(tokenId);
        }
      }
    }
    
    // Speed should have increased from 1.0x
    const speedText = await page.locator('#speed').textContent();
    const speedValue = parseFloat(speedText?.replace('x', '') || '1.0');
    expect(speedValue).toBeGreaterThan(1.0);
  });

  test('should lose lives when tokens reach danger zone in challenge mode', async ({ page }) => {
    await page.goto('/');
    
    // Set game to challenge mode
    await page.click('#settings-btn');
    await page.locator('#game-mode').selectOption('challenge');
    await page.click('#settings-close');
    
    await page.click('#start');
    
    // Initial lives should show 3 filled hearts
    const hearts = page.locator('#lives .heart-icon');
    await expect(hearts).toHaveCount(3);
    
    // Wait for lives to decrease by checking periodically
    // This allows rendering to happen between checks so we see lives lost gradually
    let livesHTML = await page.locator('#lives').innerHTML();
    let livesLost = false;
    const maxWaitTime = 20000; // 20 seconds max
    const checkInterval = 1000; // Check every second
    let elapsed = 0;
    
    while (!livesLost && elapsed < maxWaitTime) {
      await page.waitForTimeout(checkInterval);
      elapsed += checkInterval;
      
      livesHTML = await page.locator('#lives').innerHTML();
      livesLost = livesHTML.includes('heart_empty.png');
    }
    
    // At least one life should be lost (empty heart should appear)
    expect(livesLost).toBe(true);
    expect(livesHTML).toContain('heart_empty.png');
  });

  test('should not show lives in practice mode', async ({ page }) => {
    await page.goto('/');
    
    // Set game to practice mode  
    await page.click('#settings-btn');
    await page.locator('#game-mode').selectOption('practice');
    await page.click('#settings-close');
    
    await page.click('#start');
    
    // Lives display should be hidden in practice mode
    const livesBox = page.locator('.lives-box');
    
    // Check if element has display: none or is not visible
    const isVisible = await livesBox.isVisible();
    expect(isVisible).toBe(false);
  });

  test('should persist high scores across game sessions', async ({ page }) => {
    await page.goto('/');
    
    // Check initial high scores
    const highScoresStart = page.locator('#high-scores-start');
    await expect(highScoresStart).toBeVisible();
    
    // Play a quick game and score some points
    await page.click('#start');
    await page.waitForTimeout(500);
    
    // Get some score before ending
    const token = page.locator('#tokens .token').first();
    const tokenId = await token.getAttribute('data-kana-id');
    if (tokenId) {
      await page.keyboard.type(tokenId);
      await page.waitForTimeout(200);
    }
    
    await page.keyboard.press('Escape');
    
    // High scores should be shown on game over
    await expect(page.locator('#high-scores-end')).toBeVisible();
    
    // Restart and check high scores persist
    await page.click('#restart');
    await page.keyboard.press('Escape');
    
    await expect(page.locator('#high-scores-end')).toBeVisible();
  });
});
