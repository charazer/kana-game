<script lang="ts">
  interface Props {
    id?: string
    variant: 'start' | 'restart' | 'end' | 'pause'
    disabled?: boolean
    ariaLabel: string
    imgSrc: string
    imgWidth: number
    imgHeight: number
    label: string
    fetchpriority?: 'high' | 'low' | 'auto'
    loading?: 'eager' | 'lazy'
    compact?: boolean
    onclick: () => void
  }

  const {
    id,
    variant,
    disabled = false,
    ariaLabel,
    imgSrc,
    imgWidth,
    imgHeight,
    label,
    fetchpriority,
    loading,
    compact = false,
    onclick,
  }: Props = $props()

  let btnEl: HTMLButtonElement | undefined = $state()

  function handleClick() {
    if (!btnEl) return
    btnEl.classList.remove('btn-press-pop')
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        btnEl?.classList.add('btn-press-pop')
        btnEl?.addEventListener('animationend', () => btnEl?.classList.remove('btn-press-pop'), { once: true })
      })
    })
    onclick()
  }
</script>

<button
  bind:this={btnEl}
  {id}
  class="btn-{variant}"
  class:compact
  {disabled}
  aria-label={ariaLabel}
  onclick={handleClick}
>
  <span class="btn-icon-wrap">
    <img
      src={imgSrc}
      alt=""
      class="btn-icon"
      aria-hidden="true"
      width={imgWidth}
      height={imgHeight}
      fetchpriority={fetchpriority}
      loading={loading}
    />
  </span>
  <span class="btn-label">{label}</span>
</button>

<style>
  /* ── Shared icon-label button layout ────────────────────────────────────── */

  @keyframes btn-press-pop {
    0%   { transform: translateY(0)    scale(1); }
    28%  { transform: translateY(3px)  scale(0.96); }
    65%  { transform: translateY(-2px) scale(0.99); }
    100% { transform: translateY(0)    scale(1); }
  }

  :global(.btn-press-pop) {
    animation: btn-press-pop 0.32s cubic-bezier(0.22, 0.61, 0.36, 1) !important;
  }

  button {
    border: none;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-lg);
    font-weight: var(--font-bold);
    font-size: var(--font-md);
    cursor: pointer;
    transition: transform var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast);
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    box-sizing: border-box;
  }

  .btn-icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 20px;
  }

  .btn-icon {
    width: 20px;
    height: 20px;
    display: block;
  }

  .btn-label {
    white-space: nowrap;
    font-size: var(--font-md);
    padding: 0 var(--space-2);
  }

  /* ── Control buttons (end, pause) ───────────────────────────────────────── */

  .btn-end, .btn-pause {
    width: auto;
    max-width: 48%;
    min-width: 140px;
    justify-content: flex-start;
  }

  .btn-end {
    background: linear-gradient(135deg, var(--color-error), var(--color-error-hover));
    color: var(--black-70);
    box-shadow: var(--shadow-md), 0 2px 4px var(--plum-shadow);
    border: 1px solid var(--white-15);
  }

  .btn-end:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--color-error-hover), var(--color-error));
    transform: translateY(-1px);
    box-shadow: 0 4px 12px var(--color-error-glow), 0 4px 8px var(--plum-shadow-deep);
  }

  .btn-end:active {
    transform: translateY(2px) scale(0.97);
    box-shadow: 0 1px 6px var(--color-error-glow);
  }

  .btn-end:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-pause {
    background: linear-gradient(135deg, var(--accent), var(--accent-hover));
    color: var(--black-70);
    box-shadow: var(--shadow-md), 0 2px 4px var(--plum-shadow);
    border: 1px solid var(--white-20);
  }

  .btn-pause:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--accent-hover), var(--accent));
    transform: translateY(-1px);
    box-shadow: 0 4px 12px var(--accent-40), 0 4px 8px var(--plum-shadow-deep);
  }

  .btn-pause:active {
    transform: translateY(2px) scale(0.97);
    box-shadow: 0 1px 6px var(--accent-40);
  }

  .btn-pause:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* ── Screen buttons (start, restart) ────────────────────────────────────── */

  .btn-start, .btn-restart {
    width: 100%;
    justify-content: center;
    background: linear-gradient(135deg, var(--accent), var(--accent-hover));
    color: var(--black-70);
    border: 1px solid var(--white-20);
    box-shadow: 0 4px 12px var(--accent-40), 0 2px 4px var(--plum-shadow);
  }

  .btn-start:hover, .btn-restart:hover {
    background: linear-gradient(135deg, var(--accent-hover), var(--accent));
    transform: translateY(-2px);
    box-shadow: 0 6px 16px var(--accent-60), 0 4px 8px var(--plum-shadow-deep);
  }

  .btn-start:active, .btn-restart:active {
    transform: translateY(2px) scale(0.97);
    box-shadow: 0 1px 8px var(--accent-40);
  }

  /* ── Responsive ─────────────────────────────────────────────────────────── */

  @media (min-width: 480px) {
    button {
      padding: var(--space-3) var(--space-4);
      gap: var(--space-2);
      border-radius: var(--radius-xl);
    }

    .btn-icon-wrap { width: 28px; }

    .btn-icon {
      width: 24px;
      height: 24px;
    }

    .btn-label { padding: 0 var(--space-3); }
  }

  @media (min-width: 768px) {
    .btn-end, .btn-pause {
      padding: var(--space-4) var(--space-5);
      min-width: 180px;
      gap: var(--space-3);
    }

    .btn-start, .btn-restart {
      padding: var(--space-4) var(--space-6);
      gap: var(--space-3);
    }

    .btn-icon-wrap { width: 32px; }

    .btn-icon {
      width: 28px;
      height: 28px;
    }

    .btn-label { font-size: var(--font-lg); padding: 0 var(--space-4); }
  }

  @media (min-width: 1024px) {
    .btn-end, .btn-pause { padding: var(--space-4) var(--space-6); }

    .btn-start, .btn-restart {
      padding: var(--space-5) var(--space-8);
      border-radius: var(--radius-2xl);
    }

    .btn-icon-wrap { width: 40px; }

    .btn-icon {
      width: 32px;
      height: 32px;
    }

    .btn-label { font-size: var(--font-xl); padding: 0 var(--space-6); }
  }

  @media (min-width: 1280px) {
    .btn-end, .btn-pause {
      width: 100%;
      max-width: 200px;
    }
  }

  /* ── Mobile keyboard compact layout ─────────────────────────────────────── */

  button.compact {
    min-width: 0;
    max-width: none;
    width: auto;
    padding: var(--space-2) var(--space-4);
    gap: 0;
  }

  button.compact .btn-label {
    display: none;
  }

  button.compact .btn-icon-wrap {
    width: 22px;
  }

  button.compact .btn-icon {
    width: 22px;
    height: 22px;
  }

  /* end-game button goes first, pause button goes second in compact flex row */
  .btn-end.compact { order: -1; }
  .btn-pause.compact { order: 1; }
</style>
