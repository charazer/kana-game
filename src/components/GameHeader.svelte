<script lang="ts">
  import { untrack } from 'svelte'
  import GameButton from './GameButton.svelte'
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

  function flashStat(el: HTMLElement | null | undefined, className = 'stat-highlight') {
    if (!el) return
    el.classList.remove(className)
    void el.offsetWidth
    el.classList.add(className)
    el.addEventListener('animationend', () => el.classList.remove(className), { once: true })
  }

  let prevScore = untrack(() => score)
  $effect(() => {
    const s = score
    if (s !== prevScore) { prevScore = s; flashStat(scoreEl?.parentElement) }
  })

  let prevCombo = untrack(() => combo)
  $effect(() => {
    const c = combo
    if (c !== prevCombo) { prevCombo = c; if (c > 0) flashStat(comboEl?.parentElement) }
  })

  let prevSpeed = untrack(() => speedMultiplier)
  $effect(() => {
    const m = speedMultiplier
    if (m !== prevSpeed) { prevSpeed = m; flashStat(speedEl?.parentElement) }
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
        <GameButton
          id="end-game"
          variant="end"
          ariaLabel="End game"
          imgSrc={buttonXImg}
          imgWidth={82}
          imgHeight={87}
          label="End"
          fetchpriority="high"
          disabled={!isGameActive}
          onclick={onEndGame}
        />
        <GameButton
          id="pause"
          variant="pause"
          ariaLabel={gamePhase === 'paused' ? 'Resume game' : 'Pause game'}
          imgSrc={gamePhase === 'paused' ? buttonPlayImg : buttonPauseImg}
          imgWidth={82}
          imgHeight={87}
          label={gamePhase === 'paused' ? 'Resume' : 'Pause'}
          disabled={!isGameActive}
          onclick={gamePhase === 'playing' ? onPause : onResume}
        />
      </div>
    </div>
  </div>
</header>

<style>
  /* ── Header ─────────────────────────────────────────────────────────────── */
  header {
    background: linear-gradient(135deg, var(--black-70), var(--black-65));
    border-bottom: var(--token-border) solid var(--accent-30);
    padding: var(--space-2) var(--space-3);
    padding-top: var(--space-9);
    width: 100%;
    flex-shrink: 0;
    position: relative;
    box-sizing: border-box;
    backdrop-filter: blur(var(--backdrop-blur-md));
  }

  header::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 20% 30%, var(--accent-08) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, var(--combo-06) 0%, transparent 50%);
    pointer-events: none;
  }

  .header-title,
  .header-controls {
    max-width: var(--game-max-width);
    margin-left: auto;
    margin-right: auto;
  }

  .header-title {
    text-align: center;
    padding-bottom: var(--space-2);
    margin-bottom: var(--space-3);
    border-bottom: 1px solid var(--accent-20);
  }

  .header-title h1 {
    margin: 0;
    font-size: var(--font-md);
    font-weight: var(--font-bold);
    color: var(--accent);
    letter-spacing: 3px;
    font-family: Georgia, 'Times New Roman', serif;
  }

  .header-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    position: relative;
    min-height: 100px;
  }

  .control-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    overflow: visible;
    box-sizing: border-box;
    max-width: 100%;
  }

  .section-items {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    max-width: 100%;
    box-sizing: border-box;
  }

  .controls-section {
    position: static;
    max-width: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

  .controls-section .section-items {
    justify-content: center;
    flex-direction: row;
    gap: var(--space-3);
    width: 100%;
    max-width: 100%;
    padding: 0;
    flex-wrap: wrap;
  }

  /* ── Settings button ────────────────────────────────────────────────────── */
  .btn-settings {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    background: linear-gradient(135deg, var(--accent-15), var(--combo-10));
    border: 1px solid var(--accent-30);
    color: var(--fg);
    padding: var(--space-4) var(--space-3);
    border-radius: var(--radius-lg);
    cursor: pointer;
    font-size: var(--font-sm);
    font-weight: var(--font-bold);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    transition: transform var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast);
    white-space: nowrap;
    z-index: 10;
  }

  .btn-settings .btn-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-settings .btn-icon-wrap .btn-icon { width: 24px; height: 24px; display: block; }
  .btn-settings .btn-label { display: none; }

  .btn-settings:hover {
    background: linear-gradient(135deg, var(--accent-20), var(--combo-15));
    border-color: var(--accent-40);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px var(--plum-shadow);
  }

  .btn-settings:active { transform: translateY(0); }

  /* ── Stats ──────────────────────────────────────────────────────────────── */
  .stats-section .section-items { justify-content: center; max-width: 100%; box-sizing: border-box; }

  .stat-box {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    align-items: center;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    border: 1px solid;
    min-width: 46px;
  }

  .stat-box .stat-label {
    font-size: var(--font-sm);
    font-weight: var(--font-semibold);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-box > div {
    font-size: var(--font-lg);
    font-weight: var(--font-bold);
    font-family: var(--font-mono);
    line-height: 1;
  }

  .score-box { background: var(--color-success-bg); border-color: var(--color-success-border); }
  .score-box .stat-label { color: var(--color-success-light); }
  .score-box #score { color: var(--color-success); }

  .combo-box { background: var(--color-combo-bg); border-color: var(--color-combo-border); }
  .combo-box .stat-label { color: var(--color-combo-light); }
  .combo-box #combo { color: var(--color-combo); }

  .speed-box { background: var(--accent-15); border-color: var(--accent-30); }
  .speed-box .stat-label { color: var(--accent-80); }
  .speed-box #speed { color: var(--accent); }

  .lives-box { background: var(--color-error-bg); border-color: var(--color-error-border); }
  .lives-box .stat-label { color: var(--color-error-light); }
  .lives-box #lives {
    letter-spacing: 1px;
    white-space: nowrap;
    min-height: 1em;
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .heart-icon { width: 16px; height: 16px; display: inline-block; vertical-align: middle; }

  /* Stat animations — applied dynamically via classList.add(), must be global */
  :global(.stat-highlight) { animation: stat-pulse 300ms ease-out; will-change: transform; }

  @keyframes stat-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); }
  }

  :global(.stat-shake) { animation: shake 400ms ease-out; will-change: transform; }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }

  /* ── Responsive ─────────────────────────────────────────────────────────── */
  @media (min-width: 480px) {
    header { padding: var(--space-3) var(--space-4); padding-top: var(--space-9); }
    .header-title { padding-bottom: var(--space-3); margin-bottom: var(--space-4); }
    .header-title h1 { font-size: var(--font-xl); }
    .control-section { gap: var(--space-3); }
    .section-items { gap: var(--space-3); }
    .btn-settings { top: var(--space-3); right: var(--space-4); padding: var(--space-2) var(--space-4); }
    .stat-box { padding: var(--space-3) var(--space-4); min-width: 50px; gap: var(--space-2); border-radius: var(--radius-md); }
    .stat-box > div { font-size: var(--font-xl); }
    .heart-icon { width: 20px; height: 20px; }
  }

  @media (min-width: 768px) {
    header { padding: var(--space-4) var(--space-6); padding-top: var(--space-10); }
    .header-title { padding-bottom: var(--space-4); margin-bottom: var(--space-6); }
    .header-title h1 { font-size: var(--font-3xl); }
    .header-controls { justify-content: center; gap: var(--space-5); }
    .control-section { gap: var(--space-4); }
    .section-items { gap: var(--space-4); }
    .btn-settings { top: var(--space-4); right: var(--space-6); padding: var(--space-3) var(--space-6); font-size: var(--font-md); }
    .btn-settings .btn-label { display: inline; }
    .btn-settings .btn-icon-wrap .btn-icon { width: 28px; height: 28px; }
    .stat-box { padding: var(--space-4) var(--space-5); min-width: 75px; gap: var(--space-4); border-width: 1px; }
    .heart-icon { width: 24px; height: 24px; }
  }

  @media (min-width: 1024px) {
    header { padding: var(--space-6) var(--space-7); }
    .header-title { padding-bottom: var(--space-7); margin-bottom: var(--space-7); }
    .header-title h1 { font-size: var(--font-4xl); }
    .btn-settings { top: var(--space-5); right: var(--space-7); padding: var(--space-4) var(--space-7); font-size: var(--font-lg); gap: var(--space-6); }
    .btn-settings .btn-icon-wrap .btn-icon { width: 32px; height: 32px; }
    .stat-box { padding: var(--space-5) var(--space-6); min-width: 85px; gap: var(--space-6); border-width: 2px; border-radius: var(--radius-lg); }
    .stat-box > div { font-size: var(--font-2xl); }
    .lives-box #lives { letter-spacing: var(--space-1); }
    .heart-icon { width: 28px; height: 28px; }
  }

  @media (min-width: 1280px) {
    .header-controls { flex-direction: row; justify-content: center; align-items: start; }
    .controls-section { position: absolute; right: 0; top: 0; z-index: 5; }
    .controls-section .section-items { flex-direction: column; gap: var(--space-3); }
  }

  /* ── Mobile keyboard compact layout ─────────────────────────────────────── */
  :global(body.keyboard-visible) header { padding: var(--space-2) var(--space-3); }
  :global(body.keyboard-visible) .header-title { display: none; }
  :global(body.keyboard-visible) .header-controls { flex-direction: row; flex-wrap: nowrap; align-items: center; justify-content: center; gap: var(--space-2); min-height: auto; }
  :global(body.keyboard-visible) .header-controls .control-section { display: contents; }
  :global(body.keyboard-visible) .header-controls .section-items { display: contents; }
  :global(body.keyboard-visible) .stat-label { display: none; }
  :global(body.keyboard-visible) .stat-box { padding: var(--space-2) var(--space-3); gap: 0; min-width: 0; border-radius: var(--radius-sm); }
  :global(body.keyboard-visible) .stat-box > div { font-size: var(--font-lg); line-height: 1.2; }
  :global(body.keyboard-visible) .heart-icon { width: 14px; height: 14px; }
  /* #end-game and #pause live inside GameButton (child component) — must be fully global */
  :global(body.keyboard-visible #end-game) { order: -1; }
  :global(body.keyboard-visible #pause) { order: 1; }
  :global(body.keyboard-visible) .btn-settings { top: var(--space-2); padding: var(--space-2) var(--space-3); }
  :global(body.keyboard-visible) .btn-settings .btn-label { display: none; }
  :global(body.keyboard-visible) .btn-settings .btn-icon-wrap .btn-icon { width: 22px; height: 22px; }

  /* ── Small screen ───────────────────────────────────────────────────────── */
  @media (max-width: 479px) {
    header { backdrop-filter: none; }
  }
</style>
