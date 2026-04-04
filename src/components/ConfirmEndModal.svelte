<script lang="ts">
  import Modal from './Modal.svelte'

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

<Modal
  id="confirm-end-modal"
  {open}
  titleId="confirm-end-title"
  contentWidth="460px"
>
  {#snippet title()}End Game?{/snippet}
  {#snippet body()}
    <div class="confirm-end-body">
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
  {/snippet}
</Modal>

<style>
  .confirm-end-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .confirm-end-message {
    margin: 0;
    font-size: var(--font-lg);
    color: var(--fg);
    line-height: 1.5;
    text-align: center;
  }

  .confirm-end-actions {
    display: flex;
    gap: var(--space-5);
    justify-content: center;
  }

  .btn-confirm {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-7);
    border: none;
    border-radius: var(--radius-lg);
    font-size: var(--font-lg);
    font-weight: var(--font-bold);
    cursor: pointer;
    transition: all var(--transition-fast);
    min-width: 130px;
    justify-content: center;
  }

  .btn-confirm kbd {
    font-size: var(--font-sm);
    padding: var(--space-1) var(--space-2);
    background: var(--black-20);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    color: inherit;
    border: 1px solid var(--black-30);
  }

  .btn-confirm-yes {
    background: linear-gradient(135deg, var(--color-error), var(--color-error-hover));
    color: var(--black-70);
    box-shadow: var(--shadow-md);
  }

  .btn-confirm-yes:hover {
    background: linear-gradient(135deg, var(--color-error-hover), var(--color-error));
    transform: translateY(-1px);
  }

  .btn-confirm-yes:active { transform: translateY(1px); }

  .btn-confirm-no {
    background: linear-gradient(135deg, var(--accent), var(--accent-hover));
    color: var(--black-70);
    box-shadow: var(--shadow-md);
  }

  .btn-confirm-no:hover {
    background: linear-gradient(135deg, var(--accent-hover), var(--accent));
    transform: translateY(-1px);
  }

  .btn-confirm-no:active { transform: translateY(1px); }
</style>
