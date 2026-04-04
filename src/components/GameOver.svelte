<script lang="ts">
  import HighScoresList from './HighScoresList.svelte'
  import GameButton from './GameButton.svelte'
  import HowToPlayLink from './HowToPlayLink.svelte'
  import type { GameMode } from '../game/constants/constants'
  import buttonPlayAgainImg from '../assets/img/button_play_again.png'

  interface Props {
    gameMode: GameMode
    finalScore: number
    isNewHighScore: boolean
    visible: boolean
    onRestart: () => void
    onOpenHelp: () => void
  }

  const { gameMode, finalScore, isNewHighScore, visible, onRestart, onOpenHelp }: Props = $props()
</script>

<div id="game-over" class:hidden={!visible} role="dialog" aria-labelledby="game-over-title">
  <div class="game-over-content">
    <h2 id="game-over-title">Game Over!</h2>
    <p class="final-score">Final Score: <span id="final-score">{finalScore}</span></p>
    {#if isNewHighScore}
      <p id="new-high-score" class="new-high-score" role="status" aria-live="polite">
        🎉 New High Score! 🎉
      </p>
    {/if}
    <p><HowToPlayLink onclick={onOpenHelp} /></p>
    <HighScoresList id="high-scores-end" {gameMode} highlightScore={isNewHighScore ? finalScore : undefined} />
    <GameButton
      id="restart"
      variant="restart"
      ariaLabel="Play again"
      imgSrc={buttonPlayAgainImg}
      imgWidth={82}
      imgHeight={87}
      label="Play Again"
      loading="lazy"
      onclick={onRestart}
    />
  </div>
</div>

<style>
  /* ── Screen overlay ─────────────────────────────────────────────────────── */
  #game-over {
    position: absolute;
    inset: 0;
    background: var(--black-85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-overlay);
    backdrop-filter: blur(var(--backdrop-blur-sm));
    animation: screen-overlay-in 0.35s ease forwards;
  }

  #game-over.hidden { display: none; }

  #game-over:not(.hidden) :global(.game-over-content) {
    animation: card-enter 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  :global(#game-over.screen-exiting .game-over-content) {
    animation: card-exit 0.28s cubic-bezier(0.4, 0, 0.6, 1) both;
  }

  @keyframes screen-overlay-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes card-enter {
    from { opacity: 0; transform: scale(0.82) translateY(28px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  @keyframes card-exit {
    from { opacity: 1; transform: scale(1) translateY(0); }
    to   { opacity: 0; transform: scale(0.88) translateY(16px); }
  }

  /* ── Card ───────────────────────────────────────────────────────────────── */
  .game-over-content {
    background: linear-gradient(135deg, var(--accent-18), var(--combo-18));
    border: var(--token-border) solid var(--accent);
    border-radius: var(--radius-2xl);
    padding: var(--space-7);
    text-align: center;
    max-width: 280px;
    box-shadow: 0 8px 32px var(--accent-30), 0 0 1px var(--white-10) inset;
    backdrop-filter: blur(12px);
  }

  .game-over-content h2 {
    margin: 0 0 var(--space-6) 0;
    font-size: var(--font-2xl);
    color: var(--accent);
    font-family: Georgia, 'Times New Roman', serif;
    letter-spacing: 4px;
  }

  .game-over-content p {
    font-size: var(--font-md);
    margin: var(--space-4) 0 var(--space-6) 0;
    color: var(--fg);
  }

  .final-score {
    font-size: var(--font-xl);
    margin: var(--space-4) 0;
    color: var(--fg);
  }

  .final-score span {
    font-size: var(--font-2xl);
    font-weight: var(--font-bold);
    color: var(--color-success);
    font-family: var(--font-mono);
  }

  .new-high-score {
    font-size: var(--font-lg);
    font-weight: var(--font-bold);
    color: var(--color-success);
    margin: var(--space-3) 0 var(--space-5) 0;
    animation: pulse-glow 1s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }

  /* ── Responsive ─────────────────────────────────────────────────────────── */
  @media (min-width: 480px) {
    .game-over-content {
      padding: var(--space-9);
      max-width: 340px;
      border-radius: var(--radius-2xl);
    }
    .game-over-content h2 { margin: 0 0 var(--space-7) 0; font-size: var(--font-3xl); }
    .final-score { font-size: var(--font-xl); margin: var(--space-5) 0; }
    .new-high-score { font-size: var(--font-xl); margin: var(--space-4) 0 var(--space-6) 0; }
  }

  @media (min-width: 768px) {
    .game-over-content { max-width: 400px; }
    .final-score { font-size: var(--font-2xl); margin: var(--space-7) 0 var(--space-4) 0; }
    .final-score span { font-size: var(--font-3xl); }
  }
</style>
