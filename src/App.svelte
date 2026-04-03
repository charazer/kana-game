<script lang="ts">
  import { onMount } from 'svelte'
  import { GameEngine } from './game/core/engine'
  import { DOMRenderer } from './game/ui/renderer-dom'
  import { InputManager } from './game/input/input'
  import { AudioManager } from './game/audio/audio'
  import {
    loadSettings,
    updateSetting,
    addHighScore,
    isHighScore,
    type Settings
  } from './game/storage/storage'
  import {
    GAME_MODE_CHALLENGE,
    GAME_MODE_PRACTICE,
    KANA_SET_HIRAGANA,
    INITIAL_LIVES,
    GAME_AREA_WIDTH_MULTIPLIER,
    type GameMode,
    type KanaSet
  } from './game/constants/constants'
  import {
    initializeMobileKeyboardDetection,
    initializeTouchFocusProtection,
    initializeVirtualKeyboardAPI,
    initializeScrollPrevention,
    initializeKeyboardDebugMode
  } from './app/mobile-support'
  import type { GamePhase } from './game/core/types'
  import GameHeader from './components/GameHeader.svelte'
  import GameArea from './components/GameArea.svelte'
  import InputDisplay from './components/InputDisplay.svelte'
  import ConfirmEndModal from './components/ConfirmEndModal.svelte'
  import SettingsModal from './components/SettingsModal.svelte'
  import HelpModal from './components/HelpModal.svelte'
  import KanaReferenceModal from './components/KanaReferenceModal.svelte'

  // ── Game phase ───────────────────────────────────────────────────────────────
  let gamePhase = $state<GamePhase>('start')

  // ── Stats ────────────────────────────────────────────────────────────────────
  let score = $state(0)
  let lives = $state(INITIAL_LIVES)
  let combo = $state(0)
  let speedMultiplier = $state(1.0)
  let inputEcho = $state('_')
  let finalScore = $state(0)
  let isNewHighScore = $state(false)

  // ── Modal visibility ─────────────────────────────────────────────────────────
  let settingsOpen = $state(false)
  let helpOpen = $state(false)
  let kanaRefOpen = $state(false)
  let confirmEndOpen = $state(false)

  // ── Settings ─────────────────────────────────────────────────────────────────
  let settings = $state<Settings>({})

  // ── DOM refs (bound from child components) ───────────────────────────────────
  let tokensLayerEl: HTMLElement | undefined = $state()
  let gameAreaEl: HTMLElement | undefined = $state()
  let mobileInputEl: HTMLInputElement | undefined = $state()

  // ── Engine refs ──────────────────────────────────────────────────────────────
  let engine: GameEngine
  let audio: AudioManager
  let input: InputManager
  let wasPausedBeforeSettings = false
  let isGameActive = $derived(gamePhase === 'playing' || gamePhase === 'paused')

  // ── Screen transition helper ─────────────────────────────────────────────────
  function hideScreenWithAnimation(el: HTMLElement | null | undefined, onComplete: () => void) {
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
    setTimeout(finish, 500)
  }

  // ── Game control helpers ──────────────────────────────────────────────────────
  function pauseGame() {
    engine.pause()
    audio.playPause()
    gamePhase = 'paused'
  }

  function resumeGame() {
    engine.resume()
    audio.playResume()
    gamePhase = 'playing'
  }

  function beginGame(screenEl: HTMLElement | undefined) {
    hideScreenWithAnimation(screenEl, () => {})
    speedMultiplier = 1.0
    gamePhase = 'playing'
    audio.playGameStart()
    if (settings.musicEnabled) audio.setMusicEnabled(true)
    engine.reset()
    engine.start()
  }

  // ── Settings modal ────────────────────────────────────────────────────────────
  function openSettings() {
    wasPausedBeforeSettings = false
    if (isGameActive && engine.running) {
      pauseGame()
      wasPausedBeforeSettings = true
    }
    settingsOpen = true
  }

  function closeSettings() {
    settingsOpen = false
    if (wasPausedBeforeSettings) {
      resumeGame()
      wasPausedBeforeSettings = false
    }
  }

  function applySettingChange(patch: Partial<Settings>) {
    settings = { ...settings, ...patch }
    updateSetting(patch)

    if (patch.audioEnabled !== undefined) audio.setEnabled(patch.audioEnabled)
    if (patch.musicEnabled !== undefined) void audio.setMusicEnabled(patch.musicEnabled)
    if (patch.musicVolume !== undefined) audio.setMusicVolume(patch.musicVolume)
    if (!isGameActive) {
      if (patch.gameMode !== undefined) {
        engine.setGameMode(patch.gameMode)
        if (patch.gameMode === GAME_MODE_PRACTICE) lives = 0
        else lives = INITIAL_LIVES
      }
      if (patch.kanaSet !== undefined) engine.loadKana(patch.kanaSet)
      if (patch.includeDakuten !== undefined) engine.includeDakuten = patch.includeDakuten
      if (patch.includeYoon !== undefined) engine.includeYoon = patch.includeYoon
    }
  }

  // ── Confirm end modal ─────────────────────────────────────────────────────────
  function openConfirmEnd() {
    if (gamePhase !== 'playing' && gamePhase !== 'paused') return
    if (gamePhase === 'playing') pauseGame()
    input.enabled = false
    input.buffer = ''
    confirmEndOpen = true
  }

  function closeConfirmEnd() {
    confirmEndOpen = false
    if (gamePhase === 'paused') resumeGame()
    input.enabled = true
    input.buffer = ''
  }

  function doEndGame() {
    confirmEndOpen = false
    engine.running = false
    input.enabled = false
    input.buffer = ''
    input.onKey('')
    engine.onGameOver()
  }

  // ── Keyboard shortcuts ────────────────────────────────────────────────────────
  function onKeydown(e: KeyboardEvent) {
    if (e.code === 'Escape' && (gamePhase === 'playing' || gamePhase === 'paused') && !confirmEndOpen && !settingsOpen && !helpOpen && !kanaRefOpen) {
      e.preventDefault()
      e.stopImmediatePropagation()
      openConfirmEnd()
      return
    }
    if (e.code === 'Space' && !confirmEndOpen && !settingsOpen && !helpOpen && !kanaRefOpen) {
      if (gamePhase === 'playing') { e.preventDefault(); pauseGame() }
      else if (gamePhase === 'paused') { e.preventDefault(); resumeGame() }
      return
    }
    if (e.code === 'Enter' && !settingsOpen && !helpOpen && !kanaRefOpen && !confirmEndOpen) {
      if (gamePhase === 'start') handleStart()
      else if (gamePhase === 'over') handleRestart()
    }
  }

  // ── Screen actions ────────────────────────────────────────────────────────────
  function handleStart() {
    const screenEl = document.getElementById('start-screen') ?? undefined
    beginGame(screenEl)
  }

  function handleRestart() {
    const screenEl = document.getElementById('game-over') ?? undefined
    beginGame(screenEl)
  }

  // ── Mount ─────────────────────────────────────────────────────────────────────
  onMount(async () => {
    const saved = loadSettings()
    settings = {
      gameMode: saved.gameMode ?? GAME_MODE_CHALLENGE,
      kanaSet: saved.kanaSet ?? KANA_SET_HIRAGANA,
      audioEnabled: saved.audioEnabled !== false,
      musicEnabled: saved.musicEnabled === true,
      musicVolume: saved.musicVolume ?? 0.3,
      includeDakuten: saved.includeDakuten !== false,
      includeYoon: saved.includeYoon !== false
    }

    const renderer = new DOMRenderer(tokensLayerEl!)
    new ResizeObserver(() => renderer.invalidateCache()).observe(tokensLayerEl!)

    input = new InputManager()
    audio = new AudioManager()

    if (mobileInputEl) {
      input.bindElement(mobileInputEl)
      if (gameAreaEl) {
        initializeTouchFocusProtection(gameAreaEl, mobileInputEl, () => input.enabled)
      }
    }
    initializeVirtualKeyboardAPI()
    initializeMobileKeyboardDetection()
    initializeKeyboardDebugMode()
    initializeScrollPrevention()

    audio.initMusic(
      async () => (await import('./assets/audio/yukarinoti_japanese_mood2.mp3')).default,
      settings.musicVolume ?? 0.3
    )
    audio.setEnabled(settings.audioEnabled !== false)

    engine = new GameEngine({
      renderer,
      input,
      onScore: (s: number) => {
        requestAnimationFrame(() => { score = s })
        audio.playSuccess()
      },
      onCombo: (c: number) => {
        requestAnimationFrame(() => { combo = c })
      },
      onSpeedChange: (m: number) => {
        speedMultiplier = m
        const w = renderer.getHeight() * GAME_AREA_WIDTH_MULTIPLIER
        renderer.showFloatingText(w / 2, renderer.getHeight() / 2, `SPEED UP! ${m.toFixed(1)}x`, 'speed')
        audio.playSpeedIncrease()
      },
      onLivesChange: (l: number, prev?: number) => {
        lives = l
        if (prev !== undefined && l < prev) audio.playLifeLost()
      },
      onGameOver: () => {
        finalScore = engine.score
        isNewHighScore = engine.gameMode === GAME_MODE_CHALLENGE && isHighScore(finalScore)
        if (isNewHighScore) addHighScore(finalScore)
        audio.playGameOver()
        gamePhase = 'over'
      }
    })

    engine.setGameMode(settings.gameMode as GameMode)
    engine.loadKana(settings.kanaSet as KanaSet)
    engine.includeDakuten = settings.includeDakuten !== false
    engine.includeYoon = settings.includeYoon !== false

    input.onKey = (buffer) => { inputEcho = buffer || '_' }
  })
