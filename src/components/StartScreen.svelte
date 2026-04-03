<script lang="ts">
  import HighScoresList from './HighScoresList.svelte'
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
    <p>
      <!-- svelte-ignore a11y_invalid_attribute -->
      <a href="#" class="how-to-play-link" onclick={(e) => { e.preventDefault(); onOpenHelp() }}>📖 How to play</a>
    </p>
    <HighScoresList id="high-scores-start" {gameMode} />
    <button
      id="start"
      class="btn-start"
      aria-label="Start game"
      onclick={onStart}
    >
      <span class="btn-icon-wrap">
        <img src={buttonPlayImg} alt="" class="btn-icon" aria-hidden="true" width="83" height="88" />
      </span>
      <span class="btn-label">Start Game</span>
    </button>
  </div>
</div>
