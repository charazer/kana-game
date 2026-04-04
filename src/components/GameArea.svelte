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
    compact?: boolean
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
    compact = false,
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

<main bind:this={gameAreaEl} id="game-area" role="application" aria-label="Kana typing game" class:compact>
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

<style>
  /* ── Main game area ─────────────────────────────────────────────────────── */
  main#game-area {
    position: relative;
    flex: 1;
    max-height: calc(100vh - 110px);
    overflow: hidden;
    max-width: var(--game-max-width);
    margin: 0 auto;
    width: 100%;
    background: var(--bg);
    contain: layout style paint;
  }

  /* Speed flash overlay — animates opacity only (GPU-composited) */
  main#game-area::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--accent-30);
    opacity: 0;
    pointer-events: none;
    will-change: opacity;
  }

  /* .speed-flash is added dynamically via classList.add() — must be global */
  :global(main#game-area.speed-flash)::before {
    animation: speed-flash-anim 600ms ease-out forwards;
  }

  @keyframes speed-flash-anim {
    0%   { opacity: 0; }
    15%  { opacity: 1; }
    100% { opacity: 0; }
  }

  /* ── Tokens container ───────────────────────────────────────────────────── */
  #tokens {
    position: absolute;
    inset: 0;
    border-left: 1px solid var(--white-5);
    border-right: 1px solid var(--white-5);
    contain: layout style;
  }

  #tokens::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--danger-zone-height);
    background: linear-gradient(to top, var(--color-error-bg), transparent);
    border-top: var(--token-border) dashed var(--color-error-border);
    pointer-events: none;
    opacity: 0.8;
  }

  /* ── Paused indicator ───────────────────────────────────────────────────── */
  .paused-indicator {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--black-85);
    backdrop-filter: blur(8px);
    z-index: 150;
    pointer-events: none;
  }

  .paused-indicator:not(.hidden) {
    animation: paused-overlay-in 0.22s ease both;
  }

  @keyframes paused-overlay-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .paused-text {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    font-size: var(--font-4xl);
    font-weight: var(--font-bold);
    color: var(--accent);
    user-select: none;
  }

  .paused-indicator:not(.hidden) .paused-text {
    animation:
      paused-text-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both,
      paused-pulse 2s ease-in-out 0.4s infinite;
  }

  @keyframes paused-text-enter {
    from { opacity: 0; transform: scale(0.65); letter-spacing: 0.35em; }
    to   { opacity: 1; transform: scale(1); letter-spacing: normal; }
  }

  @keyframes paused-pulse {
    0%, 100% { opacity: 0.8; transform: scale(1); }
    50%       { opacity: 1;   transform: scale(1.05); }
  }

  .paused-icon { width: 3rem; height: 3rem; }

  @media (min-width: 480px) {
    .paused-text { font-size: var(--font-5xl); }
    .paused-icon { width: 4rem; height: 4rem; }
  }

  @media (min-width: 768px) {
    .paused-text { font-size: 4rem; }
    .paused-icon { width: 5rem; height: 5rem; }
  }

  /* ── Responsive game area height ────────────────────────────────────────── */
  @media (min-width: 480px)  { main#game-area { max-height: calc(100vh - 150px); } }
  @media (min-width: 768px)  { main#game-area { max-height: calc(100vh - 140px); } }
  @media (min-width: 1024px) { main#game-area { max-height: calc(100vh - 170px); } }
  @media (min-width: 1280px) { main#game-area { max-height: calc(100vh - 280px); } }

  /* ── Mobile keyboard compact layout ─────────────────────────────────────── */
  main#game-area.compact {
    flex: 1;
    max-height: none;
    --danger-zone-height: 60px;
  }
</style>
