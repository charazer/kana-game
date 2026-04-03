<script lang="ts">
  import HighScoresList from './HighScoresList.svelte'
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
    <p>
      <!-- svelte-ignore a11y_invalid_attribute -->
      <a href="#" class="how-to-play-link" onclick={(e) => { e.preventDefault(); onOpenHelp() }}>📖 How to play</a>
    </p>
    <HighScoresList id="high-scores-end" {gameMode} highlightScore={isNewHighScore ? finalScore : undefined} />
    <button
      id="restart"
      class="btn-restart"
      aria-label="Play again"
      onclick={onRestart}
    >
      <span class="btn-icon-wrap">
        <img src={buttonPlayAgainImg} alt="" class="btn-icon" aria-hidden="true" width="82" height="87" loading="lazy" />
      </span>
      <span class="btn-label">Play Again</span>
    </button>
  </div>
</div>
