<script lang="ts">
  interface Props {
    inputEcho: string
    mobileInputEl?: HTMLInputElement
    compact?: boolean
  }

  let { inputEcho, mobileInputEl = $bindable(), compact = false }: Props = $props()
</script>

<style>
  footer {
    flex-shrink: 0;
    width: 100%;
    background: transparent;
    padding: 0;
    display: flex;
    justify-content: center;
    box-sizing: border-box;
  }

  /* Hidden mobile keyboard input — stays focusable (not display:none),
     fixed at top:0 to prevent scroll on Android when keyboard opens. */
  #mobile-input {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 1px;
    opacity: 0;
    border: none;
    outline: none;
    background: transparent;
    font-size: 16px; /* >= 16px prevents iOS auto-zoom on focus */
    caret-color: transparent;
    color: transparent;
    z-index: -1;
    padding: 0;
    margin: 0;
  }

  #input-display {
    max-width: var(--game-max-width);
    width: 100%;
    margin: 0 auto;
    padding: var(--space-3) var(--space-4);
    background: linear-gradient(135deg, var(--black-70), var(--black-65));
    border: var(--token-border) solid var(--accent);
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    border-top: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    align-items: center;
    box-sizing: border-box;
    backdrop-filter: blur(var(--backdrop-blur-md));
  }

  #input-display label {
    font-size: var(--font-sm);
    font-weight: var(--font-semibold);
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  #input-echo {
    font-size: var(--font-lg);
    font-weight: var(--font-semibold);
    min-height: 24px;
    padding: var(--space-2) var(--space-4);
    background: var(--black-30);
    border-radius: var(--radius-md);
    min-width: 200px;
    text-align: center;
    color: var(--accent);
    font-family: var(--font-mono);
    letter-spacing: var(--space-1);
  }

  /* ── Responsive ─────────────────────────────────────────────────────────── */
  @media (min-width: 480px) {
    #input-display { padding: var(--space-4) var(--space-6); gap: var(--space-3); }
    #input-echo { font-size: var(--font-2xl); padding: var(--space-3) var(--space-6); min-height: 32px; }
  }

  @media (min-width: 768px) {
    #input-display { padding: var(--space-5) var(--space-7); gap: var(--space-4); border-radius: 0 0 var(--radius-xl) var(--radius-xl); }
    #input-echo { font-size: var(--font-3xl); padding: var(--space-4) var(--space-8); min-height: 40px; }
  }

  @media (min-width: 1024px) {
    #input-display { padding: var(--space-7) var(--space-9); }
    #input-display label { font-size: var(--font-md); }
    #input-echo { font-size: var(--font-4xl); padding: var(--space-4) var(--space-9); min-height: var(--space-11); }
  }

  /* ── Mobile keyboard compact layout ─────────────────────────────────────── */
  #input-display.compact {
    padding: var(--space-1) var(--space-3);
    gap: 0;
    border-width: 1px;
  }

  #input-display.compact label { display: none; }

  #input-display.compact #input-echo {
    font-size: var(--font-md);
    padding: var(--space-1) var(--space-3);
    min-height: 0;
    min-width: 120px;
  }

  /* ── Small-screen perf: remove costly backdrop-filter ───────────────────── */
  @media (max-width: 479px) {
    #input-display { backdrop-filter: none; }
  }
</style>

<footer>
  <div id="input-display" class:compact>
    <label for="input-echo">Your input:</label>
    <input
      bind:this={mobileInputEl}
      id="mobile-input"
      type="text"
      inputmode="text"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck={false}
      aria-label="Type romaji here"
      tabindex="-1"
    />
    <div id="input-echo" role="status" aria-live="polite">{inputEcho}</div>
  </div>
</footer>
