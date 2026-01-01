import { GameEngine } from './game/engine'
import { DOMRenderer } from './game/renderer_dom'
import { InputManager } from './game/input'
import { AudioManager } from './game/audio'
import { loadSettings, saveSettings, getHighScores, addHighScore, isHighScore } from './game/storage'
import {
  type GameMode,
  GAME_MODE_PRACTICE,
  GAME_MODE_CHALLENGE,
  KANA_SET_HIRAGANA,
  FLOAT_TYPE_SPEED,
  DOM_ID_TOKENS,
  DOM_ID_SCORE,
  DOM_ID_COMBO,
  DOM_ID_SPEED,
  DOM_ID_LIVES,
  DOM_ID_GAME_MODE,
  DOM_ID_KANA_SET,
  DOM_ID_AUDIO_TOGGLE,
  DOM_ID_INPUT_ECHO,
  DOM_ID_END_GAME,
  DOM_ID_PAUSE,
  DOM_ID_START_SCREEN,
  DOM_ID_START,
  DOM_ID_GAME_OVER,
  DOM_ID_FINAL_SCORE,
  DOM_ID_NEW_HIGH_SCORE,
  DOM_ID_HIGH_SCORES_START,
  DOM_ID_HIGH_SCORES_END,
  DOM_ID_RESTART,
  DOM_ID_GAME_AREA,
  CSS_CLASS_STAT_HIGHLIGHT,
  CSS_CLASS_STAT_SHAKE,
  CSS_CLASS_SPEED_FLASH,
  CSS_CLASS_HIDDEN,
  ANIM_DURATION_STAT_HIGHLIGHT,
  ANIM_DURATION_STAT_SHAKE,
  ANIM_DURATION_SPEED_FLASH,
  GAME_AREA_WIDTH_MULTIPLIER,
  SPEED_DISPLAY_DECIMAL_PLACES,
  SPEED_INITIAL_DISPLAY,
  COMBO_DISPLAY_SUFFIX,
  UI_DISABLED_OPACITY,
  UI_ENABLED_OPACITY,
  UI_CURSOR_NOT_ALLOWED,
  UI_CURSOR_POINTER,
  HIGH_SCORE_RANK_PREFIX,
  HIGH_SCORE_LIST_START_INDEX
} from './game/constants'

const tokensLayer = document.getElementById(DOM_ID_TOKENS)!
const scoreEl = document.getElementById(DOM_ID_SCORE)!
const comboEl = document.getElementById(DOM_ID_COMBO)!
const speedEl = document.getElementById(DOM_ID_SPEED)!
const livesEl = document.getElementById(DOM_ID_LIVES)!
const gameModeSelect = document.getElementById(DOM_ID_GAME_MODE) as HTMLSelectElement | null
const kanaSelect = document.getElementById(DOM_ID_KANA_SET) as HTMLSelectElement | null
const audioToggle = document.getElementById(DOM_ID_AUDIO_TOGGLE) as HTMLInputElement | null
const inputEcho = document.getElementById(DOM_ID_INPUT_ECHO)!
const endGameBtn = document.getElementById(DOM_ID_END_GAME) as HTMLButtonElement | null
const pauseBtn = document.getElementById(DOM_ID_PAUSE) as HTMLButtonElement | null
const startScreenEl = document.getElementById(DOM_ID_START_SCREEN)!
const startBtn = document.getElementById(DOM_ID_START) as HTMLButtonElement | null
const gameOverEl = document.getElementById(DOM_ID_GAME_OVER)!
const finalScoreEl = document.getElementById(DOM_ID_FINAL_SCORE)!
const newHighScoreEl = document.getElementById(DOM_ID_NEW_HIGH_SCORE)!
const highScoresStartEl = document.getElementById(DOM_ID_HIGH_SCORES_START)!
const highScoresEndEl = document.getElementById(DOM_ID_HIGH_SCORES_END)!
const restartBtn = document.getElementById(DOM_ID_RESTART) as HTMLButtonElement | null

