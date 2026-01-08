/**
 * Centralized DOM element references
 * All DOM queries are performed here to keep them organized and maintainable
 */

import {
	DOM_ID_TOKENS,
	DOM_ID_SCORE,
	DOM_ID_COMBO,
	DOM_ID_SPEED,
	DOM_ID_LIVES,
	DOM_ID_GAME_MODE,
	DOM_ID_KANA_SET,
	DOM_ID_AUDIO_TOGGLE,
	DOM_ID_MUSIC_TOGGLE,
	DOM_ID_MUSIC_VOLUME,
	DOM_ID_INPUT_ECHO,
	DOM_ID_END_GAME,
	DOM_ID_PAUSE,
	DOM_ID_START_SCREEN,
	DOM_ID_START,
	DOM_ID_GAME_OVER,
	DOM_ID_FINAL_SCORE,
	DOM_ID_NEW_HIGH_SCORE,
	DOM_ID_HIGH_SCORES_START,
	DOM_ID_HIGH_SCORES_END,
	DOM_ID_RESTART
} from '../game/constants/constants'

// Game area elements
export const tokensLayer = document.getElementById(DOM_ID_TOKENS)!
export const pausedIndicator = document.getElementById('paused-indicator')!

// Stats display elements
export const scoreEl = document.getElementById(DOM_ID_SCORE)!
export const comboEl = document.getElementById(DOM_ID_COMBO)!
export const speedEl = document.getElementById(DOM_ID_SPEED)!
export const livesEl = document.getElementById(DOM_ID_LIVES)!

// Settings controls
export const gameModeSelect = document.getElementById(DOM_ID_GAME_MODE) as HTMLSelectElement | null
export const kanaSelect = document.getElementById(DOM_ID_KANA_SET) as HTMLSelectElement | null
export const musicToggle = document.getElementById(DOM_ID_MUSIC_TOGGLE) as HTMLInputElement | null
export const musicVolumeSlider = document.getElementById(DOM_ID_MUSIC_VOLUME) as HTMLInputElement | null
export const musicVolumeValue = document.getElementById('music-volume-value') as HTMLSpanElement | null
export const audioToggle = document.getElementById(DOM_ID_AUDIO_TOGGLE) as HTMLInputElement | null
export const includeDakutenToggle = document.getElementById('include-dakuten') as HTMLInputElement | null
export const includeYoonToggle = document.getElementById('include-yoon') as HTMLInputElement | null

// Input display
export const inputEcho = document.getElementById(DOM_ID_INPUT_ECHO)!

// Game control buttons
export const endGameBtn = document.getElementById(DOM_ID_END_GAME) as HTMLButtonElement | null
export const pauseBtn = document.getElementById(DOM_ID_PAUSE) as HTMLButtonElement | null
export const startBtn = document.getElementById(DOM_ID_START) as HTMLButtonElement | null
export const restartBtn = document.getElementById(DOM_ID_RESTART) as HTMLButtonElement | null

// Screen elements
export const startScreenEl = document.getElementById(DOM_ID_START_SCREEN)!
export const gameOverEl = document.getElementById(DOM_ID_GAME_OVER)!
export const finalScoreEl = document.getElementById(DOM_ID_FINAL_SCORE)!
export const newHighScoreEl = document.getElementById(DOM_ID_NEW_HIGH_SCORE)!
export const highScoresStartEl = document.getElementById(DOM_ID_HIGH_SCORES_START)!
export const highScoresEndEl = document.getElementById(DOM_ID_HIGH_SCORES_END)!

// Settings modal elements
export const settingsBtn = document.getElementById('settings-btn') as HTMLButtonElement | null
export const settingsModal = document.getElementById('settings-modal')!
export const settingsCloseBtn = document.getElementById('settings-close') as HTMLButtonElement | null
export const settingsModalOverlay = settingsModal.querySelector('.modal-overlay') as HTMLElement
export const activeGameNotice = document.getElementById('active-game-notice') as HTMLElement | null

// Help modal elements
export const howToPlayLink = document.getElementById('how-to-play-link') as HTMLAnchorElement | null
export const howToPlayLinkEnd = document.getElementById('how-to-play-link-end') as HTMLAnchorElement | null
export const helpModal = document.getElementById('help-modal')!
export const helpCloseBtn = document.getElementById('help-close') as HTMLButtonElement | null
export const helpModalOverlay = helpModal.querySelector('.modal-overlay') as HTMLElement

// Kana reference modal elements
export const openKanaReferenceBtn = document.getElementById('open-kana-reference') as HTMLButtonElement | null
export const kanaModal = document.getElementById('kana-modal')!
export const kanaCloseBtn = document.getElementById('kana-close') as HTMLButtonElement | null
export const kanaModalOverlay = kanaModal.querySelector('.modal-overlay') as HTMLElement
export const tabHiragana = document.getElementById('tab-hiragana') as HTMLButtonElement | null
export const tabKatakana = document.getElementById('tab-katakana') as HTMLButtonElement | null
export const kanaContent = document.getElementById('kana-content')!
