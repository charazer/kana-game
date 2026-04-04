<script lang="ts">
  import HighScoresList from './HighScoresList.svelte'
  import GameButton from './GameButton.svelte'
  import HowToPlayLink from './HowToPlayLink.svelte'
  import type { GameMode } from '../game/constants/constants'
  import buttonPlayImg from '../assets/img/button_play.png'

  interface Props {
    gameMode: GameMode
    onStart: () => void
    onOpenHelp: () => void
  }

  const { gameMode, onStart, onOpenHelp }: Props = $props()
</script>

<div id="start-screen">
  <div class="start-screen-content">
    <h2>🌸 ようこそ ✨</h2>
    <p><HowToPlayLink onclick={onOpenHelp} /></p>
    <HighScoresList id="high-scores-start" {gameMode} />
    <GameButton
      id="start"
      variant="start"
      ariaLabel="Start game"
      imgSrc={buttonPlayImg}
      imgWidth={83}
      imgHeight={88}
      label="Start Game"
      onclick={onStart}
    />
  </div>
</div>

<style>
  /* ── Screen overlay ─────────────────────────────────────────────────────── */
  #start-screen {
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

  #start-screen :global(.start-screen-content) {
    animation: card-enter 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  :global(#start-screen.screen-exiting .start-screen-content) {
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
  .start-screen-content {
    background: linear-gradient(135deg, var(--accent-18), var(--combo-18));
    border: var(--token-border) solid var(--accent);
    border-radius: var(--radius-2xl);
    padding: var(--space-7);
    text-align: center;
    max-width: 280px;
    box-shadow: 0 8px 32px var(--accent-30), 0 0 1px var(--white-10) inset;
    backdrop-filter: blur(12px);
  }

  .start-screen-content h2 {
    margin: 0 0 var(--space-6) 0;
    font-size: var(--font-2xl);
    color: var(--accent);
    font-family: Georgia, 'Times New Roman', serif;
    letter-spacing: 4px;
  }

  .start-screen-content p {
    font-size: var(--font-md);
    margin: var(--space-4) 0 var(--space-6) 0;
    color: var(--fg);
  }

  /* ── Responsive ─────────────────────────────────────────────────────────── */
  @media (min-width: 480px) {
    .start-screen-content {
      padding: var(--space-9);
      max-width: 340px;
      border-radius: var(--radius-2xl);
    }
    .start-screen-content h2 { margin: 0 0 var(--space-7) 0; font-size: var(--font-3xl); }
    .start-screen-content p { font-size: var(--font-lg); margin: var(--space-5) 0 var(--space-7) 0; }
  }

  @media (min-width: 768px) {
    .start-screen-content { max-width: 400px; }
    .start-screen-content p { font-size: var(--font-xl); margin: var(--space-7) 0 var(--space-10) 0; }
  }
</style>
