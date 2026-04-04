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

<style>
  .high-scores-list {
    margin: var(--space-6) 0;
    padding: var(--space-4);
    background: var(--black-30);
    border-radius: var(--radius-lg);
    min-width: 240px;
    max-height: 200px;
    overflow-y: auto;
  }

  .high-scores-list h3 {
    margin: 0 0 var(--space-4) 0;
    font-size: var(--font-sm);
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--white-60);
  }

  .high-score-message {
    color: var(--white-40);
    font-size: var(--font-sm);
    padding: var(--space-2);
    margin: 0;
  }

  .high-score-entry {
    display: flex;
    justify-content: space-between;
    padding: var(--space-2) var(--space-3);
    margin: var(--space-1) 0;
    background: var(--white-5);
    border-radius: var(--radius-sm);
    font-size: var(--font-sm);
  }

  .high-score-entry.highlight {
    background: var(--color-success-bg);
    border: 1px solid var(--color-success-border);
  }

  .high-score-rank { color: var(--white-50); min-width: 30px; }
  .high-score-value { color: var(--color-success); font-weight: var(--font-bold); font-family: var(--font-mono); }
  .high-score-date { color: var(--white-40); font-size: var(--font-sm); }

  /* ── Responsive ─────────────────────────────────────────────────────────── */
  @media (min-width: 480px) {
    .high-scores-list { margin: var(--space-7) 0; padding: var(--space-5); min-width: 260px; max-height: 220px; }
    .high-scores-list h3 { margin: 0 0 var(--space-5) 0; font-size: var(--font-md); }
    .high-score-entry { padding: var(--space-2) var(--space-4); }
  }

  @media (min-width: 768px) {
    .high-scores-list { margin: var(--space-8) 0; padding: var(--space-6); min-width: 280px; max-height: 240px; }
    .high-scores-list h3 { margin: 0 0 var(--space-6) 0; }
    .high-score-entry { padding: var(--space-3) var(--space-4); margin: var(--space-2) 0; font-size: var(--font-md); }
  }
</style>
