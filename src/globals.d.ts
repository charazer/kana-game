// Global type declarations for window functions
declare global {
  interface Window {
    enablePauseButton?: () => void
    disablePauseButton?: () => void
    enableEndGameButton?: () => void
    disableEndGameButton?: () => void
  }
}

export {}
