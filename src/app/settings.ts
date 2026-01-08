/**
 * Settings initialization
 * Handles loading and applying saved settings, setting up audio controls
 */

import type { GameMode } from '../game/constants/constants'
import { GAME_MODE_CHALLENGE, KANA_SET_HIRAGANA } from '../game/constants/constants'
import { loadSettings, saveSettings } from '../game/storage/storage'
import type { AudioManager } from '../game/audio/audio'
import type { GameEngine } from '../game/core/engine'
import {
	audioToggle,
	musicToggle,
	musicVolumeSlider,
	musicVolumeValue,
	gameModeSelect,
	kanaSelect,
	includeDakutenToggle,
	includeYoonToggle
} from './dom-elements'
import { updateLivesDisplay } from './game-callbacks'
import { enableElements, disableElements } from '../game/ui/dom-helpers'

/**
 * Initializes audio system with saved settings
 */
export async function initializeAudio(audio: AudioManager) {
	const saved = loadSettings()

	// Initialize music with saved volume or default to 30%
	// Music file will be loaded lazily only when enabled
	const initialMusicVolume = saved.musicVolume ?? 0.3
	audio.initMusic(
		async () => {
			const module = await import('../assets/audio/yukarinoti_japanese_mood2.mp3')
			return module.default
		},
		initialMusicVolume
	)

	// Setup audio toggle
	if (audioToggle) {
		audioToggle.checked = saved.audioEnabled !== false // default to true
		audio.setEnabled(audioToggle.checked)
		audioToggle.addEventListener('change', () => {
			if (!audioToggle) return
			audio.setEnabled(audioToggle.checked)
			const s = loadSettings()
			s.audioEnabled = audioToggle.checked
			saveSettings(s)
		})
	}

	// Setup music toggle
	if (musicToggle) {
		musicToggle.checked = saved.musicEnabled === true // default to false
		// Note: Don't autoplay on page load due to browser policies
		// Music will start when user begins a game (user interaction)
		musicToggle.addEventListener('change', async () => {
			if (!musicToggle) return
			await audio.setMusicEnabled(musicToggle.checked)
			const s = loadSettings()
			s.musicEnabled = musicToggle.checked
			saveSettings(s)
		})
	}

	// Setup music volume slider
	if (musicVolumeSlider && musicVolumeValue) {
		const volumePercent = Math.round(initialMusicVolume * 100)
		musicVolumeSlider.value = volumePercent.toString()
		musicVolumeValue.textContent = `${volumePercent}%`

		musicVolumeSlider.addEventListener('input', () => {
			if (!musicVolumeSlider || !musicVolumeValue) return
			const volume = parseInt(musicVolumeSlider.value) / 100
			audio.setMusicVolume(volume)
			musicVolumeValue.textContent = `${musicVolumeSlider.value}%`

			const s = loadSettings()
			s.musicVolume = volume
			saveSettings(s)
		})
	}
}

/**
 * Initializes game settings controls
 */
export function initializeGameSettings(engine: GameEngine) {
	const saved = loadSettings()

	// Game mode setting
	if (gameModeSelect) {
		gameModeSelect.value = saved.gameMode || GAME_MODE_CHALLENGE
		engine.setGameMode(gameModeSelect.value as GameMode)
		updateLivesDisplay(gameModeSelect.value as GameMode)
		gameModeSelect.addEventListener('change', () => {
			if (!gameModeSelect) return
			const mode = gameModeSelect.value as GameMode
			engine.setGameMode(mode)
			updateLivesDisplay(mode)
			const s = loadSettings()
			s.gameMode = mode
			saveSettings(s)
		})
	}

	// Kana set setting
	if (kanaSelect) {
		kanaSelect.value = saved.kanaSet || KANA_SET_HIRAGANA
		engine.loadKana(kanaSelect.value as any)
		kanaSelect.addEventListener('change', () => {
			if (!kanaSelect) return
			engine.loadKana(kanaSelect.value as any)
			const s = loadSettings()
			s.kanaSet = kanaSelect.value as any
			saveSettings(s)
		})
	}

	// Include dakuten setting
	if (includeDakutenToggle) {
		includeDakutenToggle.checked = saved.includeDakuten !== false // default to true
		engine.includeDakuten = includeDakutenToggle.checked
		includeDakutenToggle.addEventListener('change', () => {
			if (!includeDakutenToggle) return
			engine.includeDakuten = includeDakutenToggle.checked
			const s = loadSettings()
			s.includeDakuten = includeDakutenToggle.checked
			saveSettings(s)
		})
	}

	// Include yoon setting
	if (includeYoonToggle) {
		includeYoonToggle.checked = saved.includeYoon !== false // default to true
		engine.includeYoon = includeYoonToggle.checked
		includeYoonToggle.addEventListener('change', () => {
			if (!includeYoonToggle) return
			engine.includeYoon = includeYoonToggle.checked
			const s = loadSettings()
			s.includeYoon = includeYoonToggle.checked
			saveSettings(s)
		})
	}
}

/**
 * Disables game settings controls (during gameplay)
 */
export function disableGameSettings() {
	disableElements(gameModeSelect, kanaSelect, includeDakutenToggle, includeYoonToggle)
}

/**
 * Enables game settings controls (when not playing)
 */
export function enableGameSettings() {
	enableElements(gameModeSelect, kanaSelect, includeDakutenToggle, includeYoonToggle)
}

// Export functions to window for global access
declare global {
	interface Window {
		disableGameSettings?: () => void
		enableGameSettings?: () => void
	}
}

window.disableGameSettings = disableGameSettings
window.enableGameSettings = enableGameSettings
