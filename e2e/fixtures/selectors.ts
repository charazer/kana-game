/**
 * Centralized selectors for E2E tests
 * All DOM element selectors used across test files
 */

export const Selectors = {
  // Start screen
  startScreen: '#start-screen',
  startButton: '#start',
  
  // Game controls
  pauseButton: '#pause',
  endGameButton: '#end-game',
  restartButton: '#restart',
  
  // Settings
  settingsButton: '#settings-btn',
  settingsModal: '#settings-modal',
  settingsClose: '#settings-close',
  settingsOverlay: '#settings-modal-overlay',
  gameModeSelect: '#game-mode',
  kanaSetSelect: '#kana-set',
  includeDakuten: '#include-dakuten',
  musicVolume: '#music-volume',
  musicVolumeValue: '#music-volume-value',
  
  // Game state
  score: '#score',
  combo: '#combo',
  speed: '#speed',
  lives: '#lives',
  livesBox: '.lives-box',
  heartIcon: '.heart-icon',
  emptyHeart: '.heart-icon[src*="heart_empty"]',
  pausedIndicator: '#paused-indicator',
  
  // Game area
  tokens: '#tokens .token',
  inputEcho: '#input-echo',
  
  // End screens
  gameOver: '#game-over',
  highScoresStart: '#high-scores-start',
  highScoresEnd: '#high-scores-end',

  // Confirm end game modal
  confirmEndModal: '#confirm-end-modal',
  confirmEndYes: '#confirm-end-yes',
  confirmEndNo: '#confirm-end-no',
} as const;
