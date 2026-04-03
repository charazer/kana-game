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
  import StartScreen from './components/StartScreen.svelte'
  import GameOver from './components/GameOver.svelte'
  import ConfirmEndModal from './components/ConfirmEndModal.svelte'
  import SettingsModal from './components/SettingsModal.svelte'
  import HelpModal from './components/HelpModal.svelte'
  import KanaReferenceModal from './components/KanaReferenceModal.svelte'

  import heartFullImg from './assets/img/heart.png'
  import heartEmptyImg from './assets/img/heart_empty.png'
  import buttonPauseImg from './assets/img/button_pause.png'
  import buttonPlayImg from './assets/img/button_play.png'
  import buttonXImg from './assets/img/button_x.png'
  import configImg from './assets/img/config.png'

  // ── Game phase ──────────────────────────────────────────────────────────────
  type GamePhase = 'start' | 'playing' | 'paused' | 'over'
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

  // ── DOM refs ─────────────────────────────────────────────────────────────────
  let tokensLayerEl: HTMLElement | undefined = $state()
  let gameAreaEl: HTMLElement | undefined = $state()
  let mobileInputEl: HTMLInputElement | undefined = $state()
  let scoreEl: HTMLElement | undefined = $state()
  let comboEl: HTMLElement | undefined = $state()
  let speedEl: HTMLElement | undefined = $state()
  let livesEl: HTMLElement | undefined = $state()

  // ── Engine refs ───────────────────────────────────────────────────────────────
  let engine: GameEngine
  let audio: AudioManager
  let input: InputManager
  let wasPausedBeforeSettings = false
  let isGameActive = $derived(gamePhase === 'playing' || gamePhase === 'paused')

  // ── Animation helpers ────────────────────────────────────────────────────────
  function flashStat(el: HTMLElement | null | undefined, className = 'stat-highlight') {
    if (!el) return
    el.classList.remove(className)
    void el.offsetWidth
    el.classList.add(className)
    el.addEventListener('animationend', () => el.classList.remove(className), { once: true })
  }

  function pressAnimation(btn: HTMLElement | null | undefined) {
    if (!btn) return
    btn.classList.remove('btn-press-pop')
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        btn.classList.add('btn-press-pop')
        btn.addEventListener('animationend', () => btn.classList.remove('btn-press-pop'), { once: true })
      })
    })
  }

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
    const startBtn = screenEl?.querySelector<HTMLElement>('button')
    pressAnimation(startBtn)
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
    if (gamePhase !== 'playing') return
    pauseGame()
    input.enabled = false
    input.buffer = ''
    confirmEndOpen = true
  }

  function closeConfirmEnd() {
    confirmEndOpen = false
    if (gamePhase === 'paused') {
      resumeGame()
    }
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
    // Escape: open confirm-end when playing (modals handle their own Escape)
    if (e.code === 'Escape' && gamePhase === 'playing' && !confirmEndOpen && !settingsOpen && !helpOpen && !kanaRefOpen) {
      e.preventDefault()
      e.stopImmediatePropagation()
      openConfirmEnd()
      return
    }
    // Space: pause/resume (only when modals are closed)
    if (e.code === 'Space' && !confirmEndOpen && !settingsOpen && !helpOpen && !kanaRefOpen) {
      if (gamePhase === 'playing') { e.preventDefault(); pauseGame() }
      else if (gamePhase === 'paused') { e.preventDefault(); resumeGame() }
      return
    }
    // Enter: start from start-screen or restart from game-over
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
    // Load persisted settings
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

    // Build core objects
    const renderer = new DOMRenderer(tokensLayerEl!)
    new ResizeObserver(() => renderer.invalidateCache()).observe(tokensLayerEl!)

    input = new InputManager()
    audio = new AudioManager()

    // Mobile support
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

    // Audio setup
    audio.initMusic(
      async () => (await import('./assets/audio/yukarinoti_japanese_mood2.mp3')).default,
      settings.musicVolume ?? 0.3
    )
    audio.setEnabled(settings.audioEnabled !== false)

    // Engine
    engine = new GameEngine({
      renderer,
      input,
      onScore: (s: number) => {
        requestAnimationFrame(() => {
          score = s
          flashStat(scoreEl?.parentElement)
        })
        audio.playSuccess()
      },
      onCombo: (c: number) => {
        requestAnimationFrame(() => {
          combo = c
          if (c > 0) flashStat(comboEl?.parentElement)
        })
      },
      onSpeedChange: (m: number) => {
        speedMultiplier = m
        flashStat(speedEl?.parentElement)
        if (gameAreaEl) {
          const el = gameAreaEl
          el.classList.remove('speed-flash')
          void el.offsetWidth
          el.classList.add('speed-flash')
          el.addEventListener('animationend', () => el.classList.remove('speed-flash'), { once: true })
        }
        const w = renderer.getHeight() * GAME_AREA_WIDTH_MULTIPLIER
        renderer.showFloatingText(w / 2, renderer.getHeight() / 2, `SPEED UP! ${m.toFixed(1)}x`, 'speed')
        audio.playSpeedIncrease()
      },
      onLivesChange: (l: number, prev?: number) => {
        lives = l
        if (prev !== undefined && l < prev) {
          flashStat(livesEl?.parentElement, 'stat-shake')
          audio.playLifeLost()
        }
      },
      onGameOver: () => {
        finalScore = engine.score
        isNewHighScore = engine.gameMode === GAME_MODE_CHALLENGE && isHighScore(finalScore)
        if (isNewHighScore) addHighScore(finalScore)
        audio.playGameOver()
        gamePhase = 'over'
      }
    })

    // Apply saved settings to engine
    engine.setGameMode(settings.gameMode as GameMode)
    engine.loadKana(settings.kanaSet as KanaSet)
    engine.includeDakuten = settings.includeDakuten !== false
    engine.includeYoon = settings.includeYoon !== false

    // Wire input echo
    input.onKey = (buffer) => {
      inputEcho = buffer || '_'
    }
  })
