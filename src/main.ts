import { GameEngine } from './game/engine'
import { DOMRenderer } from './game/renderer_dom'
import { InputManager } from './game/input'
import { AudioManager } from './game/audio'
import { loadSettings, saveSettings, getHighScores, addHighScore, isHighScore } from './game/storage'

const tokensLayer = document.getElementById('tokens')!
const scoreEl = document.getElementById('score')!
const comboEl = document.getElementById('combo')!
const speedEl = document.getElementById('speed')!
const livesEl = document.getElementById('lives')!
const gameModeSelect = document.getElementById('game-mode') as HTMLSelectElement | null
const kanaSelect = document.getElementById('kana-set') as HTMLSelectElement | null
const audioToggle = document.getElementById('audio-toggle') as HTMLInputElement | null
const inputEcho = document.getElementById('input-echo')!
const endGameBtn = document.getElementById('end-game') as HTMLButtonElement | null
const pauseBtn = document.getElementById('pause') as HTMLButtonElement | null
const startScreenEl = document.getElementById('start-screen')!
const startBtn = document.getElementById('start') as HTMLButtonElement | null
const gameOverEl = document.getElementById('game-over')!
const finalScoreEl = document.getElementById('final-score')!
const newHighScoreEl = document.getElementById('new-high-score')!
const highScoresStartEl = document.getElementById('high-scores-start')!
const highScoresEndEl = document.getElementById('high-scores-end')!
const restartBtn = document.getElementById('restart') as HTMLButtonElement | null

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
			<span class="high-score-rank">#${idx + 1}</span>
			<span class="high-score-value">${entry.score}</span>
			<span class="high-score-date">${date}</span>
		</div>`
	}).join('')
	
	container.innerHTML = `<h3>High Scores</h3>${entries}`
}

function updateLivesDisplay(mode: 'practice' | 'challenge'){
	const livesDisplay = livesEl.parentElement
	if(livesDisplay){
		if(mode === 'practice'){
			livesDisplay.style.display = 'none'
		} else {
			livesDisplay.style.display = 'flex'
		}
	}
}

function disableGameSettings(){
	if(gameModeSelect){
		gameModeSelect.disabled = true
		gameModeSelect.style.opacity = '0.5'
		gameModeSelect.style.cursor = 'not-allowed'
	}
	if(kanaSelect){
		kanaSelect.disabled = true
		kanaSelect.style.opacity = '0.5'
		kanaSelect.style.cursor = 'not-allowed'
	}
}

function enableGameSettings(){
	if(gameModeSelect){
		gameModeSelect.disabled = false
		gameModeSelect.style.opacity = '1'
		gameModeSelect.style.cursor = 'pointer'
	}
	if(kanaSelect){
		kanaSelect.disabled = false
		kanaSelect.style.opacity = '1'
		kanaSelect.style.cursor = 'pointer'
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
		scoreEl.parentElement?.classList.add('stat-highlight')
		setTimeout(() => scoreEl.parentElement?.classList.remove('stat-highlight'), 300)
		audio.playSuccess()
	},
	onCombo: (combo) => { 
		comboEl.textContent = `${combo}x`
		if(combo > 0) {
			comboEl.parentElement?.classList.add('stat-highlight')
			setTimeout(() => comboEl.parentElement?.classList.remove('stat-highlight'), 300)
		}
	},
	onSpeedChange: (multiplier) => {
		speedEl.textContent = `${multiplier.toFixed(1)}x`
		speedEl.parentElement?.classList.add('stat-highlight')
		setTimeout(() => speedEl.parentElement?.classList.remove('stat-highlight'), 300)
		
		// Visual flash effect on game area
		const gameArea = document.getElementById('game-area')
		if(gameArea) {
			gameArea.classList.add('speed-flash')
			setTimeout(() => gameArea.classList.remove('speed-flash'), 600)
		}
		
		// Show floating text notification
		const width = renderer.getHeight() * 0.6 // Approximate game area width
		renderer.showFloatingText(width / 2, renderer.getHeight() / 2, `SPEED UP! ${multiplier.toFixed(1)}x`, 'speed')
		
		audio.playSpeedIncrease()
	},
	onLivesChange: (lives, previousLives) => {
		livesEl.textContent = '❤️ '.repeat(lives).trim()
		// Only play sound and animate if lives actually decreased
		if(previousLives !== undefined && lives < previousLives) {
			livesEl.parentElement?.classList.add('stat-shake')
			setTimeout(() => livesEl.parentElement?.classList.remove('stat-shake'), 400)
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
		if(engine.gameMode === 'challenge' && isHighScore(finalScore)){
			newHighScoreEl.classList.remove('hidden')
			addHighScore(finalScore)
			renderHighScores(highScoresEndEl, finalScore)
		} else {
			newHighScoreEl.classList.add('hidden')
			renderHighScores(highScoresEndEl)
		}
		
		gameOverEl.classList.remove('hidden')
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
	gameModeSelect.value = saved.gameMode || 'challenge'
	engine.setGameMode(gameModeSelect.value as 'practice' | 'challenge')
	updateLivesDisplay(gameModeSelect.value as 'practice' | 'challenge')
	gameModeSelect.addEventListener('change', ()=>{
		const mode = gameModeSelect.value as 'practice' | 'challenge'
		engine.setGameMode(mode)
		updateLivesDisplay(mode)
		const s = loadSettings()
		s.gameMode = mode
		saveSettings(s)
	})
}

if(kanaSelect){
	kanaSelect.value = saved.kanaSet || 'hiragana'
	engine.loadKana(kanaSelect.value)
	kanaSelect.addEventListener('change', ()=>{
		engine.loadKana(kanaSelect.value)
		const s = loadSettings()
		s.kanaSet = kanaSelect.value
		saveSettings(s)
	})
}

if(pauseBtn){
	let isPaused = false
	let gameStarted = false
	
	// Disable pause button initially
	pauseBtn.disabled = true
	pauseBtn.style.opacity = '0.5'
	pauseBtn.style.cursor = 'not-allowed'
	
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
		pauseBtn.style.opacity = '1'
		pauseBtn.style.cursor = 'pointer'
		pauseBtn.innerHTML = '<span class="btn-left">⏸️</span><span class="btn-label">Pause</span><span class="btn-right"><kbd>Space</kbd></span>'
	}
	
	// Export function to disable pause button when game ends
	window.disablePauseButton = () => {
		gameStarted = false
		isPaused = false
		pauseBtn.disabled = true
		pauseBtn.style.opacity = '0.5'
		pauseBtn.style.cursor = 'not-allowed'
		pauseBtn.innerHTML = '<span class="btn-left">⏸️</span><span class="btn-label">Pause</span><span class="btn-right"><kbd>Space</kbd></span>'
	}
}

if(endGameBtn){
	// Disable end game button initially
	endGameBtn.disabled = true
	endGameBtn.style.opacity = '0.5'
	endGameBtn.style.cursor = 'not-allowed'
	
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
		endGameBtn.style.opacity = '1'
		endGameBtn.style.cursor = 'pointer'
	}
	
	// Export function to disable end game button
	window.disableEndGameButton = () => {
		endGameBtn.disabled = true
		endGameBtn.style.opacity = '0.5'
		endGameBtn.style.cursor = 'not-allowed'
	}
}
// Render high scores on start screen
renderHighScores(highScoresStartEl)

if(startBtn){
	startBtn.addEventListener('click', ()=>{
		startScreenEl.classList.add('hidden')
		speedEl.textContent = '1.0x' // Reset speed display without effects
		if(window.enablePauseButton) window.enablePauseButton()
		if(window.enableEndGameButton) window.enableEndGameButton()
		disableGameSettings()
		engine.start()
	})
}

if(restartBtn){
	restartBtn.addEventListener('click', ()=>{
		gameOverEl.classList.add('hidden')
		speedEl.textContent = '1.0x' // Reset speed display without effects
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
		if(!startScreenEl.classList.contains('hidden') && startBtn){
			e.preventDefault()
			startBtn.click()
		}
		// Check if game over screen is visible
		else if(!gameOverEl.classList.contains('hidden') && restartBtn){
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
