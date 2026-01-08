/**
 * Game controls
 * Handles pause, end game, start, and restart functionality
 */

import type { GameEngine } from '../game/core/engine'
import type { AudioManager } from '../game/audio/audio'
import {
	SPEED_INITIAL_DISPLAY
} from '../game/constants/constants'
import { DOMBuilder, ButtonTemplates } from '../game/ui/templates'
import { enableElement, disableElement } from '../game/ui/dom-helpers'
import {
	pauseBtn,
	pausedIndicator,
	endGameBtn,
	startBtn,
	startScreenEl,
	restartBtn,
	gameOverEl,
	speedEl,
	musicToggle
} from './dom-elements'
import { disableGameSettings } from './settings'

/**
 * Initializes the pause button
 */
export function initializePauseButton(engine: GameEngine, audio: AudioManager) {
	if (!pauseBtn) return

	let isPaused = false
	let gameStarted = false

	// Disable pause button initially
	disableElement(pauseBtn)

	pauseBtn.addEventListener('click', () => {
		if (!gameStarted) return // Don't allow pause before game starts

		isPaused = !isPaused
		if (isPaused) {
			engine.pause()
			audio.playPause()
			pausedIndicator.classList.remove('hidden')
			if (pauseBtn) DOMBuilder.updateButton(pauseBtn, ButtonTemplates.resume)
		} else {
			engine.resume()
			audio.playResume()
			pausedIndicator.classList.add('hidden')
			if (pauseBtn) DOMBuilder.updateButton(pauseBtn, ButtonTemplates.pause)
		}
	})

	// Export function to enable pause button when game starts
	window.enablePauseButton = () => {
		gameStarted = true
		isPaused = false
		pausedIndicator.classList.add('hidden')
		enableElement(pauseBtn)
		if (pauseBtn) DOMBuilder.updateButton(pauseBtn, ButtonTemplates.pause)
	}

	// Export function to disable pause button when game ends
	window.disablePauseButton = () => {
		gameStarted = false
		isPaused = false
		disableElement(pauseBtn)
		if (pauseBtn) DOMBuilder.updateButton(pauseBtn, ButtonTemplates.pause)
	}
}

/**
 * Initializes the end game button
 */
export function initializeEndGameButton(engine: GameEngine, _audio: AudioManager) {
	if (!endGameBtn) return

	// Disable end game button initially
	disableElement(endGameBtn)

	endGameBtn.addEventListener('click', () => {
		// Only allow ending if button is enabled (which means game is running)
		if (!endGameBtn || endGameBtn.disabled) return

		// Hide paused indicator and resume if paused
		pausedIndicator.classList.add('hidden')
		engine.resume()

		// Stop the game and trigger game over
		engine.running = false
		engine.onGameOver()
	})

	// Export function to enable end game button
	window.enableEndGameButton = () => {
		enableElement(endGameBtn)
	}

	// Export function to disable end game button
	window.disableEndGameButton = () => {
		disableElement(endGameBtn)
	}
}

/**
 * Initializes the start button
 */
export function initializeStartButton(engine: GameEngine, audio: AudioManager) {
	if (!startBtn) return

	startBtn.addEventListener('click', () => {
		startScreenEl.classList.add('hidden')
		speedEl.textContent = SPEED_INITIAL_DISPLAY
		if (window.enablePauseButton) window.enablePauseButton()
		if (window.enableEndGameButton) window.enableEndGameButton()
		disableGameSettings()
		audio.playGameStart()
		// Start music if enabled (requires user interaction for autoplay policy)
		if (musicToggle?.checked) {
			audio.setMusicEnabled(true)
		}
		engine.start()
	})
}

/**
 * Initializes the restart button
 */
export function initializeRestartButton(engine: GameEngine, audio: AudioManager) {
	if (!restartBtn) return

	restartBtn.addEventListener('click', () => {
		gameOverEl.classList.add('hidden')
		speedEl.textContent = SPEED_INITIAL_DISPLAY
		engine.reset()
		if (window.enablePauseButton) window.enablePauseButton()
		if (window.enableEndGameButton) window.enableEndGameButton()
		disableGameSettings()
		audio.playGameStart()
		// Resume music if enabled
		if (musicToggle?.checked) {
			audio.setMusicEnabled(true)
		}
		engine.start()
	})
}

/**
 * Initializes keyboard shortcuts for game controls
 */
export function initializeKeyboardShortcuts(engine: GameEngine) {
	document.addEventListener('keydown', (e) => {
		// Enter for start/restart (only when game is not running)
		if (e.code === 'Enter' && !engine.running) {
			// Check if start screen is visible
			if (!startScreenEl.classList.contains('hidden') && startBtn) {
				e.preventDefault()
				startBtn.click()
			}
			// Check if game over screen is visible
			else if (!gameOverEl.classList.contains('hidden') && restartBtn) {
				e.preventDefault()
				restartBtn.click()
			}
		}

		// Space for pause/resume (only when game is running)
		if (e.code === 'Space' && pauseBtn && !pauseBtn.disabled) {
			e.preventDefault() // Prevent page scroll
			pauseBtn.click()
		}

		// Escape for end game (only when game is running)
		if (e.code === 'Escape' && endGameBtn && !endGameBtn.disabled) {
			e.preventDefault()
			endGameBtn.click()
		}
	})
}

// Type declarations for window functions
declare global {
	interface Window {
		enablePauseButton?: () => void
		disablePauseButton?: () => void
		enableEndGameButton?: () => void
		disableEndGameButton?: () => void
	}
}
