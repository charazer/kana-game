<script lang="ts">
  import { BASIC_KANA_IDS, DAKUTEN_KANA_IDS, YOON_KANA_IDS } from '../game/constants/kana-constants'
  import { GOJUON_COLUMNS, DAKUTEN_COLUMNS, YOON_COLUMNS } from '../game/ui/kana-tables'
  import type { KanaEntry } from '../game/core/types'
  import kanaHiragana from '../data/kana/hiragana.json'
  import kanaKatakana from '../data/kana/katakana.json'
  import { onMount, tick } from 'svelte'

  interface Props {
    type: 'hiragana' | 'katakana'
  }

  const { type }: Props = $props()

  const kanaData = $derived((type === 'hiragana' ? kanaHiragana : kanaKatakana) as KanaEntry[])
  const basic = $derived(kanaData.filter(k => BASIC_KANA_IDS.includes(k.id)))
  const dakuten = $derived(kanaData.filter(k => DAKUTEN_KANA_IDS.includes(k.id)))
  const yoon = $derived(kanaData.filter(k => YOON_KANA_IDS.includes(k.id)))

  let basicTableEl: HTMLElement | undefined = $state()
  let dakutenTableEl: HTMLElement | undefined = $state()
  let yoonTableEl: HTMLElement | undefined = $state()
  let basicHasScroll = $state(false)
  let dakutenHasScroll = $state(false)
  let yoonHasScroll = $state(false)

  function updateScrollIndicators() {
    if (basicTableEl) basicHasScroll = basicTableEl.scrollWidth > basicTableEl.clientWidth
    if (dakutenTableEl) dakutenHasScroll = dakutenTableEl.scrollWidth > dakutenTableEl.clientWidth
    if (yoonTableEl) yoonHasScroll = yoonTableEl.scrollWidth > yoonTableEl.clientWidth
  }

  $effect(() => {
    void kanaData
    tick().then(updateScrollIndicators)
  })

  onMount(() => {
    updateScrollIndicators()
    let resizeTimer: number
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(updateScrollIndicators, 150)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  })
</script>

<div>
  {#if basic.length}
    <div class="kana-section">
      <h3>基本 (Basic Kana) {#if basicHasScroll}<span class="kana-scroll-hint">(scroll →)</span>{/if}</h3>
      <div bind:this={basicTableEl} class="kana-table">
        {#each GOJUON_COLUMNS as col}
          <div class="kana-column">
            {#each col as id}
              {@const k = basic.find(e => e.id === id)}
              {#if k}
                <div class="kana-item">
                  <div class="kana-char">{k.kana}</div>
                  <div class="kana-romaji">{k.romaji.join(' / ')}</div>
                </div>
              {/if}
            {/each}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if dakuten.length}
    <div class="kana-section">
      <h3>濁音・半濁音 (Dakuten &amp; Handakuten) {#if dakutenHasScroll}<span class="kana-scroll-hint">(scroll →)</span>{/if}</h3>
      <div bind:this={dakutenTableEl} class="kana-table">
        {#each DAKUTEN_COLUMNS as col}
          <div class="kana-column">
            {#each col as id}
              {@const k = dakuten.find(e => e.id === id)}
              {#if k}
                <div class="kana-item">
                  <div class="kana-char">{k.kana}</div>
                  <div class="kana-romaji">{k.romaji.join(' / ')}</div>
                </div>
              {/if}
            {/each}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if yoon.length}
    <div class="kana-section">
      <h3>拗音 (Yoon) {#if yoonHasScroll}<span class="kana-scroll-hint">(scroll →)</span>{/if}</h3>
      <div bind:this={yoonTableEl} class="kana-table">
        {#each YOON_COLUMNS as col}
          <div class="kana-column">
            {#each col as id}
              {@const k = yoon.find(e => e.id === id)}
              {#if k}
                <div class="kana-item">
                  <div class="kana-char">{k.kana}</div>
                  <div class="kana-romaji">{k.romaji.join(' / ')}</div>
                </div>
              {/if}
            {/each}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  /* ── Kana reference table layout ────────────────────────────────────────── */
  .kana-section {
    margin-bottom: var(--space-8);
    position: relative;
  }

  .kana-section:last-child { margin-bottom: 0; }

  .kana-section h3 {
    margin: 0 0 var(--space-4) 0;
    font-size: var(--font-2xl);
    color: var(--accent-light);
    font-weight: var(--font-bold);
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .kana-scroll-hint {
    font-size: var(--font-sm);
    color: var(--white-40);
    font-weight: var(--font-normal);
    font-style: italic;
  }

  .kana-table {
    display: flex;
    flex-direction: row;
    gap: var(--space-3);
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: var(--space-2);
  }

  .kana-column {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    flex-shrink: 0;
  }

  .kana-column .kana-item { width: 80px; }

  .kana-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
    background: var(--white-5);
    border: 2px solid var(--white-10);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
  }

  .kana-item:hover {
    background: var(--white-10);
    border-color: var(--accent);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px var(--black-30);
  }

  .kana-char {
    font-size: var(--font-4xl);
    font-weight: var(--font-bold);
    color: var(--white);
    margin-bottom: var(--space-2);
    white-space: nowrap;
  }

  .kana-romaji {
    font-size: var(--font-sm);
    color: var(--accent-light);
    font-weight: var(--font-medium);
    text-align: center;
  }

  /* ── Responsive ─────────────────────────────────────────────────────────── */
  @media (max-width: 767px) {
    .kana-column .kana-item { width: 70px; }
    .kana-table { gap: var(--space-2); }
    .kana-section h3 { font-size: var(--font-xl); }
  }

  @media (max-width: 479px) {
    .kana-item { padding: var(--space-2) var(--space-1); }
    .kana-char { font-size: var(--font-2xl); margin-bottom: var(--space-1); }
    .kana-column .kana-item { width: 60px; }
    .kana-column { gap: var(--space-1); }
    .kana-table { gap: var(--space-1); }
    .kana-section h3 { font-size: var(--font-lg); margin-bottom: var(--space-2); }
    .kana-section { margin-bottom: var(--space-4); }
  }

  @media (max-height: 500px) and (orientation: landscape) {
    .kana-item { padding: var(--space-2); }
    .kana-char { font-size: var(--font-2xl); }
    .kana-column .kana-item { width: 60px; }
    .kana-table { gap: var(--space-2); }
    .kana-section h3 { font-size: var(--font-lg); }
  }
</style>
