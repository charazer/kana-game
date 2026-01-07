import { exactMatch, longestRomajiMatch } from './matcher'
import type { KanaEntry } from './types'

describe('matcher', () => {
  describe('exactMatch', () => {
    it('should return false for empty buffer', () => {
      const entry: KanaEntry = { id: 'a', kana: 'あ', romaji: ['a'], type: 'hiragana' }
      expect(exactMatch(entry, '')).toBe(false)
    })

    it('should match exact kana character', () => {
      const entry: KanaEntry = { id: 'a', kana: 'あ', romaji: ['a'], type: 'hiragana' }
      expect(exactMatch(entry, 'あ')).toBe(true)
    })

    it('should match romaji', () => {
      const entry: KanaEntry = { id: 'ka', kana: 'か', romaji: ['ka'], type: 'hiragana' }
      expect(exactMatch(entry, 'ka')).toBe(true)
    })

    it('should match any romaji alternative', () => {
      const entry: KanaEntry = { id: 'shi', kana: 'し', romaji: ['shi', 'si'], type: 'hiragana' }
      expect(exactMatch(entry, 'shi')).toBe(true)
      expect(exactMatch(entry, 'si')).toBe(true)
    })

    it('should not match partial romaji', () => {
      const entry: KanaEntry = { id: 'ka', kana: 'か', romaji: ['ka'], type: 'hiragana' }
      expect(exactMatch(entry, 'k')).toBe(false)
    })

    it('should not match wrong input', () => {
      const entry: KanaEntry = { id: 'ka', kana: 'か', romaji: ['ka'], type: 'hiragana' }
      expect(exactMatch(entry, 'ta')).toBe(false)
    })
  })

  describe('longestRomajiMatch', () => {
    it('should return null for empty buffer', () => {
      const entries: KanaEntry[] = [
        { id: 'a', kana: 'あ', romaji: ['a'], type: 'hiragana' }
      ]
      expect(longestRomajiMatch(entries, '')).toBeNull()
    })

    it('should return null when no match found', () => {
      const entries: KanaEntry[] = [
        { id: 'a', kana: 'あ', romaji: ['a'], type: 'hiragana' }
      ]
      expect(longestRomajiMatch(entries, 'xyz')).toBeNull()
    })

    it('should match single romaji at start of buffer', () => {
      const entries: KanaEntry[] = [
        { id: 'ka', kana: 'か', romaji: ['ka'], type: 'hiragana' }
      ]
      const result = longestRomajiMatch(entries, 'ka')
      expect(result).not.toBeNull()
      expect(result?.entry.id).toBe('ka')
      expect(result?.romaji).toBe('ka')
    })

    it('should prefer match at start over match at end', () => {
      const entries: KanaEntry[] = [
        { id: 'ka', kana: 'か', romaji: ['ka'], type: 'hiragana' },
        { id: 'a', kana: 'あ', romaji: ['a'], type: 'hiragana' }
      ]
      const result = longestRomajiMatch(entries, 'ka')
      expect(result?.entry.id).toBe('ka')
    })

    it('should choose longest match when multiple matches at start', () => {
      const entries: KanaEntry[] = [
        { id: 'k', kana: 'k', romaji: ['k'], type: 'hiragana' },
        { id: 'ka', kana: 'か', romaji: ['ka'], type: 'hiragana' },
        { id: 'kya', kana: 'きゃ', romaji: ['kya'], type: 'hiragana' }
      ]
      const result = longestRomajiMatch(entries, 'kya')
      expect(result?.entry.id).toBe('kya')
      expect(result?.romaji).toBe('kya')
    })

    it('should handle buffer with extra characters', () => {
      const entries: KanaEntry[] = [
        { id: 'ka', kana: 'か', romaji: ['ka'], type: 'hiragana' }
      ]
      const result = longestRomajiMatch(entries, 'katana')
      expect(result?.entry.id).toBe('ka')
      expect(result?.romaji).toBe('ka')
    })

    it('should fall back to end match if no start match', () => {
      const entries: KanaEntry[] = [
        { id: 'ka', kana: 'か', romaji: ['ka'], type: 'hiragana' }
      ]
      const result = longestRomajiMatch(entries, 'xka')
      expect(result?.entry.id).toBe('ka')
    })

    it('should handle multiple romaji alternatives', () => {
      const entries: KanaEntry[] = [
        { id: 'shi', kana: 'し', romaji: ['shi', 'si'], type: 'hiragana' }
      ]
      const resultShi = longestRomajiMatch(entries, 'shi')
      expect(resultShi?.romaji).toBe('shi')
      
      const resultSi = longestRomajiMatch(entries, 'si')
      expect(resultSi?.romaji).toBe('si')
    })

    it('should prefer longer alternative when both match', () => {
      const entries: KanaEntry[] = [
        { id: 'tsu', kana: 'つ', romaji: ['tsu', 'tu'], type: 'hiragana' }
      ]
      const result = longestRomajiMatch(entries, 'tsu')
      expect(result?.romaji).toBe('tsu')
    })

    it('should work with chained input like "shika"', () => {
      const entries: KanaEntry[] = [
        { id: 'shi', kana: 'し', romaji: ['shi'], type: 'hiragana' },
        { id: 'ka', kana: 'か', romaji: ['ka'], type: 'hiragana' }
      ]
      // First should match "shi"
      const result1 = longestRomajiMatch(entries, 'shika')
      expect(result1?.romaji).toBe('shi')
      
      // After consuming "shi", should match "ka"
      const result2 = longestRomajiMatch(entries, 'ka')
      expect(result2?.romaji).toBe('ka')
    })
  })
})
