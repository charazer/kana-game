// Game area elements
export const gameArea = document.getElementById('game-area')
export const tokensLayer = document.getElementById('tokens')!
export const pausedIndicator = document.getElementById('paused-indicator')!

// Stats display elements
export const scoreEl = document.getElementById('score')!
export const comboEl = document.getElementById('combo')!
export const speedEl = document.getElementById('speed')!
export const livesEl = document.getElementById('lives')!

// Settings controls
export const gameModeSelect = document.getElementById('game-mode') as HTMLSelectElement | null
export const kanaSelect = document.getElementById('kana-set') as HTMLSelectElement | null
export const musicToggle = document.getElementById('music-toggle') as HTMLInputElement | null
export const musicVolumeSlider = document.getElementById('music-volume') as HTMLInputElement | null
export const musicVolumeValue = document.getElementById('music-volume-value') as HTMLSpanElement | null
export const audioToggle = document.getElementById('audio-toggle') as HTMLInputElement | null
export const includeDakutenToggle = document.getElementById('include-dakuten') as HTMLInputElement | null
export const includeYoonToggle = document.getElementById('include-yoon') as HTMLInputElement | null

// Input display
export const mobileInput = document.getElementById('mobile-input') as HTMLInputElement | null
export const inputEcho = document.getElementById('input-echo')!

// Game control buttons
export const endGameBtn = document.getElementById('end-game') as HTMLButtonElement | null
export const pauseBtn = document.getElementById('pause') as HTMLButtonElement | null
export const startBtn = document.getElementById('start') as HTMLButtonElement | null
export const restartBtn = document.getElementById('restart') as HTMLButtonElement | null

// Screen elements
export const startScreenEl = document.getElementById('start-screen')!
export const gameOverEl = document.getElementById('game-over')!
export const finalScoreEl = document.getElementById('final-score')!
export const newHighScoreEl = document.getElementById('new-high-score')!
export const highScoresStartEl = document.getElementById('high-scores-start')!
export const highScoresEndEl = document.getElementById('high-scores-end')!

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

// Confirm end game modal elements
export const confirmEndModal = document.getElementById('confirm-end-modal')!
export const confirmEndYesBtn = document.getElementById('confirm-end-yes') as HTMLButtonElement | null
export const confirmEndNoBtn = document.getElementById('confirm-end-no') as HTMLButtonElement | null
