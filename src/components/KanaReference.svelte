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

  let containerEl: HTMLElement | undefined = $state()

  function updateScrollIndicators() {
    if (!containerEl) return
    for (const section of containerEl.querySelectorAll('.kana-section')) {
      const table = section.querySelector('.kana-table')
      if (table) section.classList.toggle('has-scroll', table.scrollWidth > table.clientWidth)
    }
  }

  $effect(() => {
    // Re-run when type changes (kanaData changes)
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

<div bind:this={containerEl}>
  {#if basic.length}
    <div class="kana-section">
      <h3>基本 (Basic Kana) <span class="kana-scroll-hint">(scroll →)</span></h3>
      <div class="kana-table">
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
      <h3>濁音・半濁音 (Dakuten &amp; Handakuten) <span class="kana-scroll-hint">(scroll →)</span></h3>
      <div class="kana-table">
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
      <h3>拗音 (Yoon)</h3>
      <div class="kana-grid">
        {#each yoon as k}
          <div class="kana-item">
            <div class="kana-char">{k.kana}</div>
            <div class="kana-romaji">{k.romaji.join(' / ')}</div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
