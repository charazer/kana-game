// Game mode constants
export const GAME_MODE_PRACTICE = 'practice' as const
export const GAME_MODE_CHALLENGE = 'challenge' as const
export type GameMode = typeof GAME_MODE_PRACTICE | typeof GAME_MODE_CHALLENGE

// Kana set constants
export const KANA_SET_HIRAGANA = 'hiragana' as const
export const KANA_SET_KATAKANA = 'katakana' as const
export type KanaSet = typeof KANA_SET_HIRAGANA | typeof KANA_SET_KATAKANA

// Floating text types
export const FLOAT_TYPE_POINTS = 'points' as const
export const FLOAT_TYPE_COMBO = 'combo' as const
export const FLOAT_TYPE_LIFE = 'life' as const
export const FLOAT_TYPE_SPEED = 'speed' as const
export type FloatingTextType = typeof FLOAT_TYPE_POINTS | typeof FLOAT_TYPE_COMBO | typeof FLOAT_TYPE_LIFE | typeof FLOAT_TYPE_SPEED

// CSS class names
export const CSS_CLASS_TOKEN = 'token'
export const CSS_CLASS_TOKEN_SUCCESS = 'token-success'
export const CSS_CLASS_TOKEN_MISS = 'token-miss'
export const CSS_CLASS_FLOATING_TEXT = 'floating-text'
export const CSS_CLASS_STAT_HIGHLIGHT = 'stat-highlight'
export const CSS_CLASS_STAT_SHAKE = 'stat-shake'
export const CSS_CLASS_SPEED_FLASH = 'speed-flash'
export const CSS_CLASS_HIDDEN = 'hidden'

// DOM element IDs
export const DOM_ID_TOKENS = 'tokens'
export const DOM_ID_SCORE = 'score'
export const DOM_ID_COMBO = 'combo'
export const DOM_ID_SPEED = 'speed'
export const DOM_ID_LIVES = 'lives'
export const DOM_ID_GAME_MODE = 'game-mode'
export const DOM_ID_KANA_SET = 'kana-set'
export const DOM_ID_AUDIO_TOGGLE = 'audio-toggle'
export const DOM_ID_INPUT_ECHO = 'input-echo'
export const DOM_ID_END_GAME = 'end-game'
export const DOM_ID_PAUSE = 'pause'
export const DOM_ID_START_SCREEN = 'start-screen'
export const DOM_ID_START = 'start'
export const DOM_ID_GAME_OVER = 'game-over'
export const DOM_ID_FINAL_SCORE = 'final-score'
export const DOM_ID_NEW_HIGH_SCORE = 'new-high-score'
export const DOM_ID_HIGH_SCORES_START = 'high-scores-start'
export const DOM_ID_HIGH_SCORES_END = 'high-scores-end'
export const DOM_ID_RESTART = 'restart'
export const DOM_ID_GAME_AREA = 'game-area'

// Dataset keys
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
