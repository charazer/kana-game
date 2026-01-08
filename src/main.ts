/**
 * Main application entry point
 * Orchestrates the kana game by initializing and coordinating all modules
 */

import { GameEngine } from './game/core/engine'
import { DOMRenderer } from './game/ui/renderer_dom'
import { InputManager } from './game/input/input'
import { AudioManager } from './game/audio/audio'

// Import DOM element references
import { tokensLayer, inputEcho, highScoresStartEl } from './app/dom-elements'

// Import initialization modules
import { initializeAudio, initializeGameSettings } from './app/settings'
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

/**
 * Initialize and start the application
 */
async function main() {
	// Initialize core game systems
	const renderer = new DOMRenderer(tokensLayer as HTMLElement)
	const input = new InputManager()
	const audio = new AudioManager()

	// Create the game engine with placeholder callbacks
	// We'll update them after engine is created to avoid circular reference
	const engine = new GameEngine({
		renderer,
		input,
		onScore: (_s: number) => {},
		onCombo: (_combo: number) => {},
		onSpeedChange: (_multiplier: number) => {},
		onLivesChange: (_lives: number, _previousLives?: number) => {},
		onGameOver: () => {}
	})
	
	// Now set up the actual callbacks
	const actualCallbacks = createGameCallbacks(renderer, audio, engine)
	engine.onScore = actualCallbacks.onScore
	engine.onCombo = actualCallbacks.onCombo
	engine.onSpeedChange = actualCallbacks.onSpeedChange
	engine.onLivesChange = actualCallbacks.onLivesChange
	engine.onGameOver = actualCallbacks.onGameOver

	// Setup input echo display
	input.onKey = (buffer) => {
		inputEcho.textContent = buffer || '_'
	}

	// Initialize audio system
	await initializeAudio(audio)

	// Initialize game settings
	initializeGameSettings(engine)

	// Initialize game controls
	initializePauseButton(engine, audio)
	initializeEndGameButton(engine, audio)
	initializeStartButton(engine, audio)
	initializeRestartButton(engine, audio)
	initializeKeyboardShortcuts(engine)

	// Initialize modals
	initializeSettingsModal(engine, audio)
	initializeHelpModal()
	initializeKanaReferenceModal()
	initializeModalEscapeKeys(engine)

	// Render high scores on start screen
	renderHighScores(highScoresStartEl)
}

// Start the application
main().catch(console.error)
