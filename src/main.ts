import { GameEngine } from './game/engine'
import { DOMRenderer } from './game/renderer_dom'
import { InputManager } from './game/input'
import { AudioManager } from './game/audio'
import { loadSettings, saveSettings, getHighScores, addHighScore, isHighScore } from './game/storage'
import { createHighScoresList, createKanaReference, DOMBuilder, ButtonTemplates, type HighScoreEntry } from './game/templates'
import { enableElement, disableElement, enableElements, disableElements, setupModalHandlers } from './game/dom-helpers'
import kanaHiragana from './data/kana/hiragana.json'
import kanaKatakana from './data/kana/katakana.json'
import type { KanaEntry } from './game/types'

// Import image assets so Vite can process them
import heartFullImg from './assets/img/heart.png'
import heartEmptyImg from './assets/img/heart_empty.png'

import {
  type GameMode,
  GAME_MODE_PRACTICE,
  GAME_MODE_CHALLENGE,
  KANA_SET_HIRAGANA,
  FLOAT_TYPE_SPEED,
  INITIAL_LIVES,
  DOM_ID_TOKENS,
  DOM_ID_SCORE,
  DOM_ID_COMBO,
  DOM_ID_SPEED,
  DOM_ID_LIVES,
  DOM_ID_GAME_MODE,
  DOM_ID_KANA_SET,
  DOM_ID_AUDIO_TOGGLE,
  DOM_ID_MUSIC_TOGGLE,
  DOM_ID_MUSIC_VOLUME,
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
  HIGH_SCORE_RANK_PREFIX,
  HIGH_SCORE_LIST_START_INDEX
} from './game/constants'

const tokensLayer = document.getElementById(DOM_ID_TOKENS)!
const pausedIndicator = document.getElementById('paused-indicator')!
const scoreEl = document.getElementById(DOM_ID_SCORE)!
const comboEl = document.getElementById(DOM_ID_COMBO)!
const speedEl = document.getElementById(DOM_ID_SPEED)!
const livesEl = document.getElementById(DOM_ID_LIVES)!
const gameModeSelect = document.getElementById(DOM_ID_GAME_MODE) as HTMLSelectElement | null
const kanaSelect = document.getElementById(DOM_ID_KANA_SET) as HTMLSelectElement | null
const musicToggle = document.getElementById(DOM_ID_MUSIC_TOGGLE) as HTMLInputElement | null
const musicVolumeSlider = document.getElementById(DOM_ID_MUSIC_VOLUME) as HTMLInputElement | null
const musicVolumeValue = document.getElementById('music-volume-value') as HTMLSpanElement | null
const audioToggle = document.getElementById(DOM_ID_AUDIO_TOGGLE) as HTMLInputElement | null
const includeDakutenToggle = document.getElementById('include-dakuten') as HTMLInputElement | null
const includeYoonToggle = document.getElementById('include-yoon') as HTMLInputElement | null
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

// Settings modal elements
const settingsBtn = document.getElementById('settings-btn') as HTMLButtonElement | null
const settingsModal = document.getElementById('settings-modal')!
const settingsCloseBtn = document.getElementById('settings-close') as HTMLButtonElement | null
const modalOverlay = settingsModal.querySelector('.modal-overlay') as HTMLElement
const activeGameNotice = document.getElementById('active-game-notice') as HTMLElement | null

// Help modal elements
const howToPlayLink = document.getElementById('how-to-play-link') as HTMLAnchorElement | null
const howToPlayLinkEnd = document.getElementById('how-to-play-link-end') as HTMLAnchorElement | null
const helpModal = document.getElementById('help-modal')!
const helpCloseBtn = document.getElementById('help-close') as HTMLButtonElement | null
const helpModalOverlay = helpModal.querySelector('.modal-overlay') as HTMLElement

