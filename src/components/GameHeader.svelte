<script lang="ts">
  import { untrack } from 'svelte'
  import type { GamePhase } from '../game/core/types'
  import type { GameMode } from '../game/constants/constants'
  import { GAME_MODE_PRACTICE, INITIAL_LIVES } from '../game/constants/constants'
  import heartFullImg from '../assets/img/heart.png'
  import heartEmptyImg from '../assets/img/heart_empty.png'
  import buttonPauseImg from '../assets/img/button_pause.png'
  import buttonPlayImg from '../assets/img/button_play.png'
  import buttonXImg from '../assets/img/button_x.png'
  import configImg from '../assets/img/config.png'

  interface Props {
    score: number
    combo: number
    speedMultiplier: number
    lives: number
    gamePhase: GamePhase
    gameMode: GameMode
    isGameActive: boolean
    onOpenSettings: () => void
    onEndGame: () => void
    onPause: () => void
    onResume: () => void
  }

  const {
    score, combo, speedMultiplier, lives,
    gamePhase, gameMode, isGameActive,
    onOpenSettings, onEndGame, onPause, onResume,
  }: Props = $props()

  let scoreEl: HTMLElement | undefined = $state()
  let comboEl: HTMLElement | undefined = $state()
  let speedEl: HTMLElement | undefined = $state()
  let livesEl: HTMLElement | undefined = $state()
  let endGameBtn: HTMLButtonElement | undefined = $state()
  let pauseBtn: HTMLButtonElement | undefined = $state()

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

  let prevScore = untrack(() => score)
  $effect(() => {
    const s = score
    if (s !== prevScore) {
      prevScore = s
      flashStat(scoreEl?.parentElement)
    }
  })

  let prevCombo = untrack(() => combo)
  $effect(() => {
    const c = combo
    if (c !== prevCombo) {
      prevCombo = c
      if (c > 0) flashStat(comboEl?.parentElement)
    }
  })

  let prevSpeed = untrack(() => speedMultiplier)
  $effect(() => {
    const m = speedMultiplier
    if (m !== prevSpeed) {
      prevSpeed = m
      flashStat(speedEl?.parentElement)
    }
  })

  let prevLives = untrack(() => lives)
  $effect(() => {
    const l = lives
    if (l < prevLives) flashStat(livesEl?.parentElement, 'stat-shake')
    prevLives = l
  })
</script>

<header>
  <button
    id="settings-btn"
    class="btn-settings"
    aria-label="Open settings"
    onclick={onOpenSettings}
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
          style:display={gameMode === GAME_MODE_PRACTICE ? 'none' : undefined}
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
          bind:this={endGameBtn}
          id="end-game"
          class="btn-end-game"
          aria-label="End game"
          disabled={!isGameActive}
          onclick={() => { pressAnimation(endGameBtn); onEndGame() }}
        >
          <span class="btn-icon-wrap">
            <img src={buttonXImg} alt="" class="btn-icon" aria-hidden="true" width="82" height="87" fetchpriority="high" />
          </span>
          <span class="btn-label">End</span>
        </button>
        <button
          bind:this={pauseBtn}
          id="pause"
          class="btn-pause"
          aria-label={gamePhase === 'paused' ? 'Resume game' : 'Pause game'}
          disabled={!isGameActive}
          onclick={() => {
            pressAnimation(pauseBtn)
            if (gamePhase === 'playing') onPause()
            else if (gamePhase === 'paused') onResume()
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
