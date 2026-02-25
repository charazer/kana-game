import {
	GAME_MODE_PRACTICE,
	GAME_MODE_CHALLENGE,
	INITIAL_LIVES,
	ANIM_DURATION_STAT_HIGHLIGHT,
	ANIM_DURATION_STAT_SHAKE,
	ANIM_DURATION_SPEED_FLASH,
	GAME_AREA_WIDTH_MULTIPLIER
} from '../game/constants/constants'
import type { GameMode } from '../game/constants/constants'
import { addHighScore, isHighScore } from '../game/storage/storage'
import { renderHighScores } from './ui-helpers'
import type { DOMRenderer } from '../game/ui/renderer_dom'
import type { AudioManager } from '../game/audio/audio'
import type { GameEngine } from '../game/core/engine'
import type { ControlHandle } from './game-controls'
import {
	scoreEl,
	comboEl,
	speedEl,
	livesEl,
	finalScoreEl,
	newHighScoreEl,
	highScoresEndEl,
	gameOverEl,
	gameArea
} from './dom-elements'

import heartFullImg from '../assets/img/heart.png'
import heartEmptyImg from '../assets/img/heart_empty.png'

function flashStat(el: HTMLElement | null, className = 'stat-highlight', duration = ANIM_DURATION_STAT_HIGHLIGHT) {
	el?.classList.add(className)
	setTimeout(() => el?.classList.remove(className), duration)
}

export function createGameCallbacks(
	renderer: DOMRenderer,
	audio: AudioManager,
	engine: GameEngine,
	controls: { pause: ControlHandle; endGame: ControlHandle; settings: ControlHandle }
) {
	return {
		onScore: (s: number) => {
			scoreEl.textContent = `${s}`
			flashStat(scoreEl.parentElement)
			audio.playSuccess()
		},

		onCombo: (combo: number) => {
			comboEl.textContent = `${combo}x`
			if (combo > 0) flashStat(comboEl.parentElement)
		},

		onSpeedChange: (multiplier: number) => {
			const display = `${multiplier.toFixed(1)}x`
			speedEl.textContent = display
			flashStat(speedEl.parentElement)

			if (gameArea) {
				gameArea.classList.add('speed-flash')
				const el = gameArea
				setTimeout(() => el.classList.remove('speed-flash'), ANIM_DURATION_SPEED_FLASH)
			}

			const width = renderer.getHeight() * GAME_AREA_WIDTH_MULTIPLIER
			renderer.showFloatingText(width / 2, renderer.getHeight() / 2, `SPEED UP! ${display}`, 'speed')
			audio.playSpeedIncrease()
		},

		onLivesChange: (lives: number, previousLives?: number) => {
			livesEl.innerHTML = ''

			for (let i = 0; i < INITIAL_LIVES; i++) {
				const heart = document.createElement('img')
				heart.src = i < lives ? heartFullImg : heartEmptyImg
				heart.alt = i < lives ? '❤️' : '♡'
				heart.className = 'heart-icon'
				livesEl.appendChild(heart)
			}

			if (previousLives !== undefined && lives < previousLives) {
				flashStat(livesEl.parentElement, 'stat-shake', ANIM_DURATION_STAT_SHAKE)
				audio.playLifeLost()
			}
		},

		onGameOver: () => {
			const finalScore = engine.score
			finalScoreEl.textContent = `${finalScore}`

			audio.playGameOver()
			controls.pause.disable()
			controls.endGame.disable()
			controls.settings.enable()

			if (engine.gameMode === GAME_MODE_CHALLENGE && isHighScore(finalScore)) {
				newHighScoreEl.classList.remove('hidden')
				addHighScore(finalScore)
				renderHighScores(highScoresEndEl, engine.gameMode, finalScore)
			} else {
				newHighScoreEl.classList.add('hidden')
				renderHighScores(highScoresEndEl, engine.gameMode)
			}

			gameOverEl.classList.remove('hidden')
		}
	}
}

export function updateLivesDisplay(mode: GameMode) {
	const livesDisplay = livesEl.parentElement
	if (livesDisplay) {
		livesDisplay.style.display = mode === GAME_MODE_PRACTICE ? 'none' : 'flex'
	}
}
