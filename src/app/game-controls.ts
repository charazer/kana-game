import type { GameEngine } from '../game/core/engine'
import type { AudioManager } from '../game/audio/audio'
import { updateButtonContent, ButtonTemplates } from '../game/ui/templates'
import { enableElement, disableElement } from '../game/ui/dom-helpers'
import {
	pauseBtn,
	pausedIndicator,
	endGameBtn,
	startBtn,
	startScreenEl,
	restartBtn,
	gameOverEl,
	speedEl,
	musicToggle,
	confirmEndModal,
	confirmEndYesBtn,
	confirmEndNoBtn
} from './dom-elements'

/** Returned by init functions so callers can enable/disable controls */
export interface ControlHandle {
	enable: () => void
	disable: () => void
}

// ─── Pause/resume UI helpers ────────────────────────────────────────────────

export function showPausedUI() {
	pausedIndicator.classList.remove('hidden')
	if (pauseBtn) updateButtonContent(pauseBtn, ButtonTemplates.resume)
}

export function showResumedUI() {
	pausedIndicator.classList.add('hidden')
	if (pauseBtn) updateButtonContent(pauseBtn, ButtonTemplates.pause)
}

export function pauseGame(engine: GameEngine, audio: AudioManager) {
	engine.pause()
	audio.playPause()
	showPausedUI()
}

export function resumeGame(engine: GameEngine, audio: AudioManager) {
	engine.resume()
	audio.playResume()
	showResumedUI()
}

// ─── Animation helpers ────────────────────────────────────────────────────── 

function pressAnimation(btn: HTMLButtonElement | null) {
	if (!btn) return
	btn.classList.remove('btn-press-pop')
	// Double-rAF restarts the animation without a synchronous reflow
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			btn.classList.add('btn-press-pop')
			btn.addEventListener('animationend', () => btn.classList.remove('btn-press-pop'), { once: true })
		})
	})
}

function hideScreenWithAnimation(el: HTMLElement | null, onComplete: () => void) {
	if (!el) { onComplete(); return }
	const card = el.querySelector<HTMLElement>('.start-screen-content, .game-over-content')
	if (!card) { onComplete(); return }

	let done = false
	const finish = () => {
		if (done) return
		done = true
		el.classList.remove('screen-exiting')
		onComplete()
	}

	el.classList.add('screen-exiting')
	card.addEventListener('animationend', finish, { once: true })
	setTimeout(finish, 500) // safety fallback
}

// ─── Control initializers ───────────────────────────────────────────────────

export function initializePauseButton(engine: GameEngine, audio: AudioManager): ControlHandle {
	let isPaused = false
	let gameStarted = false

	disableElement(pauseBtn)

	pauseBtn?.addEventListener('click', () => {
		if (!gameStarted) return
		pressAnimation(pauseBtn)
		isPaused = !isPaused
		if (isPaused) {
			pauseGame(engine, audio)
		} else {
			resumeGame(engine, audio)
		}
	})

	return {
		enable() {
			gameStarted = true
			isPaused = false
			pausedIndicator.classList.add('hidden')
			enableElement(pauseBtn)
			if (pauseBtn) updateButtonContent(pauseBtn, ButtonTemplates.pause)
		},
		disable() {
			gameStarted = false
			isPaused = false
			disableElement(pauseBtn)
			if (pauseBtn) updateButtonContent(pauseBtn, ButtonTemplates.pause)
		}
	}
}

export function initializeEndGameButton(engine: GameEngine, audio: AudioManager): ControlHandle {
	disableElement(endGameBtn)

	let confirmOpen = false
	let wasPausedBeforeConfirm = false

	const doEndGame = () => {
		confirmOpen = false
		confirmEndModal.classList.add('hidden')
		pausedIndicator.classList.add('hidden')
		engine.running = false
		engine.input.enabled = false
		engine.input.buffer = ''
		engine.input.onKey('')
		engine.onGameOver()
	}

	const openConfirmModal = () => {
		if (confirmOpen) return
		wasPausedBeforeConfirm = !engine.running
		if (!wasPausedBeforeConfirm) {
			pauseGame(engine, audio)
		}
		engine.input.enabled = false
		engine.input.buffer = ''
		confirmOpen = true
		confirmEndModal.classList.remove('hidden')
	}

	const closeConfirmModal = () => {
		if (!confirmOpen) return
		confirmOpen = false
		confirmEndModal.classList.add('hidden')
		if (!wasPausedBeforeConfirm) {
			resumeGame(engine, audio)
		}
		engine.input.enabled = true
		engine.input.buffer = ''
	}

	endGameBtn?.addEventListener('click', () => {
		if (!endGameBtn || endGameBtn.disabled) return
		pressAnimation(endGameBtn)
		openConfirmModal()
	})

	confirmEndYesBtn?.addEventListener('click', doEndGame)
	confirmEndNoBtn?.addEventListener('click', closeConfirmModal)

	// Y / N / Escape keys while confirm modal is open
	document.addEventListener('keydown', (e) => {
		if (!confirmOpen) return
		e.stopImmediatePropagation()
		e.preventDefault()
		if (e.key === 'y' || e.key === 'Y') doEndGame()
		if (e.code === 'Enter') doEndGame()
		if (e.key === 'n' || e.key === 'N') closeConfirmModal()
		if (e.code === 'Escape') closeConfirmModal()
	})

	return {
		enable: () => enableElement(endGameBtn),
		disable: () => disableElement(endGameBtn)
	}
}

/** Shared start/restart logic */
function beginGame(
	engine: GameEngine,
	audio: AudioManager,
	screenEl: HTMLElement,
	btn: HTMLButtonElement | null,
	controls: { pause: ControlHandle; endGame: ControlHandle; settings: ControlHandle }
) {
	pressAnimation(btn)
	hideScreenWithAnimation(screenEl, () => screenEl.classList.add('hidden'))
	speedEl.textContent = '1.0x'

	controls.pause.enable()
	controls.endGame.enable()
	controls.settings.disable()

	audio.playGameStart()
	if (musicToggle?.checked) audio.setMusicEnabled(true)

	engine.reset()
	engine.start()
}

export function initializeStartButton(
	engine: GameEngine,
	audio: AudioManager,
	controls: { pause: ControlHandle; endGame: ControlHandle; settings: ControlHandle }
) {
	startBtn?.addEventListener('click', () => {
		beginGame(engine, audio, startScreenEl, startBtn, controls)
	})
}

export function initializeRestartButton(
	engine: GameEngine,
	audio: AudioManager,
	controls: { pause: ControlHandle; endGame: ControlHandle; settings: ControlHandle }
) {
	restartBtn?.addEventListener('click', () => {
		beginGame(engine, audio, gameOverEl, restartBtn, controls)
	})
}

export function initializeKeyboardShortcuts(engine: GameEngine) {
	document.addEventListener('keydown', (e) => {
		if (e.code === 'Enter' && !engine.running) {
			if (!startScreenEl.classList.contains('hidden') && startBtn) {
				e.preventDefault()
				startBtn.click()
			} else if (!gameOverEl.classList.contains('hidden') && restartBtn) {
				e.preventDefault()
				restartBtn.click()
			}
		}

		if (e.code === 'Space' && pauseBtn && !pauseBtn.disabled) {
			e.preventDefault()
			pauseBtn.click()
		}

		if (e.code === 'Escape' && endGameBtn && !endGameBtn.disabled) {
			if (!confirmEndModal.classList.contains('hidden')) return
			e.preventDefault()
			endGameBtn.click()
		}
	})
}
