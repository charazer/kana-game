/**
 * Test utilities for creating test fixtures
 */
import type { KanaEntry } from './core/types'

/**
 * Creates a test KanaEntry with sensible defaults for testing
 */
export function createTestKana(partial: Omit<KanaEntry, 'type'> & { type?: KanaEntry['type'] }): KanaEntry {
  return {
    type: 'hiragana',
    ...partial
  }
}

/**
 * Creates a test hiragana KanaEntry
 */
export function createHiragana(id: string, kana: string, romaji: string[]): KanaEntry {
  return { id, kana, romaji, type: 'hiragana' }
}

/**
 * Creates a test katakana KanaEntry
 */
export function createKatakana(id: string, kana: string, romaji: string[]): KanaEntry {
  return { id, kana, romaji, type: 'katakana' }
}
