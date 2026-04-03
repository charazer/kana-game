<script lang="ts">
  interface Props {
    open: boolean
    onConfirm: () => void
    onCancel: () => void
  }

  const { open, onConfirm, onCancel }: Props = $props()

  function onKeydown(e: KeyboardEvent) {
    if (!open) return
    e.stopImmediatePropagation()
    e.preventDefault()
    if (e.key === 'y' || e.key === 'Y' || e.code === 'Enter') onConfirm()
    if (e.key === 'n' || e.key === 'N' || e.code === 'Escape') onCancel()
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div id="confirm-end-modal" class="modal" class:hidden={!open} role="dialog" aria-labelledby="confirm-end-title" aria-modal="true">
    <div class="modal-overlay" role="presentation" onclick={onCancel}></div>
    <div class="modal-content confirm-end-modal-content">
      <div class="modal-header">
        <h2 id="confirm-end-title">End Game?</h2>
      </div>
      <div class="modal-body confirm-end-body">
        <p class="confirm-end-message">Are you sure you want to end the current game?</p>
        <div class="confirm-end-actions">
          <button id="confirm-end-yes" class="btn-confirm btn-confirm-yes" onclick={onConfirm}>
            <span>Yes</span><kbd>Y</kbd>
          </button>
          <button id="confirm-end-no" class="btn-confirm btn-confirm-no" onclick={onCancel}>
            <span>No</span><kbd>N</kbd>
          </button>
        </div>
      </div>
    </div>
  </div>
