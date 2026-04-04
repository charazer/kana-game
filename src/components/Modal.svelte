<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    id: string
    open: boolean
    titleId: string
    title: Snippet
    body: Snippet
    contentWidth?: string
    contentMaxWidth?: string
    contentMaxHeight?: string
    onClose?: () => void
    closeButtonId?: string
    closeLabel?: string
  }

  const {
    id,
    open,
    titleId,
    title,
    body,
    contentWidth,
    contentMaxWidth,
    contentMaxHeight,
    onClose,
    closeButtonId,
    closeLabel = 'Close',
  }: Props = $props()
</script>

<div
  {id}
  class="modal"
  class:hidden={!open}
  role="dialog"
  aria-labelledby={titleId}
  aria-modal="true"
>
  <div class="modal-overlay" role="presentation" onclick={onClose}></div>
  <div class="modal-content" style:width={contentWidth} style:max-width={contentMaxWidth} style:max-height={contentMaxHeight}>
    <div class="modal-header">
      <h2 id={titleId}>{@render title()}</h2>
      {#if onClose}
        <button
          id={closeButtonId}
          class="btn-modal-close"
          aria-label={closeLabel}
          onclick={onClose}
        >
          <span>✕</span>
        </button>
      {/if}
    </div>
    <div class="modal-body">
      {@render body()}
    </div>
  </div>
</div>

<style>
  /* ── Modal Base ─────────────────────────────────────────────────────────── */

  .modal {
    position: fixed;
    inset: 0;
    z-index: var(--z-modal);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
    box-sizing: border-box;
  }

  .modal-overlay {
    position: absolute;
    inset: 0;
    background: var(--black-85);
    backdrop-filter: blur(var(--backdrop-blur-md));
    animation: modal-slide-in 200ms ease-out;
  }

  .modal-content {
    position: relative;
    background: linear-gradient(135deg, var(--accent-18), var(--combo-18));
    border: 2px solid var(--accent);
    border-radius: var(--radius-2xl);
    box-shadow: 0 8px 32px var(--accent-30), 0 0 1px var(--white-10) inset;
    backdrop-filter: blur(12px);
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    z-index: 1;
    animation: modal-slide-in 200ms ease-out;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-5) var(--space-6);
    border-bottom: 2px solid var(--white-10);
  }

  .modal-header h2 {
    margin: 0;
    font-size: var(--font-2xl);
    font-weight: var(--font-bold);
    color: var(--accent-light);
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .btn-modal-close {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 2px solid var(--white-20);
    border-radius: var(--radius-md);
    color: var(--white-60);
    font-size: var(--font-2xl);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .btn-modal-close:hover {
    background: var(--white-10);
    border-color: var(--accent);
    color: var(--accent-light);
    transform: rotate(90deg);
  }

  .modal-body {
    padding: var(--space-6);
    overflow-y: auto;
    flex: 1;
  }

  @keyframes modal-slide-in {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ── Responsive ─────────────────────────────────────────────────────────── */

  @media (min-width: 480px) {
    .modal-header {
      padding: var(--space-6) var(--space-7);
    }

    .modal-body {
      padding: var(--space-7);
    }
  }

  @media (min-width: 768px) {
    .modal-header h2 {
      font-size: var(--font-3xl);
    }

    .modal-header :global(.modal-header-icon) {
      width: 32px;
      height: 32px;
    }
  }

  @media (max-width: 767px) {
    .modal-content {
      max-width: 95%;
      margin: 10px;
    }

    .modal-header h2 {
      font-size: var(--font-xl);
    }

    .btn-modal-close {
      width: 32px;
      height: 32px;
      font-size: var(--font-xl);
    }

    .modal-body {
      padding: var(--space-4);
    }
  }

  @media (max-width: 479px) {
    .modal-content {
      max-width: 98%;
      margin: 5px;
    }

    .modal-header {
      padding: var(--space-3) var(--space-4);
    }

    .modal-header h2 {
      font-size: var(--font-lg);
    }

    .btn-modal-close {
      width: 28px;
      height: 28px;
      font-size: var(--font-lg);
    }

    .modal-body {
      padding: var(--space-3);
    }
  }

  @media (max-height: 500px) and (orientation: landscape) {
    .modal-content {
      max-width: 90%;
      margin: 10px auto;
    }

    .modal-header {
      padding: var(--space-2) var(--space-3);
    }

    .modal-body {
      padding: var(--space-3);
    }
  }
</style>
