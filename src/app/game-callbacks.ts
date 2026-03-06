import {
	GAME_MODE_CHALLENGE,
	INITIAL_LIVES,
	GAME_AREA_WIDTH_MULTIPLIER
} from '../game/constants/constants'
import { addHighScore, isHighScore } from '../game/storage/storage'
import { renderHighScores } from './ui-helpers'
import type { DOMRenderer } from '../game/ui/renderer-dom'
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

function flashStat(el: HTMLElement | null, className = 'stat-highlight') {
	if (!el) return
	el.classList.remove(className)
	void el.offsetWidth
	el.classList.add(className)
	el.addEventListener('animationend', () => el.classList.remove(className), { once: true })
}

export function createGameCallbacks(
	renderer: DOMRenderer,
	audio: AudioManager,
	engine: GameEngine,
	controls: { pause: ControlHandle; endGame: ControlHandle; settings: ControlHandle }
) {
	return {
		onScore: (s: number) => {
			requestAnimationFrame(() => {
				scoreEl.textContent = `${s}`
				flashStat(scoreEl.parentElement)
			})
			audio.playSuccess()
		},

		onCombo: (combo: number) => {
			requestAnimationFrame(() => {
				comboEl.textContent = `${combo}x`
				if (combo > 0) flashStat(comboEl.parentElement)
			})
		},

		onSpeedChange: (multiplier: number) => {
			const display = `${multiplier.toFixed(1)}x`
			speedEl.textContent = display
			flashStat(speedEl.parentElement)

			if (gameArea) {
				const el = gameArea
				el.classList.remove('speed-flash')
				void el.offsetWidth
				el.classList.add('speed-flash')
				el.addEventListener('animationend', () => el.classList.remove('speed-flash'), { once: true })
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
				flashStat(livesEl.parentElement, 'stat-shake')
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
