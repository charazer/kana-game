/**
 * Main entry point — initializes and wires all modules
 */

import { GameEngine } from './game/core/engine'
import { DOMRenderer } from './game/ui/renderer_dom'
import { InputManager } from './game/input/input'
import { AudioManager } from './game/audio/audio'
import { tokensLayer, inputEcho, highScoresStartEl } from './app/dom-elements'
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

async function main() {
	const renderer = new DOMRenderer(tokensLayer as HTMLElement)
	const input = new InputManager()
	const audio = new AudioManager()

	// Create engine with placeholder callbacks (resolved below after controls exist)
	const engine = new GameEngine({
		renderer,
		input,
		onScore: () => {},
		onCombo: () => {},
		onSpeedChange: () => {},
		onLivesChange: () => {},
		onGameOver: () => {}
	})

	// Build control handles
	const pause = initializePauseButton(engine, audio)
	const endGame = initializeEndGameButton(engine, audio)
	const settings = createSettingsControl()
	const controls = { pause, endGame, settings }

	// Wire actual callbacks now that controls exist
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
