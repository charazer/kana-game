<script lang="ts">
  import KanaReference from './KanaReference.svelte'

  interface Props {
    open: boolean
    onClose: () => void
  }

  const { open, onClose }: Props = $props()

  let activeTab = $state<'hiragana' | 'katakana'>('hiragana')

  function onKeydown(e: KeyboardEvent) {
    if (!open) return
    if (e.code === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  $effect(() => {
    if (open) activeTab = 'hiragana'
  })
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
  <div id="kana-modal" class="modal" role="dialog" aria-labelledby="kana-title" aria-modal="true">
    <div class="modal-overlay" role="presentation" onclick={onClose}></div>
    <div class="modal-content kana-modal-content">
      <div class="modal-header">
        <h2 id="kana-title">📚 Kana Reference</h2>
        <button id="kana-close" class="btn-modal-close" aria-label="Close kana reference" onclick={onClose}>
          <span>✕</span>
        </button>
      </div>
      <div class="modal-body">
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
      </div>
    </div>
  </div>
{/if}
