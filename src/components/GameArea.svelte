<script lang="ts">
  import { untrack } from 'svelte'
  import type { GamePhase } from '../game/core/types'
  import type { GameMode } from '../game/constants/constants'
  import StartScreen from './StartScreen.svelte'
  import GameOver from './GameOver.svelte'
  import buttonPauseImg from '../assets/img/button_pause.png'

  interface Props {
    gamePhase: GamePhase
    gameMode: GameMode
    finalScore: number
    isNewHighScore: boolean
    speedMultiplier: number
    tokensLayerEl?: HTMLElement
    gameAreaEl?: HTMLElement
    onStart: () => void
    onRestart: () => void
    onOpenHelp: () => void
  }

  let {
    gamePhase,
    gameMode,
    finalScore,
    isNewHighScore,
    speedMultiplier,
    tokensLayerEl = $bindable(),
    gameAreaEl = $bindable(),
    onStart,
    onRestart,
    onOpenHelp,
  }: Props = $props()

  let prevSpeed = untrack(() => speedMultiplier)
  $effect(() => {
    const m = speedMultiplier
    if (m !== prevSpeed) {
      prevSpeed = m
      if (gameAreaEl) {
        const el = gameAreaEl
        el.classList.remove('speed-flash')
        void el.offsetWidth
        el.classList.add('speed-flash')
        el.addEventListener('animationend', () => el.classList.remove('speed-flash'), { once: true })
      }
    }
  })
</script>

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
      {gameMode}
      onStart={onStart}
      onOpenHelp={onOpenHelp}
    />
  {/if}

  <GameOver
    visible={gamePhase === 'over'}
    {gameMode}
    {finalScore}
    {isNewHighScore}
    onRestart={onRestart}
    onOpenHelp={onOpenHelp}
  />
</main>
