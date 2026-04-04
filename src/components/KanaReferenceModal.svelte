<script lang="ts">
  import Modal from './Modal.svelte'
  import KanaReference from './KanaReference.svelte'

  interface Props {
    open: boolean
    onClose: () => void
  }

  const { open, onClose }: Props = $props()

  let activeTab = $state<'hiragana' | 'katakana'>('hiragana')

  function onKeydown(e: KeyboardEvent) {
    if (!open) return
    if (e.code === 'Escape') { e.preventDefault(); onClose() }
  }

  $effect(() => { if (open) activeTab = 'hiragana' })
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
  <Modal
    id="kana-modal"
    {open}
    titleId="kana-title"
    onClose={onClose}
    closeButtonId="kana-close"
    closeLabel="Close kana reference"
  >
    {#snippet title()}📚 Kana Reference{/snippet}
    {#snippet body()}
      <div class="kana-tabs" role="tablist">
        <button
          id="tab-hiragana"
          class="kana-tab"
          class:active={activeTab === 'hiragana'}
          role="tab"
          aria-selected={activeTab === 'hiragana'}
          aria-controls="kana-content"
          onclick={() => (activeTab = 'hiragana')}
        >Hiragana (ひらがな)</button>
        <button
          id="tab-katakana"
          class="kana-tab"
          class:active={activeTab === 'katakana'}
          role="tab"
          aria-selected={activeTab === 'katakana'}
          aria-controls="kana-content"
          onclick={() => (activeTab = 'katakana')}
        >Katakana (カタカナ)</button>
      </div>
      <div id="kana-content" class="kana-content">
        <KanaReference type={activeTab} />
      </div>
    {/snippet}
  </Modal>
{/if}

<style>
  /* ── Kana modal sizing ──────────────────────────────────────────────────── */
  :global(#kana-modal .modal-content) {
    width: 1400px;
    max-width: 95vw;
    max-height: 85vh;
  }

  @media (max-width: 767px) {
    :global(#kana-modal .modal-content) { max-width: 95%; }
  }

  @media (max-height: 500px) and (orientation: landscape) {
    .kana-content { max-height: calc(85vh - 120px); }
  }

  /* ── Tabs (underline style) ─────────────────────────────────────────────── */
  .kana-tabs {
    display: flex;
    gap: var(--space-2);
    margin-bottom: var(--space-6);
    border-bottom: 2px solid var(--white-10);
  }

  .kana-tab {
    flex: 1;
    padding: var(--space-3) var(--space-4);
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    color: var(--white-60);
    font-size: var(--font-lg);
    font-weight: var(--font-semibold);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .kana-tab:hover { color: var(--white-80); background: var(--white-5); }
  .kana-tab.active { color: var(--accent-light); border-bottom-color: var(--accent); }

  .kana-content {
    overflow-y: auto;
    max-height: calc(85vh - 200px);
    padding-right: var(--space-2);
  }

  @media (max-width: 767px) {
    .kana-tab { font-size: var(--font-md); padding: var(--space-2) var(--space-3); }
  }
</style>
