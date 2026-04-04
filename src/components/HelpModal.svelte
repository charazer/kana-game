<script lang="ts">
  import Modal from './Modal.svelte'

  interface Props {
    open: boolean
    onClose: () => void
    onOpenKanaReference: () => void
  }

  const { open, onClose, onOpenKanaReference }: Props = $props()

  function onKeydown(e: KeyboardEvent) {
    if (!open) return
    if (e.code === 'Escape') { e.preventDefault(); onClose() }
  }
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
  <Modal
    id="help-modal"
    {open}
    titleId="help-title"
    contentWidth="600px"
    onClose={onClose}
    closeButtonId="help-close"
    closeLabel="Close help"
  >
    {#snippet title()}📖 How to play{/snippet}
    {#snippet body()}
      <div class="help-content">
        <section class="help-section credits-section">
          <p><strong>こんにちは、ダミアンです！</strong></p>
          <p>I created this game to help myself and other Japanese language learners having a fun way to get better at recognising Kana. I hope you enjoy it and find it useful on your own journey as well! 🌸</p>
          <p>If you're interested in getting proper, personal support for learning Japanese with a fun &amp; engaging approach, I highly recommend my teacher <a href="https://linktr.ee/marianihongo" target="_blank" rel="noopener noreferrer">MariaNihongo | マリア先生</a> for individual lessons! Also check out her YouTube channel for more helpful content.</p>
        </section>
        <section class="help-section">
          <h3>🎯 Objective</h3>
          <p>Type the correct romaji (Roman alphabet spelling) for falling kana characters before they reach the bottom of the screen!</p>
        </section>
        <section class="help-section">
          <h3>🎮 How to play</h3>
          <ul>
            <li><strong>Start:</strong> Press <kbd>Enter</kbd> or click the Start button</li>
            <li><strong>Type:</strong> When a kana character appears, type its romaji spelling</li>
            <li><strong>Speed:</strong> Game speed increases automatically over time (Challenge mode only)</li>
            <li><strong>Lives:</strong> Missing characters costs you lives (Challenge mode only)</li>
            <li><strong>Combo:</strong> Chain correct answers to build your combo multiplier</li>
            <li><strong>Pause:</strong> Press <kbd>Space</kbd> or click the Pause button</li>
            <li><strong>End:</strong> Press <kbd>Esc</kbd> or click the End button</li>
          </ul>
        </section>
        <section class="help-section">
          <h3>💡 Tips</h3>
          <ul>
            <li>Focus on accuracy first - speed comes with practice</li>
            <li>Use Practice mode in settings to learn without pressure (unlimited lives)</li>
            <li>High combos give massive score bonuses in Challenge mode!</li>
          </ul>
        </section>
        <section class="help-section">
          <h3>⚙️ Difficulty Settings</h3>
          <p>In the settings menu, you can customise which character types appear in the game:</p>
          <ul>
            <li><strong>Kana Set:</strong> Choose Hiragana, Katakana, or Mixed (both scripts)</li>
            <li><strong>Dakuten/Handakuten:</strong> Characters with marks like が, ざ, だ, ば, ぱ</li>
            <li><strong>Yōon:</strong> Combined characters like きゃ, しゃ, ちゃ, にゃ, りゃ</li>
          </ul>
          <p><strong>Score Multipliers:</strong> Your score is affected by the difficulty you choose:</p>
          <ul>
            <li><strong>Mixed kana set:</strong> +25% bonus multiplier</li>
            <li>Both dakuten/yōon enabled: <strong>100%</strong> base score</li>
            <li>One enabled: <strong>75%</strong> base score</li>
            <li>Both disabled: <strong>50%</strong> base score</li>
          </ul>
          <p><em>Example: Mixed kana set with all character types enabled = 125% score (1.0 × 1.25)</em></p>
        </section>
        <section class="help-section">
          <h3>🏆 Highscores</h3>
          <p>Your highscores are saved locally in your browser storage only. They are not compared with other players and may be deleted if you clear your browser data or storage.</p>
        </section>
        <section class="help-section">
          <h3>💻 Device Support</h3>
          <p>The game works on both desktop and mobile devices. On phones and tablets the software keyboard opens automatically when the game starts. For the fastest and most comfortable experience we still recommend a desktop or laptop with a physical keyboard.</p>
        </section>
        <section class="help-section">
          <h3>⌨️ Examples</h3>
          <ul>
            <li><strong>あ</strong> → type "a"</li>
            <li><strong>か</strong> → type "ka"</li>
            <li><strong>きゃ</strong> → type "kya"</li>
            <li><strong>が</strong> → type "ga"</li>
          </ul>
        </section>
        <section class="help-section">
          <button
            id="open-kana-reference"
            class="btn-kana-reference"
            onclick={() => { onClose(); onOpenKanaReference() }}
          >
            <span class="btn-icon-wrap">📚</span>
            <span class="btn-label">Full Kana Reference</span>
          </button>
        </section>
      </div>
    {/snippet}
  </Modal>
{/if}

<style>
  .help-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .help-section {
    border-bottom: 1px solid var(--white-10);
    padding-bottom: var(--space-5);
  }

  .help-section:last-child { border-bottom: none; padding-bottom: 0; }

  .credits-section {
    padding: var(--space-4);
    background: var(--accent-10);
    border: 1px solid var(--accent-30);
    border-radius: var(--radius-lg);
  }

  .credits-section p:first-child {
    font-size: var(--font-lg);
    margin-bottom: var(--space-2);
  }

  .help-section h3 {
    margin: 0 0 var(--space-3) 0;
    font-size: var(--font-xl);
    font-weight: var(--font-bold);
    color: var(--accent-light);
  }

  .help-section p, .help-section ul {
    margin: 0 0 var(--space-3) 0;
    line-height: 1.6;
    color: var(--fg);
    font-size: var(--font-md);
  }

  .help-section ul { padding-left: var(--space-8); }
  .help-section li { margin-bottom: var(--space-2); }
  .help-section a { color: var(--accent); text-decoration: none; }
  .help-section a:hover { text-decoration: underline; }

  kbd {
    display: inline-block;
    padding: var(--space-1) var(--space-2);
    font-size: var(--font-sm);
    font-weight: var(--font-semibold);
    line-height: 1;
    color: var(--white-90);
    background: var(--black-30);
    border: 1px solid var(--white-20);
    border-radius: var(--radius-sm);
    box-shadow: inset 0 -1px 0 var(--black-25);
    font-family: var(--font-mono);
    text-transform: uppercase;
    margin: 0 var(--space-1);
  }

  .btn-kana-reference {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-6);
    background: linear-gradient(135deg, var(--accent-15), var(--combo-10));
    border: 1px solid var(--accent-30);
    border-radius: var(--radius-lg);
    color: var(--accent-light);
    font-size: var(--font-lg);
    font-weight: var(--font-semibold);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-decoration: none;
  }

  .btn-kana-reference:hover {
    background: linear-gradient(135deg, var(--accent-20), var(--combo-15));
    border-color: var(--accent-40);
    transform: translateY(-1px);
  }
</style>