</script>

<svelte:window onkeydown={onKeydown} />

<div id="app">
  <header>
    <button
      id="settings-btn"
      class="btn-settings"
      aria-label="Open settings"
      onclick={openSettings}
    >
      <span class="btn-icon-wrap">
        <img src={configImg} alt="" class="btn-icon" aria-hidden="true" width="87" height="95" fetchpriority="high" />
      </span>
      <span class="btn-label">Settings</span>
    </button>

    <div class="header-title">
      <h1>Kana Game | 仮名ゲーム</h1>
    </div>

    <div class="header-controls">
      <div class="control-section stats-section" role="region" aria-label="Game statistics">
        <div class="section-items">
          <div class="stat-box score-box">
            <span class="stat-label" id="score-label">Score</span>
            <div bind:this={scoreEl} id="score" aria-labelledby="score-label" role="status" aria-live="polite">{score}</div>
          </div>
          <div class="stat-box combo-box">
            <span class="stat-label" id="combo-label">Combo</span>
            <div bind:this={comboEl} id="combo" aria-labelledby="combo-label" role="status">{combo}x</div>
          </div>
          <div class="stat-box speed-box">
            <span class="stat-label" id="speed-label">Speed</span>
            <div bind:this={speedEl} id="speed" aria-labelledby="speed-label" role="status">{speedMultiplier.toFixed(1)}x</div>
          </div>
          <div
            class="stat-box lives-box"
            style:display={settings.gameMode === GAME_MODE_PRACTICE ? 'none' : undefined}
          >
            <span class="stat-label" id="lives-label">Lives</span>
            <div bind:this={livesEl} id="lives" aria-labelledby="lives-label" role="status">
              {#each { length: INITIAL_LIVES } as _, i}
                <img
                  src={i < lives ? heartFullImg : heartEmptyImg}
                  alt={i < lives ? '❤️' : '♡'}
                  class="heart-icon"
                />
              {/each}
            </div>
          </div>
        </div>
      </div>

      <div class="control-section controls-section">
        <div class="section-items">
          <button
            id="end-game"
            class="btn-end-game"
            aria-label="End game"
            disabled={!isGameActive}
            onclick={() => { pressAnimation(document.getElementById('end-game')); openConfirmEnd() }}
          >
            <span class="btn-icon-wrap">
              <img src={buttonXImg} alt="" class="btn-icon" aria-hidden="true" width="82" height="87" fetchpriority="high" />
            </span>
            <span class="btn-label">End</span>
          </button>
          <button
            id="pause"
            class="btn-pause"
            aria-label={gamePhase === 'paused' ? 'Resume game' : 'Pause game'}
            disabled={!isGameActive}
            onclick={() => {
              pressAnimation(document.getElementById('pause'))
              if (gamePhase === 'playing') pauseGame()
              else if (gamePhase === 'paused') resumeGame()
            }}
          >
            <span class="btn-icon-wrap">
              <img
                src={gamePhase === 'paused' ? buttonPlayImg : buttonPauseImg}
                alt=""
                class="btn-icon"
                aria-hidden="true"
                width="82"
                height="87"
              />
            </span>
            <span class="btn-label">{gamePhase === 'paused' ? 'Resume' : 'Pause'}</span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <main bind:this={gameAreaEl} id="game-area" role="application" aria-label="Kana typing game">
    <div id="paused-indicator" class="paused-indicator" class:hidden={gamePhase !== 'paused'} role="status" aria-live="polite">
      <div class="paused-text">
        <img src={buttonPauseImg} alt="" class="paused-icon" aria-hidden="true" width="82" height="87" loading="lazy" />
        PAUSED
      </div>
    </div>

    <div bind:this={tokensLayerEl} id="tokens" role="region" aria-label="Falling kana characters"></div>

    {#if gamePhase === 'start'}
      <StartScreen
        gameMode={(settings.gameMode ?? GAME_MODE_CHALLENGE) as GameMode}
        onStart={handleStart}
        onOpenHelp={() => (helpOpen = true)}
      />
    {/if}

    <GameOver
      visible={gamePhase === 'over'}
      gameMode={(settings.gameMode ?? GAME_MODE_CHALLENGE) as GameMode}
      {finalScore}
      {isNewHighScore}
      onRestart={handleRestart}
      onOpenHelp={() => (helpOpen = true)}
    />
  </main>

  <footer>
    <div id="input-display">
      <label for="input-echo">Your input:</label>
      <input
        bind:this={mobileInputEl}
        id="mobile-input"
        type="text"
        inputmode="text"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck={false}
        aria-label="Type romaji here"
        tabindex="-1"
      />
      <div id="input-echo" role="status" aria-live="polite">{inputEcho}</div>
    </div>
  </footer>
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
