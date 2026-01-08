/**
 * Game engine callback handlers
 * These functions are called by the game engine on various game events
 */

import type { GameMode } from '../game/constants/constants'
import {
	GAME_MODE_PRACTICE,
	GAME_MODE_CHALLENGE,
	INITIAL_LIVES,
	CSS_CLASS_STAT_HIGHLIGHT,
	CSS_CLASS_STAT_SHAKE,
	CSS_CLASS_SPEED_FLASH,
	CSS_CLASS_HIDDEN,
	ANIM_DURATION_STAT_HIGHLIGHT,
	ANIM_DURATION_STAT_SHAKE,
	ANIM_DURATION_SPEED_FLASH,
	GAME_AREA_WIDTH_MULTIPLIER,
	SPEED_DISPLAY_DECIMAL_PLACES,
	COMBO_DISPLAY_SUFFIX,
	DOM_ID_GAME_AREA,
	FLOAT_TYPE_SPEED
} from '../game/constants/constants'
import { addHighScore, isHighScore, getHighScores } from '../game/storage/storage'
import { createHighScoresList, type HighScoreEntry } from '../game/ui/templates'
import { HIGH_SCORE_LIST_START_INDEX, HIGH_SCORE_RANK_PREFIX } from '../game/constants/constants'
import type { DOMRenderer } from '../game/ui/renderer_dom'
import type { AudioManager } from '../game/audio/audio'
import type { GameEngine } from '../game/core/engine'
import {
	scoreEl,
	comboEl,
	speedEl,
	livesEl,
	finalScoreEl,
	newHighScoreEl,
	highScoresEndEl,
	gameOverEl
} from './dom-elements'

// Import image assets so Vite can process them
import heartFullImg from '../assets/img/heart.png'
import heartEmptyImg from '../assets/img/heart_empty.png'

/**
 * Creates the game engine callbacks
 */
export function createGameCallbacks(
	renderer: DOMRenderer,
	audio: AudioManager,
	engine: GameEngine
) {
	return {
		onScore: (s: number) => {
			scoreEl.textContent = `${s}`
			scoreEl.parentElement?.classList.add(CSS_CLASS_STAT_HIGHLIGHT)
			setTimeout(() => scoreEl.parentElement?.classList.remove(CSS_CLASS_STAT_HIGHLIGHT), ANIM_DURATION_STAT_HIGHLIGHT)
			audio.playSuccess()
		},

		onCombo: (combo: number) => {
			comboEl.textContent = `${combo}${COMBO_DISPLAY_SUFFIX}`
			if (combo > 0) {
				comboEl.parentElement?.classList.add(CSS_CLASS_STAT_HIGHLIGHT)
				setTimeout(() => comboEl.parentElement?.classList.remove(CSS_CLASS_STAT_HIGHLIGHT), ANIM_DURATION_STAT_HIGHLIGHT)
			}
		},

		onSpeedChange: (multiplier: number) => {
			speedEl.textContent = `${multiplier.toFixed(SPEED_DISPLAY_DECIMAL_PLACES)}${COMBO_DISPLAY_SUFFIX}`
			speedEl.parentElement?.classList.add(CSS_CLASS_STAT_HIGHLIGHT)
			setTimeout(() => speedEl.parentElement?.classList.remove(CSS_CLASS_STAT_HIGHLIGHT), ANIM_DURATION_STAT_HIGHLIGHT)

			// Visual flash effect on game area
			const gameArea = document.getElementById(DOM_ID_GAME_AREA)
			if (gameArea) {
				gameArea.classList.add(CSS_CLASS_SPEED_FLASH)
				setTimeout(() => gameArea.classList.remove(CSS_CLASS_SPEED_FLASH), ANIM_DURATION_SPEED_FLASH)
			}

			// Show floating text notification
			const width = renderer.getHeight() * GAME_AREA_WIDTH_MULTIPLIER
			renderer.showFloatingText(width / 2, renderer.getHeight() / 2, `SPEED UP! ${multiplier.toFixed(SPEED_DISPLAY_DECIMAL_PLACES)}${COMBO_DISPLAY_SUFFIX}`, FLOAT_TYPE_SPEED)

			audio.playSpeedIncrease()
		},

		onLivesChange: (lives: number, previousLives?: number) => {
			// Clear and rebuild hearts with images
			livesEl.innerHTML = ''

			// Show filled hearts for current lives
			for (let i = 0; i < lives; i++) {
				const heart = document.createElement('img')
				heart.src = heartFullImg
				heart.alt = '❤️'
				heart.className = 'heart-icon'
				livesEl.appendChild(heart)
			}

			// Show empty hearts for lost lives
			for (let i = lives; i < INITIAL_LIVES; i++) {
				const heart = document.createElement('img')
				heart.src = heartEmptyImg
				heart.alt = '♡'
				heart.className = 'heart-icon'
				livesEl.appendChild(heart)
			}

			// Only play sound and animate if lives actually decreased
			if (previousLives !== undefined && lives < previousLives) {
				livesEl.parentElement?.classList.add(CSS_CLASS_STAT_SHAKE)
				setTimeout(() => livesEl.parentElement?.classList.remove(CSS_CLASS_STAT_SHAKE), ANIM_DURATION_STAT_SHAKE)
				audio.playLifeLost()
			}
		},

		onGameOver: () => {
			const finalScore = engine.score
			finalScoreEl.textContent = `${finalScore}`

			// Play game over sound
			audio.playGameOver()

			// Disable pause and end game buttons, enable settings
			if (window.disablePauseButton) window.disablePauseButton()
			if (window.disableEndGameButton) window.disableEndGameButton()
			if (window.enableGameSettings) window.enableGameSettings()

			// Only check for high scores in challenge mode
			if (engine.gameMode === GAME_MODE_CHALLENGE && isHighScore(finalScore)) {
				newHighScoreEl.classList.remove(CSS_CLASS_HIDDEN)
				addHighScore(finalScore)
				renderHighScoresInternal(highScoresEndEl, finalScore)
			} else {
				newHighScoreEl.classList.add(CSS_CLASS_HIDDEN)
				renderHighScoresInternal(highScoresEndEl)
			}

			gameOverEl.classList.remove(CSS_CLASS_HIDDEN)
		}
	}
}

/**
 * Renders high scores list to a container element (internal helper)
 */
function renderHighScoresInternal(container: HTMLElement, highlightScore?: number) {
	const scores = getHighScores()

	// Transform scores into HighScoreEntry format
	const entries: HighScoreEntry[] = scores.map((entry, idx) => ({
		score: entry.score,
		date: entry.date,
		rank: idx + HIGH_SCORE_LIST_START_INDEX,
		highlight: highlightScore === entry.score
	}))

	// Use template utility to generate HTML
	container.innerHTML = createHighScoresList(entries, HIGH_SCORE_RANK_PREFIX)
}

/**
 * Updates the lives display visibility based on game mode
 */
export function updateLivesDisplay(mode: GameMode) {
	const livesDisplay = livesEl.parentElement
	if (livesDisplay) {
		if (mode === GAME_MODE_PRACTICE) {
			livesDisplay.style.display = 'none'
		} else {
			livesDisplay.style.display = 'flex'
		}
	}
}
