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
export const INPUT_ECHO_CLEAR_DELAY = 100 // ms to linger matched input before clearing echo

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

// Game engine constants
export const BASE_POINTS = 10
export const MAX_TIME_BONUS = 10
export const COMBO_MULTIPLIER = 0.05
export const DANGER_ZONE = 80 // pixels from bottom
export const TOKEN_WIDTH = 72 // pixels
export const SPAWN_MARGIN = 20 // pixels
export const MIN_TOKEN_DISTANCE = 100 // pixels
export const MAX_SPAWN_ATTEMPTS = 10

// Speed progression constants (challenge mode)
export const SPEED_INCREASE_INTERVAL = 15 // seconds
export const SPEED_BASE_EXPONENT = 1.08 // exponential base (8% growth per interval)
export const SPEED_CHANGE_DELAY = 1.0 // seconds to wait before first speed increase

// Unlock thresholds (based on correct answers)
export const UNLOCK_DAKUTEN_THRESHOLD = 10 // unlock after 10 correct answers
export const UNLOCK_YOON_THRESHOLD = 20 // unlock after 20 correct answers

// Spawn overlap detection
export const VERTICAL_OVERLAP_THRESHOLD = 150 // pixels

// Practice mode settings
export const PRACTICE_BASE_SPEED = 20 // pixels/sec
export const PRACTICE_MAX_TOKENS = 5
export const PRACTICE_SPAWN_INTERVAL = 1.8 // seconds (slower spawning for learning)

// Challenge mode settings
export const CHALLENGE_BASE_SPEED = 40 // pixels/sec (reduced from 60)
export const CHALLENGE_MAX_TOKENS = 8
export const CHALLENGE_SPAWN_INTERVAL = 1.2 // seconds (faster spawning for challenge)
