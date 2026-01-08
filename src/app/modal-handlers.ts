/**
 * Modal handlers
 * Manages settings, help, and kana reference modals
 */

import type { GameEngine } from '../game/core/engine'
import type { AudioManager } from '../game/audio/audio'
import { setupModalHandlers } from '../game/ui/dom-helpers'
import { DOMBuilder, ButtonTemplates } from '../game/ui/templates'
import {
	settingsBtn,
	settingsModal,
	settingsCloseBtn,
	settingsModalOverlay,
	activeGameNotice,
	helpModal,
	helpCloseBtn,
	helpModalOverlay,
	howToPlayLink,
	howToPlayLinkEnd,
	kanaModal,
	kanaCloseBtn,
	kanaModalOverlay,
	openKanaReferenceBtn,
	tabHiragana,
	tabKatakana,
	endGameBtn,
	pauseBtn,
	pausedIndicator
} from './dom-elements'
import { renderKanaReference, updateKanaScrollIndicators } from './ui-helpers'

/**
 * Initializes the settings modal
 */
export function initializeSettingsModal(engine: GameEngine, audio: AudioManager) {
	if (!settingsBtn || !settingsModal) return

	// Track if we auto-paused the game when opening settings
	let autoPausedGame = false

	// Open modal
	settingsBtn.addEventListener('click', () => {
		settingsModal.classList.remove('hidden')
		// Show/hide active game notice and auto-pause if needed
		if (activeGameNotice) {
			// Check if game is in progress (end game button is enabled)
			const gameInProgress = endGameBtn && !endGameBtn.disabled
			if (gameInProgress) {
				activeGameNotice.classList.remove('hidden')
				// Auto-pause the game if it's running
				if (engine.running) {
					engine.pause()
					audio.playPause()
					pausedIndicator.classList.remove('hidden')
					autoPausedGame = true
					// Update pause button to show resume state
					if (pauseBtn) {
						DOMBuilder.updateButton(pauseBtn, ButtonTemplates.resume)
					}
				}
			} else {
				activeGameNotice.classList.add('hidden')
				autoPausedGame = false
			}
		}
	})

	// Helper to close modal and resume if needed
	const closeSettingsModal = () => {
		settingsModal.classList.add('hidden')
		// Resume game if we auto-paused it
		if (autoPausedGame) {
			engine.resume()
			audio.playResume()
			pausedIndicator.classList.add('hidden')
			autoPausedGame = false
			// Update pause button to show pause state
			if (pauseBtn) {
				DOMBuilder.updateButton(pauseBtn, ButtonTemplates.pause)
			}
		}
	}

	// Close modal - close button
	if (settingsCloseBtn) {
		settingsCloseBtn.addEventListener('click', closeSettingsModal)
	}

	// Close modal - overlay click
	if (settingsModalOverlay) {
		settingsModalOverlay.addEventListener('click', closeSettingsModal)
	}
}

/**
 * Initializes the help modal
 */
export function initializeHelpModal() {
	// Help modal handlers
	if (howToPlayLink) {
		howToPlayLink.addEventListener('click', (e) => {
			e.preventDefault()
			helpModal.classList.remove('hidden')
		})
	}

	// Help modal handler for game over screen
	if (howToPlayLinkEnd) {
		howToPlayLinkEnd.addEventListener('click', (e) => {
			e.preventDefault()
			helpModal.classList.remove('hidden')
		})
	}

	// Setup help modal close handlers
	setupModalHandlers(helpModal, {
		closeButton: helpCloseBtn,
		overlay: helpModalOverlay,
		hideClass: 'hidden'
	})
}

/**
 * Initializes the kana reference modal
 */
export function initializeKanaReferenceModal() {
	// Kana reference modal handlers
	if (openKanaReferenceBtn) {
		openKanaReferenceBtn.addEventListener('click', () => {
			renderKanaReference('hiragana')
			kanaModal.classList.remove('hidden')
			// Set active tab
			if (tabHiragana) tabHiragana.classList.add('active')
			if (tabKatakana) tabKatakana.classList.remove('active')
		})
	}

	// Tab switching
	if (tabHiragana) {
		tabHiragana.addEventListener('click', () => {
			renderKanaReference('hiragana')
			if (tabHiragana) tabHiragana.classList.add('active')
			if (tabKatakana) tabKatakana.classList.remove('active')
		})
	}

	if (tabKatakana) {
		tabKatakana.addEventListener('click', () => {
			renderKanaReference('katakana')
			if (tabKatakana) tabKatakana.classList.add('active')
			if (tabHiragana) tabHiragana.classList.remove('active')
		})
	}

	// Update scroll hints on window resize
	let resizeTimeout: number
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimeout)
		resizeTimeout = setTimeout(() => {
			if (!kanaModal.classList.contains('hidden')) {
				updateKanaScrollIndicators()
			}
		}, 150)
	})

	// Setup kana modal close handlers
	setupModalHandlers(kanaModal, {
		closeButton: kanaCloseBtn,
		overlay: kanaModalOverlay,
		hideClass: 'hidden'
	})
}

/**
 * Initializes escape key handler for all modals
 */
export function initializeModalEscapeKeys(engine: GameEngine) {
	document.addEventListener('keydown', (e) => {
		if (e.code !== 'Escape') return

		// Close settings modal (only if game is not running or already handling escape)
		if (!settingsModal.classList.contains('hidden')) {
			if (!engine.running) {
				e.preventDefault()
				settingsModal.classList.add('hidden')
			}
			return
		}

		// Close help modal on escape
		if (!helpModal.classList.contains('hidden')) {
			e.preventDefault()
			helpModal.classList.add('hidden')
			return
		}

		// Close kana modal on escape
		if (!kanaModal.classList.contains('hidden')) {
			e.preventDefault()
			kanaModal.classList.add('hidden')
			return
		}
	})
}