function renderHighScores(container: HTMLElement, highlightScore?: number){
	const scores = getHighScores()
	if(scores.length === 0){
		container.innerHTML = '<h3>High Scores</h3><p style="color:rgba(255,255,255,0.4);font-size:14px;padding:8px;">No scores yet!</p>'
		return
	}
	
	const entries = scores.map((entry, idx) => {
		const date = new Date(entry.date).toLocaleDateString()
		const highlight = highlightScore === entry.score ? 'highlight' : ''
		return `<div class="high-score-entry ${highlight}">
			<span class="high-score-rank">${HIGH_SCORE_RANK_PREFIX}${idx + HIGH_SCORE_LIST_START_INDEX}</span>
			<span class="high-score-value">${entry.score}</span>
			<span class="high-score-date">${date}</span>
		</div>`
	}).join('')
	
	container.innerHTML = `<h3>High Scores</h3>${entries}`
}

function updateLivesDisplay(mode: GameMode){
	const livesDisplay = livesEl.parentElement
	if(livesDisplay){
		if(mode === GAME_MODE_PRACTICE){
			livesDisplay.style.display = 'none'
		} else {
			livesDisplay.style.display = 'flex'
		}
	}
}

function disableGameSettings(){
	if(gameModeSelect){
		gameModeSelect.disabled = true
		gameModeSelect.style.opacity = UI_DISABLED_OPACITY
		gameModeSelect.style.cursor = UI_CURSOR_NOT_ALLOWED
	}
	if(kanaSelect){
		kanaSelect.disabled = true
		kanaSelect.style.opacity = UI_DISABLED_OPACITY
		kanaSelect.style.cursor = UI_CURSOR_NOT_ALLOWED
	}
}

function enableGameSettings(){
	if(gameModeSelect){
		gameModeSelect.disabled = false
		gameModeSelect.style.opacity = UI_ENABLED_OPACITY
		gameModeSelect.style.cursor = UI_CURSOR_POINTER
	}
	if(kanaSelect){
		kanaSelect.disabled = false
		kanaSelect.style.opacity = UI_ENABLED_OPACITY
		kanaSelect.style.cursor = UI_CURSOR_POINTER
	}
}

