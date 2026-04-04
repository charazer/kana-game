<script lang="ts">
  interface Props {
    onclick: () => void
  }

  const { onclick }: Props = $props()
</script>

<!-- svelte-ignore a11y_invalid_attribute -->
<a href="#" class="how-to-play-link" onclick={(e) => { e.preventDefault(); onclick() }}>
  📖 How to play
</a>

<style>
  .how-to-play-link {
    display: inline-block;
    margin-top: var(--space-4);
    color: var(--accent-light);
    text-decoration: none;
    font-size: var(--font-xl);
    font-weight: var(--font-semibold);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
  }

  .how-to-play-link:hover {
    color: var(--accent-light);
    background: var(--accent-10);
    transform: translateY(-1px);
  }
</style>
