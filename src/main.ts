import { GameEngine } from './game/core/engine'
import { DOMRenderer } from './game/ui/renderer_dom'
import { InputManager } from './game/input/input'
import { AudioManager } from './game/audio/audio'
import { tokensLayer, inputEcho, highScoresStartEl, mobileInput, gameArea } from './app/dom-elements'
import { initializeAudio, initializeGameSettings, createSettingsControl } from './app/settings'
import { createGameCallbacks } from './app/game-callbacks'
import {
	initializePauseButton,
	initializeEndGameButton,
	initializeStartButton,
	initializeRestartButton,
	initializeKeyboardShortcuts
} from './app/game-controls'
import {
	initializeSettingsModal,
	initializeHelpModal,
	initializeKanaReferenceModal,
	initializeModalEscapeKeys
} from './app/modal-handlers'
import { renderHighScores } from './app/ui-helpers'
import { initializeMobileKeyboardDetection, initializeTouchFocusProtection } from './app/mobile-support'

async function main() {
	const renderer = new DOMRenderer(tokensLayer as HTMLElement)
	const input = new InputManager()
	const audio = new AudioManager()

	if (mobileInput) {
		input.bindElement(mobileInput)

		if (gameArea) {
			initializeTouchFocusProtection(gameArea, mobileInput, () => input.enabled)
		}
	}
	initializeMobileKeyboardDetection()

	const engine = new GameEngine({
		renderer,
		input,
		onScore: () => {},
		onCombo: () => {},
		onSpeedChange: () => {},
		onLivesChange: () => {},
		onGameOver: () => {}
	})

	const pause = initializePauseButton(engine, audio)
	const endGame = initializeEndGameButton(engine, audio)
	const settings = createSettingsControl()
	const controls = { pause, endGame, settings }

	const callbacks = createGameCallbacks(renderer, audio, engine, controls)
	Object.assign(engine, callbacks)

	input.onKey = (buffer) => {
		inputEcho.textContent = buffer || '_'
	}

	await initializeAudio(audio)
	initializeGameSettings(engine)
	initializeStartButton(engine, audio, controls)
	initializeRestartButton(engine, audio, controls)
	initializeKeyboardShortcuts(engine)

	initializeSettingsModal(engine, audio)
	initializeHelpModal()
	initializeKanaReferenceModal()
	initializeModalEscapeKeys(engine)

	renderHighScores(highScoresStartEl, engine.gameMode)
}

main().catch(console.error)
