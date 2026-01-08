export type KanaEntry = {
  id: string
  kana: string
  romaji: string[]
  type: 'hiragana'|'katakana'
  audio?: string
}
