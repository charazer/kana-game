<script lang="ts">
  import { getHighScores } from '../game/storage/storage'
  import { GAME_MODE_PRACTICE, type GameMode } from '../game/constants/constants'

  interface Props {
    gameMode: GameMode
    highlightScore?: number
    id?: string
  }

  const { gameMode, highlightScore, id }: Props = $props()

  const entries = $derived(
    getHighScores().map((entry, idx) => ({
      score: entry.score,
      date: entry.date,
      rank: idx + 1,
      highlight: highlightScore === entry.score
    }))
  )
  const isPracticeMode = $derived(gameMode === GAME_MODE_PRACTICE)
</script>

<div class="high-scores-list" {id}>
  {#if isPracticeMode}
    <h3>High Scores</h3>
    <p class="high-score-message">High scores are not recorded in practice mode.</p>
  {:else if entries.length === 0}
    <h3>High Scores</h3>
    <p class="high-score-message">No scores yet!</p>
  {:else}
    <h3>High Scores</h3>
    {#each entries as entry}
      <div class="high-score-entry {entry.highlight ? 'highlight' : ''}">
        <span class="high-score-rank">#{entry.rank}</span>
        <span class="high-score-value">{entry.score}</span>
        <span class="high-score-date">{new Date(entry.date).toLocaleDateString()}</span>
      </div>
    {/each}
  {/if}
</div>