</script>

<svelte:window onkeydown={onKeydown} />

<div id="app">
  <GameHeader
    {score}
    {combo}
    {speedMultiplier}
    {lives}
    {gamePhase}
    gameMode={(settings.gameMode ?? GAME_MODE_CHALLENGE) as GameMode}
    {isGameActive}
    onOpenSettings={openSettings}
    onEndGame={openConfirmEnd}
    onPause={pauseGame}
    onResume={resumeGame}
  />

  <GameArea
    {gamePhase}
    gameMode={(settings.gameMode ?? GAME_MODE_CHALLENGE) as GameMode}
    {finalScore}
    {isNewHighScore}
    {speedMultiplier}
    bind:tokensLayerEl
    bind:gameAreaEl
    onStart={handleStart}
    onRestart={handleRestart}
    onOpenHelp={() => (helpOpen = true)}
  />

  <InputDisplay {inputEcho} bind:mobileInputEl />
</div>

<ConfirmEndModal
  open={confirmEndOpen}
  onConfirm={doEndGame}
  onCancel={closeConfirmEnd}
/>

<SettingsModal
  open={settingsOpen}
  {settings}
  {isGameActive}
  onClose={closeSettings}
  onSettingChange={applySettingChange}
/>

<HelpModal
  open={helpOpen}
  onClose={() => (helpOpen = false)}
  onOpenKanaReference={() => (kanaRefOpen = true)}
/>

<KanaReferenceModal
  open={kanaRefOpen}
  onClose={() => (kanaRefOpen = false)}
/>

