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

// Dataset keys
export const DATASET_KANA_ID = 'kanaId'

// Game configuration
export const INITIAL_LIVES = 3

// Animation durations (ms)
export const ANIM_DURATION_STAT_HIGHLIGHT = 300
export const ANIM_DURATION_STAT_SHAKE = 400
export const ANIM_DURATION_SPEED_FLASH = 600
export const INPUT_ECHO_CLEAR_DELAY = 100

// UI positioning and sizing
export const FLOATING_TEXT_OFFSET_X = 36
export const FLOATING_TEXT_OFFSET_Y = 36
export const FLOATING_TEXT_COMBO_OFFSET_Y = 60
export const GAME_AREA_WIDTH_MULTIPLIER = 0.6



// Game engine constants
export const BASE_POINTS = 10
export const MAX_TIME_BONUS = 10
export const COMBO_MULTIPLIER = 0.05
export const DANGER_ZONE = 80
export const TOKEN_WIDTH = 72
export const SPAWN_MARGIN = 20
export const MIN_TOKEN_DISTANCE = 100
export const MAX_SPAWN_ATTEMPTS = 10

// Speed progression (challenge mode)
export const SPEED_INCREASE_INTERVAL = 15
export const SPEED_BASE_EXPONENT = 1.08
export const SPEED_CHANGE_DELAY = 1.0

// Unlock thresholds (correct answers required)
export const UNLOCK_DAKUTEN_THRESHOLD = 10
export const UNLOCK_YOON_THRESHOLD = 20

// Spawn overlap detection
export const VERTICAL_OVERLAP_THRESHOLD = 150

// Practice mode
export const PRACTICE_BASE_SPEED = 20
export const PRACTICE_MAX_TOKENS = 5
export const PRACTICE_SPAWN_INTERVAL = 1.8

// Challenge mode
export const CHALLENGE_BASE_SPEED = 40
export const CHALLENGE_MAX_TOKENS = 8
export const CHALLENGE_SPAWN_INTERVAL = 1.2
