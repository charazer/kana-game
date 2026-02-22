import { vi } from 'vitest'
import { findTokenMatch, kanaKey } from './game-helpers'
import * as matcherModule from './matcher'
import type { KanaEntry } from './types'

function makeEntry(id: string, kana: string, romaji: string[]): KanaEntry {
  return { id, kana, romaji, type: 'hiragana' }
}

describe('game-helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ─── kanaKey ──────────────────────────────────────────────────────────────

  describe('kanaKey', () => {
    it('should produce a key combining type and id', () => {
      const entry: KanaEntry = { id: 'ka', kana: 'か', romaji: ['ka'], type: 'hiragana' }
      expect(kanaKey(entry)).toBe('hiragana-ka')
    })

    it('should differentiate hiragana and katakana with same id', () => {
      const h: KanaEntry = { id: 'a', kana: 'あ', romaji: ['a'], type: 'hiragana' }
      const k: KanaEntry = { id: 'a', kana: 'ア', romaji: ['a'], type: 'katakana' }
      expect(kanaKey(h)).not.toBe(kanaKey(k))
    })
  })

  // ─── findTokenMatch ───────────────────────────────────────────────────────

  describe('findTokenMatch', () => {
    it('should return null for an empty token list', () => {
      expect(findTokenMatch([], 'ka')).toBeNull()
    })

    it('should return null when nothing matches', () => {
      const tokens = [{ entry: makeEntry('ka', 'か', ['ka']) }]
      expect(findTokenMatch(tokens, 'xyz')).toBeNull()
    })

    it('should return romaji match with correct tokenIndex and matchedLength', () => {
      const tokens = [
        { entry: makeEntry('a', 'あ', ['a']) },
        { entry: makeEntry('ka', 'か', ['ka']) }
      ]
      const result = findTokenMatch(tokens, 'ka')
      expect(result).not.toBeNull()
      expect(result?.tokenIndex).toBe(1)
      expect(result?.matchType).toBe('romaji')
      expect(result?.matchedLength).toBe(2)
    })

    it('should return exact kana match when no romaji match is found', () => {
      const tokens = [{ entry: makeEntry('a', 'あ', ['a']) }]
      const result = findTokenMatch(tokens, 'あ')
      expect(result?.matchType).toBe('exact')
      expect(result?.tokenIndex).toBe(0)
    })

    it('should prefer romaji match over exact match', () => {
      const tokens = [{ entry: makeEntry('a', 'あ', ['a']) }]
      const result = findTokenMatch(tokens, 'a')
      expect(result?.matchType).toBe('romaji')
    })

    it('should fall back to exact match when romaji match refers to an unknown token id', () => {
      // Simulate longestRomajiMatch returning an entry whose id doesn't exist in tokens.
      // This exercises the idx < 0 branch inside findTokenMatch.
      vi.spyOn(matcherModule, 'longestRomajiMatch').mockReturnValueOnce({
        entry: makeEntry('ghost', 'X', ['x']),
        romaji: 'x'
      })

      const tokens = [{ entry: makeEntry('a', 'あ', ['a']) }]
      // The exact match on 'あ' should be picked up as fallback
      const result = findTokenMatch(tokens, 'あ')

      expect(result?.matchType).toBe('exact')
      expect(result?.tokenIndex).toBe(0)
    })

    it('should return null when both romaji and exact matches fail', () => {
      vi.spyOn(matcherModule, 'longestRomajiMatch').mockReturnValueOnce({
        entry: makeEntry('ghost', 'X', ['x']),
        romaji: 'x'
      })

      const tokens = [{ entry: makeEntry('ka', 'か', ['ka']) }]
      // Buffer does not match 'ka' exactly via kana or romaji
      const result = findTokenMatch(tokens, 'xyz')

      expect(result).toBeNull()
    })

    it('should find the first matching token by index', () => {
      const tokens = [
        { entry: makeEntry('ka', 'か', ['ka']) },
        { entry: makeEntry('sa', 'さ', ['sa']) },
        { entry: makeEntry('ta', 'た', ['ta']) }
      ]
      const result = findTokenMatch(tokens, 'sa')
      expect(result?.tokenIndex).toBe(1)
    })
  })
})
