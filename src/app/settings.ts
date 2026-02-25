import type { GameMode, KanaSet } from '../game/constants/constants'
import { GAME_MODE_CHALLENGE, KANA_SET_HIRAGANA } from '../game/constants/constants'
import { loadSettings, updateSetting } from '../game/storage/storage'
import type { AudioManager } from '../game/audio/audio'
import type { GameEngine } from '../game/core/engine'
import type { ControlHandle } from './game-controls'
import {
	audioToggle,
	musicToggle,
	musicVolumeSlider,
	musicVolumeValue,
	gameModeSelect,
	kanaSelect,
	includeDakutenToggle,
	includeYoonToggle,
	highScoresStartEl
} from './dom-elements'
import { updateLivesDisplay } from './ui-helpers'
import { enableElements, disableElements } from '../game/ui/dom-helpers'
import { renderHighScores } from './ui-helpers'

export async function initializeAudio(audio: AudioManager) {
	const saved = loadSettings()
	const initialMusicVolume = saved.musicVolume ?? 0.3

	audio.initMusic(
		async () => (await import('../assets/audio/yukarinoti_japanese_mood2.mp3')).default,
		initialMusicVolume
	)

	if (audioToggle) {
		audioToggle.checked = saved.audioEnabled !== false
		audio.setEnabled(audioToggle.checked)
		audioToggle.addEventListener('change', () => {
			audio.setEnabled(audioToggle!.checked)
			updateSetting({ audioEnabled: audioToggle!.checked })
		})
	}

	if (musicToggle) {
		musicToggle.checked = saved.musicEnabled === true
		musicToggle.addEventListener('change', async () => {
			await audio.setMusicEnabled(musicToggle!.checked)
			updateSetting({ musicEnabled: musicToggle!.checked })
		})
	}

	if (musicVolumeSlider && musicVolumeValue) {
		const volumePercent = Math.round(initialMusicVolume * 100)
		musicVolumeSlider.value = volumePercent.toString()
		musicVolumeValue.textContent = `${volumePercent}%`

		musicVolumeSlider.addEventListener('input', () => {
			const volume = parseInt(musicVolumeSlider!.value) / 100
			audio.setMusicVolume(volume)
			musicVolumeValue!.textContent = `${musicVolumeSlider!.value}%`
			updateSetting({ musicVolume: volume })
		})
	}
}

export function initializeGameSettings(engine: GameEngine) {
	const saved = loadSettings()

	if (gameModeSelect) {
		gameModeSelect.value = saved.gameMode ?? GAME_MODE_CHALLENGE
		engine.setGameMode(gameModeSelect.value as GameMode)
		updateLivesDisplay(gameModeSelect.value as GameMode)
		gameModeSelect.addEventListener('change', () => {
			const mode = gameModeSelect!.value as GameMode
			engine.setGameMode(mode)
			updateLivesDisplay(mode)
			renderHighScores(highScoresStartEl, mode)
			updateSetting({ gameMode: mode })
		})
	}

	if (kanaSelect) {
		kanaSelect.value = saved.kanaSet ?? KANA_SET_HIRAGANA
		engine.loadKana(kanaSelect.value as KanaSet)
		kanaSelect.addEventListener('change', () => {
			const set = kanaSelect!.value as KanaSet
			engine.loadKana(set)
			updateSetting({ kanaSet: set })
		})
	}

	if (includeDakutenToggle) {
		includeDakutenToggle.checked = saved.includeDakuten !== false
		engine.includeDakuten = includeDakutenToggle.checked
		includeDakutenToggle.addEventListener('change', () => {
			engine.includeDakuten = includeDakutenToggle!.checked
			updateSetting({ includeDakuten: includeDakutenToggle!.checked })
		})
	}

	if (includeYoonToggle) {
		includeYoonToggle.checked = saved.includeYoon !== false
		engine.includeYoon = includeYoonToggle.checked
		includeYoonToggle.addEventListener('change', () => {
			engine.includeYoon = includeYoonToggle!.checked
			updateSetting({ includeYoon: includeYoonToggle!.checked })
		})
	}
}

/** Creates a ControlHandle for enabling/disabling game settings during play */
export function createSettingsControl(): ControlHandle {
	return {
		disable: () => disableElements(gameModeSelect, kanaSelect, includeDakutenToggle, includeYoonToggle),
		enable: () => enableElements(gameModeSelect, kanaSelect, includeDakutenToggle, includeYoonToggle)
	}
}
