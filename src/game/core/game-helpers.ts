/**
 * Game logic helpers
 */

import type { KanaEntry } from './types'
import { exactMatch, longestRomajiMatch } from './matcher'

/** Unique key per kana entry, distinguishing hiragana/katakana with same romaji id */
export function kanaKey(entry: KanaEntry): string {
  return `${entry.type}-${entry.id}`
}

/** Find and consume a matching token from the input buffer */
export function findTokenMatch(
  tokens: Array<{ entry: KanaEntry }>,
  buffer: string
): { tokenIndex: number; matchType: 'romaji' | 'exact'; matchedLength?: number } | null {
  // Try longest romaji match first (supports chaining like "shika" -> "shi" + "ka")
  const best = longestRomajiMatch(tokens.map(t => t.entry), buffer)
  if (best) {
    const idx = tokens.findIndex(t => t.entry.id === best.entry.id)
    if (idx >= 0) {
      return { tokenIndex: idx, matchType: 'romaji', matchedLength: best.romaji.length }
    }
  }
  
  // Fallback: try exact kana match (for IME input)
  const matchIndex = tokens.findIndex(t => exactMatch(t.entry, buffer))
  if (matchIndex >= 0) {
    return { tokenIndex: matchIndex, matchType: 'exact' }
  }
  
  return null
}
