import type { GameEngine } from '../game/core/engine'
import type { AudioManager } from '../game/audio/audio'
import { setupModalHandlers } from '../game/ui/dom-helpers'
import { updateButtonContent, ButtonTemplates } from '../game/ui/templates'
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

export function initializeSettingsModal(engine: GameEngine, audio: AudioManager) {
	if (!settingsBtn || !settingsModal) return

	let autoPausedGame = false

	settingsBtn.addEventListener('click', () => {
		settingsModal.classList.remove('hidden')
		const gameInProgress = endGameBtn && !endGameBtn.disabled
		if (activeGameNotice) {
			activeGameNotice.classList.toggle('hidden', !gameInProgress)
			autoPausedGame = false
			if (gameInProgress && engine.running) {
				engine.pause()
				audio.playPause()
				pausedIndicator.classList.remove('hidden')
				autoPausedGame = true
				if (pauseBtn) updateButtonContent(pauseBtn, ButtonTemplates.resume)
			}
		}
	})

	const closeSettingsModal = () => {
		settingsModal.classList.add('hidden')
		if (autoPausedGame) {
			engine.resume()
			audio.playResume()
			pausedIndicator.classList.add('hidden')
			autoPausedGame = false
			if (pauseBtn) updateButtonContent(pauseBtn, ButtonTemplates.pause)
		}
	}

	settingsCloseBtn?.addEventListener('click', closeSettingsModal)
	settingsModalOverlay?.addEventListener('click', closeSettingsModal)
}

export function initializeHelpModal() {
	const openHelp = (e: Event) => {
		e.preventDefault()
		helpModal.classList.remove('hidden')
	}

	howToPlayLink?.addEventListener('click', openHelp)
	howToPlayLinkEnd?.addEventListener('click', openHelp)

	setupModalHandlers(helpModal, {
		closeButton: helpCloseBtn,
		overlay: helpModalOverlay
	})
}

export function initializeKanaReferenceModal() {
	const setActiveTab = (type: 'hiragana' | 'katakana') => {
		renderKanaReference(type)
		tabHiragana?.classList.toggle('active', type === 'hiragana')
		tabKatakana?.classList.toggle('active', type === 'katakana')
	}

	openKanaReferenceBtn?.addEventListener('click', () => {
		setActiveTab('hiragana')
		kanaModal.classList.remove('hidden')
	})

	tabHiragana?.addEventListener('click', () => setActiveTab('hiragana'))
	tabKatakana?.addEventListener('click', () => setActiveTab('katakana'))

	// Debounced scroll indicator update on resize
	let resizeTimer: number
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimer)
		resizeTimer = window.setTimeout(() => {
			if (!kanaModal.classList.contains('hidden')) updateKanaScrollIndicators()
		}, 150)
	})

	setupModalHandlers(kanaModal, {
		closeButton: kanaCloseBtn,
		overlay: kanaModalOverlay
	})
}

export function initializeModalEscapeKeys(engine: GameEngine) {
	document.addEventListener('keydown', (e) => {
		if (e.code !== 'Escape') return

		if (!settingsModal.classList.contains('hidden')) {
			if (!engine.running) {
				e.preventDefault()
				settingsModal.classList.add('hidden')
			}
			return
		}

		if (!helpModal.classList.contains('hidden')) {
			e.preventDefault()
			helpModal.classList.add('hidden')
			return
		}

		if (!kanaModal.classList.contains('hidden')) {
			e.preventDefault()
			kanaModal.classList.add('hidden')
		}
	})
}