// Kana reference modal elements
const openKanaReferenceBtn = document.getElementById('open-kana-reference') as HTMLButtonElement | null
const kanaModal = document.getElementById('kana-modal')!
const kanaCloseBtn = document.getElementById('kana-close') as HTMLButtonElement | null
const kanaModalOverlay = kanaModal.querySelector('.modal-overlay') as HTMLElement
const tabHiragana = document.getElementById('tab-hiragana') as HTMLButtonElement | null
const tabKatakana = document.getElementById('tab-katakana') as HTMLButtonElement | null
const kanaContent = document.getElementById('kana-content')!

function renderKanaReference(type: 'hiragana' | 'katakana') {
	const kanaData = (type === 'hiragana' ? kanaHiragana : kanaKatakana) as KanaEntry[]
	kanaContent.innerHTML = createKanaReference(kanaData)
	
	// Check for overflow and add scroll indicators
	requestAnimationFrame(() => {
		const sections = kanaContent.querySelectorAll('.kana-section')
		sections.forEach(section => {
			const table = section.querySelector('.kana-table')
			if (table) {
				const hasOverflow = table.scrollWidth > table.clientWidth
				if (hasOverflow) {
					section.classList.add('has-scroll')
				} else {
					section.classList.remove('has-scroll')
				}
			}
		})
	})
}

function renderHighScores(container: HTMLElement, highlightScore?: number){
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
	disableElements(gameModeSelect, kanaSelect, includeDakutenToggle, includeYoonToggle)
}