const renderer = new DOMRenderer(tokensLayer as HTMLElement)
const input = new InputManager()
const audio = new AudioManager()
const engine = new GameEngine({ 
	renderer, 
	input, 
	onScore: (s) => { 
		scoreEl.textContent = `${s}`
		scoreEl.parentElement?.classList.add(CSS_CLASS_STAT_HIGHLIGHT)
		setTimeout(() => scoreEl.parentElement?.classList.remove(CSS_CLASS_STAT_HIGHLIGHT), ANIM_DURATION_STAT_HIGHLIGHT)
		audio.playSuccess()
	},
	onCombo: (combo) => { 
		comboEl.textContent = `${combo}${COMBO_DISPLAY_SUFFIX}`
		if(combo > 0) {
			comboEl.parentElement?.classList.add(CSS_CLASS_STAT_HIGHLIGHT)
			setTimeout(() => comboEl.parentElement?.classList.remove(CSS_CLASS_STAT_HIGHLIGHT), ANIM_DURATION_STAT_HIGHLIGHT)
		}
	},
	onSpeedChange: (multiplier) => {
		speedEl.textContent = `${multiplier.toFixed(SPEED_DISPLAY_DECIMAL_PLACES)}${COMBO_DISPLAY_SUFFIX}`
		speedEl.parentElement?.classList.add(CSS_CLASS_STAT_HIGHLIGHT)
		setTimeout(() => speedEl.parentElement?.classList.remove(CSS_CLASS_STAT_HIGHLIGHT), ANIM_DURATION_STAT_HIGHLIGHT)
		
		// Visual flash effect on game area
		const gameArea = document.getElementById(DOM_ID_GAME_AREA)
		if(gameArea) {
			gameArea.classList.add(CSS_CLASS_SPEED_FLASH)
			setTimeout(() => gameArea.classList.remove(CSS_CLASS_SPEED_FLASH), ANIM_DURATION_SPEED_FLASH)
		}
		
		// Show floating text notification
		const width = renderer.getHeight() * GAME_AREA_WIDTH_MULTIPLIER
		renderer.showFloatingText(width / 2, renderer.getHeight() / 2, `SPEED UP! ${multiplier.toFixed(SPEED_DISPLAY_DECIMAL_PLACES)}${COMBO_DISPLAY_SUFFIX}`, FLOAT_TYPE_SPEED)
		
		audio.playSpeedIncrease()
	},
	onLivesChange: (lives, previousLives) => {
		livesEl.textContent = '❤️ '.repeat(lives).trim()
		// Only play sound and animate if lives actually decreased
		if(previousLives !== undefined && lives < previousLives) {
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
		if(window.disablePauseButton) window.disablePauseButton()
		if(window.disableEndGameButton) window.disableEndGameButton()
		enableGameSettings()
		
		// Only check for high scores in challenge mode
		if(engine.gameMode === GAME_MODE_CHALLENGE && isHighScore(finalScore)){
			newHighScoreEl.classList.remove(CSS_CLASS_HIDDEN)
			addHighScore(finalScore)
			renderHighScores(highScoresEndEl, finalScore)
		} else {
			newHighScoreEl.classList.add(CSS_CLASS_HIDDEN)
			renderHighScores(highScoresEndEl)
		}
		
		gameOverEl.classList.remove(CSS_CLASS_HIDDEN)
	}
})

input.onKey = (buffer) => {
	inputEcho.textContent = buffer || '_'
}

// load saved settings
const saved = loadSettings()
if(audioToggle){
	audioToggle.checked = saved.audioEnabled !== false // default to true
	audio.setEnabled(audioToggle.checked)
	audioToggle.addEventListener('change', ()=>{
		audio.setEnabled(audioToggle.checked)
		const s = loadSettings()
		s.audioEnabled = audioToggle.checked
		saveSettings(s)
	})
}

if(gameModeSelect){
	gameModeSelect.value = saved.gameMode || GAME_MODE_CHALLENGE
	engine.setGameMode(gameModeSelect.value as GameMode)
	updateLivesDisplay(gameModeSelect.value as GameMode)
	gameModeSelect.addEventListener('change', ()=>{
		const mode = gameModeSelect.value as GameMode
		engine.setGameMode(mode)
		updateLivesDisplay(mode)
		const s = loadSettings()
		s.gameMode = mode
		saveSettings(s)
	})
}

if(kanaSelect){
	kanaSelect.value = saved.kanaSet || KANA_SET_HIRAGANA
	engine.loadKana(kanaSelect.value as any)
	kanaSelect.addEventListener('change', ()=>{
		engine.loadKana(kanaSelect.value as any)
		const s = loadSettings()
		s.kanaSet = kanaSelect.value as any
		saveSettings(s)
	})
}

if(pauseBtn){
	let isPaused = false
	let gameStarted = false
	
	// Disable pause button initially
	pauseBtn.disabled = true
	pauseBtn.style.opacity = UI_DISABLED_OPACITY
	pauseBtn.style.cursor = UI_CURSOR_NOT_ALLOWED
	
	pauseBtn.addEventListener('click', ()=>{
		if(!gameStarted) return // Don't allow pause before game starts
		
		isPaused = !isPaused
		if(isPaused){
			engine.pause()
			pauseBtn.innerHTML = '<span class="btn-left">▶️</span><span class="btn-label">Resume</span><span class="btn-right"><kbd>Space</kbd></span>'
		} else {
			engine.resume()
			pauseBtn.innerHTML = '<span class="btn-left">⏸️</span><span class="btn-label">Pause</span><span class="btn-right"><kbd>Space</kbd></span>'
		}
	})
	
	// Export function to enable pause button when game starts
	window.enablePauseButton = () => {
		gameStarted = true
		isPaused = false
		pauseBtn.disabled = false
		pauseBtn.style.opacity = UI_ENABLED_OPACITY
		pauseBtn.style.cursor = UI_CURSOR_POINTER
		pauseBtn.innerHTML = '<span class="btn-left">⏸️</span><span class="btn-label">Pause</span><span class="btn-right"><kbd>Space</kbd></span>'
	}
	
	// Export function to disable pause button when game ends
	window.disablePauseButton = () => {
		gameStarted = false
		isPaused = false
		pauseBtn.disabled = true
		pauseBtn.style.opacity = UI_DISABLED_OPACITY
		pauseBtn.style.cursor = UI_CURSOR_NOT_ALLOWED
		pauseBtn.innerHTML = '<span class="btn-left">⏸️</span><span class="btn-label">Pause</span><span class="btn-right"><kbd>Space</kbd></span>'
	}
}

if(endGameBtn){
	// Disable end game button initially
	endGameBtn.disabled = true
	endGameBtn.style.opacity = UI_DISABLED_OPACITY
	endGameBtn.style.cursor = UI_CURSOR_NOT_ALLOWED
	
	endGameBtn.addEventListener('click', ()=>{
		// Only allow ending if button is enabled (which means game is running)
		if(endGameBtn.disabled) return
		
		// Stop the game and trigger game over
		engine.running = false
		engine.onGameOver()
	})
	
	// Export function to enable end game button
	window.enableEndGameButton = () => {
		endGameBtn.disabled = false
		endGameBtn.style.opacity = UI_ENABLED_OPACITY
		endGameBtn.style.cursor = UI_CURSOR_POINTER
	}
	
	// Export function to disable end game button
	window.disableEndGameButton = () => {
		endGameBtn.disabled = true
		endGameBtn.style.opacity = UI_DISABLED_OPACITY
		endGameBtn.style.cursor = UI_CURSOR_NOT_ALLOWED
	}
}
// Render high scores on start screen
renderHighScores(highScoresStartEl)

if(startBtn){
	startBtn.addEventListener('click', ()=>{
		startScreenEl.classList.add(CSS_CLASS_HIDDEN)
		speedEl.textContent = SPEED_INITIAL_DISPLAY
		if(window.enablePauseButton) window.enablePauseButton()
		if(window.enableEndGameButton) window.enableEndGameButton()
		disableGameSettings()
		engine.start()
	})
}

if(restartBtn){
	restartBtn.addEventListener('click', ()=>{
		gameOverEl.classList.add(CSS_CLASS_HIDDEN)
		speedEl.textContent = SPEED_INITIAL_DISPLAY
		engine.reset()
		if(window.enablePauseButton) window.enablePauseButton()
		if(window.enableEndGameButton) window.enableEndGameButton()
		disableGameSettings()
		engine.start()
	})
}

// Keyboard shortcuts for game controls
document.addEventListener('keydown', (e) => {
	// Enter for start/restart (only when game is not running)
	if(e.code === 'Enter' && !engine.running){
		// Check if start screen is visible
		if(!startScreenEl.classList.contains(CSS_CLASS_HIDDEN) && startBtn){
			e.preventDefault()
			startBtn.click()
		}
		// Check if game over screen is visible
		else if(!gameOverEl.classList.contains(CSS_CLASS_HIDDEN) && restartBtn){
			e.preventDefault()
			restartBtn.click()
		}
	}
	
	// Space for pause/resume (only when game is running)
	if(e.code === 'Space' && pauseBtn && !pauseBtn.disabled){
		e.preventDefault() // Prevent page scroll
		pauseBtn.click()
	}
	
	// Escape for end game (only when game is running)
	if(e.code === 'Escape' && endGameBtn && !endGameBtn.disabled){
		e.preventDefault()
		endGameBtn.click()
	}
})
