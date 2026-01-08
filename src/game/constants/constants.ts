// Game mode constants
export const GAME_MODE_PRACTICE = 'practice' as const
export const GAME_MODE_CHALLENGE = 'challenge' as const
export type GameMode = typeof GAME_MODE_PRACTICE | typeof GAME_MODE_CHALLENGE

// Kana set constants
export const KANA_SET_HIRAGANA = 'hiragana' as const
export const KANA_SET_KATAKANA = 'katakana' as const
export const KANA_SET_MIXED = 'mixed' as const
export type KanaSet = typeof KANA_SET_HIRAGANA | typeof KANA_SET_KATAKANA | typeof KANA_SET_MIXED

// Floating text types
export type FloatingTextType = 'points' | 'combo' | 'life' | 'speed'

// Dataset keys (keep this as it's used in multiple places)
export const DATASET_KANA_ID = 'kanaId'

// Game configuration
export const INITIAL_LIVES = 3

// Animation durations (ms)
export const ANIM_DURATION_STAT_HIGHLIGHT = 300
export const ANIM_DURATION_STAT_SHAKE = 400
export const ANIM_DURATION_SPEED_FLASH = 600
export const ANIM_DURATION_FLOATING_TEXT = 1000

// UI positioning and sizing
export const FLOATING_TEXT_OFFSET_X = 36 // pixels - horizontal offset for floating text
export const FLOATING_TEXT_OFFSET_Y = 36 // pixels - vertical offset for floating text
export const FLOATING_TEXT_COMBO_OFFSET_Y = 60 // pixels - vertical offset for combo text (below points)
export const GAME_AREA_WIDTH_MULTIPLIER = 0.6 // multiplier for calculating game area width from height

// Display formatting
export const SPEED_DISPLAY_DECIMAL_PLACES = 1 // decimal places for speed multiplier display
export const SPEED_INITIAL_DISPLAY = '1.0x' // initial speed display value
export const COMBO_DISPLAY_SUFFIX = 'x' // suffix for combo display

// UI styling (opacity and cursor states)
export const UI_DISABLED_OPACITY = '0.5'
export const UI_ENABLED_OPACITY = '1'
export const UI_CURSOR_NOT_ALLOWED = 'not-allowed'
export const UI_CURSOR_POINTER = 'pointer'

// High score display
export const HIGH_SCORE_RANK_PREFIX = '#' // prefix for rank display
export const HIGH_SCORE_LIST_START_INDEX = 1 // start index for rank numbering (1-based)