function enableGameSettings(){
	enableElements(gameModeSelect, kanaSelect, includeDakutenToggle, includeYoonToggle)
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

// Initialize music with saved volume or default to 30%
// Music file will be loaded lazily only when enabled
const initialMusicVolume = saved.musicVolume ?? 0.3
audio.initMusic(
	async () => {
		const module = await import('./assets/audio/yukarinoti_japanese_mood2.mp3')
		return module.default
	},
	initialMusicVolume
)

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

if(musicToggle){
	musicToggle.checked = saved.musicEnabled === true // default to false
	// Note: Don't autoplay on page load due to browser policies
	// Music will start when user begins a game (user interaction)
	musicToggle.addEventListener('change', async ()=>{
		await audio.setMusicEnabled(musicToggle.checked)
		const s = loadSettings()
		s.musicEnabled = musicToggle.checked
		saveSettings(s)
	})
}

if(musicVolumeSlider && musicVolumeValue){
	const volumePercent = Math.round(initialMusicVolume * 100)
	musicVolumeSlider.value = volumePercent.toString()
	musicVolumeValue.textContent = `${volumePercent}%`
	
	musicVolumeSlider.addEventListener('input', ()=>{
		const volume = parseInt(musicVolumeSlider.value) / 100
		audio.setMusicVolume(volume)
		musicVolumeValue.textContent = `${musicVolumeSlider.value}%`
		
		const s = loadSettings()
		s.musicVolume = volume
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

if(includeDakutenToggle){
	includeDakutenToggle.checked = saved.includeDakuten !== false // default to true
	engine.includeDakuten = includeDakutenToggle.checked
	includeDakutenToggle.addEventListener('change', ()=>{
		engine.includeDakuten = includeDakutenToggle.checked
		const s = loadSettings()
		s.includeDakuten = includeDakutenToggle.checked
		saveSettings(s)
	})
}

if(includeYoonToggle){
	includeYoonToggle.checked = saved.includeYoon !== false // default to true
	engine.includeYoon = includeYoonToggle.checked
	includeYoonToggle.addEventListener('change', ()=>{
		engine.includeYoon = includeYoonToggle.checked
		const s = loadSettings()
		s.includeYoon = includeYoonToggle.checked
		saveSettings(s)
	})
}

if(pauseBtn){
	let isPaused = false
	let gameStarted = false
	
	// Disable pause button initially
	disableElement(pauseBtn)
	
	pauseBtn.addEventListener('click', ()=>{
		if(!gameStarted) return // Don't allow pause before game starts
		
		isPaused = !isPaused
		if(isPaused){
			engine.pause()
			audio.playPause()
			pausedIndicator.classList.remove(CSS_CLASS_HIDDEN)
			DOMBuilder.updateButton(pauseBtn, ButtonTemplates.resume)
		} else {
			engine.resume()
			audio.playResume()
			pausedIndicator.classList.add(CSS_CLASS_HIDDEN)
			DOMBuilder.updateButton(pauseBtn, ButtonTemplates.pause)
		}
	})
	
	// Export function to enable pause button when game starts
	window.enablePauseButton = () => {
		gameStarted = true
		isPaused = false
		pausedIndicator.classList.add(CSS_CLASS_HIDDEN)
		enableElement(pauseBtn)
		DOMBuilder.updateButton(pauseBtn, ButtonTemplates.pause)
	}
	
	// Export function to disable pause button when game ends
	window.disablePauseButton = () => {
		gameStarted = false
		isPaused = false
		disableElement(pauseBtn)
		DOMBuilder.updateButton(pauseBtn, ButtonTemplates.pause)
	}
}

if(endGameBtn){
	// Disable end game button initially
	disableElement(endGameBtn)
	
	endGameBtn.addEventListener('click', ()=>{
		// Only allow ending if button is enabled (which means game is running)
		if(endGameBtn.disabled) return
		
		// Hide paused indicator and resume if paused
		pausedIndicator.classList.add(CSS_CLASS_HIDDEN)
		engine.resume()
		
		// Stop the game and trigger game over
		engine.running = false
		engine.onGameOver()
	})
	
	// Export function to enable end game button
	window.enableEndGameButton = () => {
		enableElement(endGameBtn)
	}
	
	// Export function to disable end game button
	window.disableEndGameButton = () => {
		disableElement(endGameBtn)
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
		audio.playGameStart()
		// Start music if enabled (requires user interaction for autoplay policy)
		if(musicToggle?.checked) {
			audio.setMusicEnabled(true)
		}
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
		audio.playGameStart()
		// Resume music if enabled
		if(musicToggle?.checked) {
			audio.setMusicEnabled(true)
		}
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

// Settings modal functionality
if(settingsBtn && settingsModal){
	// Track if we auto-paused the game when opening settings
	let autoPausedGame = false
	
	// Open modal
	settingsBtn.addEventListener('click', ()=>{
		settingsModal.classList.remove(CSS_CLASS_HIDDEN)
		// Show/hide active game notice and auto-pause if needed
		if(activeGameNotice){
			// Check if game is in progress (end game button is enabled)
			const gameInProgress = endGameBtn && !endGameBtn.disabled
			if(gameInProgress){
				activeGameNotice.classList.remove(CSS_CLASS_HIDDEN)
				// Auto-pause the game if it's running
				if(engine.running){
					engine.pause()
					audio.playPause()
					pausedIndicator.classList.remove(CSS_CLASS_HIDDEN)
					autoPausedGame = true
					// Update pause button to show resume state
					if(pauseBtn){
						DOMBuilder.updateButton(pauseBtn, ButtonTemplates.resume)
					}
				}
			} else {
				activeGameNotice.classList.add(CSS_CLASS_HIDDEN)
				autoPausedGame = false
			}
		}
	})
	
	// Close modal - close button
	if(settingsCloseBtn){
		settingsCloseBtn.addEventListener('click', ()=>{
			settingsModal.classList.add(CSS_CLASS_HIDDEN)
			// Resume game if we auto-paused it
			if(autoPausedGame){
				engine.resume()
				audio.playResume()
				pausedIndicator.classList.add(CSS_CLASS_HIDDEN)
				autoPausedGame = false
				// Update pause button to show pause state
				if(pauseBtn){
					DOMBuilder.updateButton(pauseBtn, ButtonTemplates.pause)
				}
			}
		})
	}
	
	// Close modal - overlay click
	if(modalOverlay){
		modalOverlay.addEventListener('click', ()=>{
			settingsModal.classList.add(CSS_CLASS_HIDDEN)
			// Resume game if we auto-paused it
			if(autoPausedGame){
				engine.resume()
				audio.playResume()
				pausedIndicator.classList.add(CSS_CLASS_HIDDEN)
				autoPausedGame = false
				// Update pause button to show pause state
				if(pauseBtn){
					DOMBuilder.updateButton(pauseBtn, ButtonTemplates.pause)
				}
			}
		})
	}
	
	// Close modal - escape key
	document.addEventListener('keydown', (e)=>{
		if(e.code === 'Escape' && !settingsModal.classList.contains(CSS_CLASS_HIDDEN)){
			// Only close settings if game is not running or already handling escape
			if(!engine.running){
				e.preventDefault()
				settingsModal.classList.add(CSS_CLASS_HIDDEN)
			}
		}
		// Close help modal on escape
		if(e.code === 'Escape' && !helpModal.classList.contains(CSS_CLASS_HIDDEN)){
			e.preventDefault()
			helpModal.classList.add(CSS_CLASS_HIDDEN)
		}
		// Close kana modal on escape
		if(e.code === 'Escape' && !kanaModal.classList.contains(CSS_CLASS_HIDDEN)){
			e.preventDefault()
			kanaModal.classList.add(CSS_CLASS_HIDDEN)
		}
	})

	// Help modal handlers
	if(howToPlayLink){
		howToPlayLink.addEventListener('click', (e)=>{
			e.preventDefault()
			helpModal.classList.remove(CSS_CLASS_HIDDEN)
		})
	}
	
	// Help modal handler for game over screen
	if(howToPlayLinkEnd){
		howToPlayLinkEnd.addEventListener('click', (e)=>{
			e.preventDefault()
			helpModal.classList.remove(CSS_CLASS_HIDDEN)
		})
	}
	
	// Setup help modal close handlers
	setupModalHandlers(helpModal, {
		closeButton: helpCloseBtn,
		overlay: helpModalOverlay,
		hideClass: CSS_CLASS_HIDDEN
	})

	// Kana reference modal handlers
	if(openKanaReferenceBtn){
		openKanaReferenceBtn.addEventListener('click', ()=>{
			renderKanaReference('hiragana')
			kanaModal.classList.remove(CSS_CLASS_HIDDEN)
			// Set active tab
			if(tabHiragana) tabHiragana.classList.add('active')
			if(tabKatakana) tabKatakana.classList.remove('active')
		})
	}

	// Tab switching
	if(tabHiragana){
		tabHiragana.addEventListener('click', ()=>{
			renderKanaReference('hiragana')
			tabHiragana.classList.add('active')
			if(tabKatakana) tabKatakana.classList.remove('active')
		})
	}

	if(tabKatakana){
		tabKatakana.addEventListener('click', ()=>{
			renderKanaReference('katakana')
			tabKatakana.classList.add('active')
			if(tabHiragana) tabHiragana.classList.remove('active')
		})
	}

	// Update scroll hints on window resize
	let resizeTimeout: number
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimeout)
		resizeTimeout = setTimeout(() => {
			if (!kanaModal.classList.contains(CSS_CLASS_HIDDEN)) {
				const sections = kanaContent.querySelectorAll('.kana-section')
				sections.forEach(section => {
					const table = section.querySelector('.kana-table')
					if (table) {
						const hasOverflow = table.scrollWidth > table.clientWidth
						if (hasOverflow) {
							section.classList.add('has-scroll')
						} else {
							section.classList.remove('has-scroll')
						}
					}
				})
			}
		}, 150)
	})

	// Setup kana modal close handlers
	setupModalHandlers(kanaModal, {
		closeButton: kanaCloseBtn,
		overlay: kanaModalOverlay,
		hideClass: CSS_CLASS_HIDDEN
	})
}
