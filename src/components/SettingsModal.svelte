<script lang="ts">
  import Modal from './Modal.svelte'
  import type { GameMode, KanaSet } from '../game/constants/constants'
  import type { Settings } from '../game/storage/storage'
  import configImg from '../assets/img/config.png'

  interface Props {
    open: boolean
    settings: Settings
    isGameActive: boolean
    onClose: () => void
    onSettingChange: (patch: Partial<Settings>) => void
  }

  const { open, settings, isGameActive, onClose, onSettingChange }: Props = $props()

  function onKeydown(e: KeyboardEvent) {
    if (!open) return
    if (e.code === 'Escape') { e.preventDefault(); onClose() }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<Modal
  id="settings-modal"
  {open}
  titleId="settings-title"
  contentWidth="500px"
  onClose={onClose}
  closeButtonId="settings-close"
  closeLabel="Close settings"
>
  {#snippet title()}
    <img src={configImg} alt="" class="modal-header-icon" aria-hidden="true" width="87" height="95" loading="lazy" />
    Settings
  {/snippet}
  {#snippet body()}
    {#if isGameActive}
      <div id="active-game-notice" class="settings-notice" role="alert">
        <p>⚠️ Your game is currently paused. Some settings cannot be changed during an active game. Please end or complete your current game first.</p>
      </div>
    {/if}
    <div class="settings-group">
      <div class="setting-item">
        <label for="game-mode">Game Mode</label>
        <select
          id="game-mode"
          value={settings.gameMode}
          disabled={isGameActive}
          onchange={(e) => onSettingChange({ gameMode: (e.currentTarget as HTMLSelectElement).value as GameMode })}
        >
          <option value="challenge">Challenge</option>
          <option value="practice">Practice</option>
        </select>
      </div>
      <div class="setting-item">
        <label for="kana-set">Kana Set</label>
        <select
          id="kana-set"
          value={settings.kanaSet}
          disabled={isGameActive}
          onchange={(e) => onSettingChange({ kanaSet: (e.currentTarget as HTMLSelectElement).value as KanaSet })}
        >
          <option value="hiragana">Hiragana (ひらがな)</option>
          <option value="katakana">Katakana (カタカナ)</option>
          <option value="mixed">Mixed (Both)</option>
        </select>
      </div>
      <div class="setting-item">
        <label for="include-dakuten">Include Dakuten/Handakuten</label>
        <label class="checkbox-control" for="include-dakuten">
          <input type="checkbox" id="include-dakuten" checked={settings.includeDakuten} disabled={isGameActive}
            onchange={(e) => onSettingChange({ includeDakuten: (e.currentTarget as HTMLInputElement).checked })} />
          <span class="checkbox-label">が ざ だ ば ぱ etc.</span>
        </label>
      </div>
      <div class="setting-item">
        <label for="include-yoon">Include Yōon</label>
        <label class="checkbox-control" for="include-yoon">
          <input type="checkbox" id="include-yoon" checked={settings.includeYoon} disabled={isGameActive}
            onchange={(e) => onSettingChange({ includeYoon: (e.currentTarget as HTMLInputElement).checked })} />
          <span class="checkbox-label">きゃ しゃ ちゃ etc.</span>
        </label>
      </div>
      <div class="setting-item">
        <label for="audio-toggle">Audio</label>
        <label class="checkbox-control" for="audio-toggle">
          <input type="checkbox" id="audio-toggle" checked={settings.audioEnabled}
            onchange={(e) => onSettingChange({ audioEnabled: (e.currentTarget as HTMLInputElement).checked })} />
          <span class="checkbox-label">Sound Effects</span>
        </label>
      </div>
      <div class="setting-item">
        <label for="music-toggle">Music</label>
        <label class="checkbox-control" for="music-toggle">
          <input type="checkbox" id="music-toggle" checked={settings.musicEnabled}
            onchange={(e) => onSettingChange({ musicEnabled: (e.currentTarget as HTMLInputElement).checked })} />
          <span class="checkbox-label">Background Music</span>
        </label>
      </div>
      <div class="setting-item volume-setting">
        <label for="music-volume">Music Volume</label>
        <div class="slider-control">
          <input type="range" id="music-volume" min="0" max="100"
            value={Math.round((settings.musicVolume ?? 0.3) * 100)}
            aria-label="Music volume"
            oninput={(e) => onSettingChange({ musicVolume: parseInt((e.currentTarget as HTMLInputElement).value) / 100 })} />
          <span class="slider-value" id="music-volume-value" aria-live="polite">
            {Math.round((settings.musicVolume ?? 0.3) * 100)}%
          </span>
        </div>
      </div>
      <div class="setting-item music-credit">
        <span>Music: <a href="https://megumi-ryu.itch.io/" target="_blank" rel="noopener noreferrer">YUKARINOTI of Megumi Ryu</a></span>
      </div>
    </div>
  {/snippet}
</Modal>

<style>
  /* ── Modal header icon ──────────────────────────────────────────────────── */
  .modal-header-icon {
    width: 28px;
    height: 28px;
    display: inline-block;
    vertical-align: middle;
  }

  /* ── Settings content ───────────────────────────────────────────────────── */
  .settings-notice {
    background: linear-gradient(135deg, var(--accent-15), var(--combo-10));
    border: 2px solid var(--accent-40);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    margin-bottom: var(--space-5);
  }

  .settings-notice p {
    margin: 0;
    color: var(--accent-light);
    font-size: var(--font-sm);
    line-height: 1.5;
  }

  .settings-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  /* ── Form controls ──────────────────────────────────────────────────────── */
  .setting-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .setting-item label {
    font-size: var(--font-sm);
    font-weight: var(--font-semibold);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--white-50);
  }

  .setting-item select {
    background: var(--black-30);
    border: 1px solid var(--accent-30);
    color: var(--fg);
    padding: var(--space-2);
    padding-right: 2.5rem;
    border-radius: var(--radius-md);
    font-size: var(--font-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23f6d0df' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 12px 12px;
  }

  .setting-item select::-ms-expand { display: none; }
  .setting-item select:hover { border-color: var(--accent); background-color: var(--black-50); }
  .setting-item select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-20); }

  .checkbox-control {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
    padding: var(--space-2) var(--space-3);
    background: var(--black-30);
    border: 1px solid var(--accent-30);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
  }

  .checkbox-control:hover { background: var(--black-50); border-color: var(--accent); }

  .checkbox-control input[type="checkbox"] {
    width: var(--space-5);
    height: var(--space-5);
    cursor: pointer;
    accent-color: var(--accent);
  }

  .checkbox-control span {
    font-size: var(--font-sm);
    font-weight: var(--font-medium);
    color: var(--fg);
    text-transform: none;
    letter-spacing: 0;
    user-select: none;
  }

  .checkbox-label { font-size: var(--font-sm); color: var(--fg); }

  .music-credit {
    padding-top: var(--space-2);
    border-top: 1px solid var(--white-10);
  }

  .music-credit span {
    font-size: var(--font-sm);
    color: var(--white-70);
    display: block;
    text-align: center;
  }

  .music-credit a {
    color: var(--accent);
    text-decoration: none;
    font-weight: var(--font-medium);
    transition: color var(--transition-fast);
  }

  .music-credit a:hover { color: var(--combo); text-decoration: underline; }

  .slider-control {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    background: var(--black-30);
    border: 1px solid var(--accent-30);
    border-radius: var(--radius-md);
  }

  .slider-control input[type="range"] {
    flex: 1;
    background: transparent;
    outline: none;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }

  .slider-control input[type="range"]::-webkit-slider-runnable-track {
    height: 6px;
    background: var(--black-50);
    border-radius: var(--radius-md);
  }

  .slider-control input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    margin-top: -5px;
    background-color: var(--accent);
    background-image: none;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color var(--transition-fast);
  }

  .slider-control input[type="range"]:hover::-webkit-slider-thumb,
  .slider-control input[type="range"]:focus::-webkit-slider-thumb {
    background-color: var(--accent-hover);
  }

  .slider-control input[type="range"]::-moz-range-track {
    height: 6px;
    background: var(--black-50);
    border: none;
    border-radius: var(--radius-md);
  }

  .slider-control input[type="range"]::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background-color: var(--accent);
    background-image: none;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color var(--transition-fast);
  }

  .slider-control input[type="range"]:hover::-moz-range-thumb,
  .slider-control input[type="range"]:focus::-moz-range-thumb {
    background-color: var(--accent-hover);
  }

  .slider-value {
    font-size: var(--font-sm);
    font-weight: var(--font-semibold);
    color: var(--accent);
    min-width: 3rem;
    text-align: right;
  }

  /* ── Responsive form controls ───────────────────────────────────────────── */
  @media (min-width: 480px) {
    .setting-item select { padding: var(--space-3) var(--space-4); padding-right: 2.75rem; background-position: right 1rem center; }
    .checkbox-control { gap: var(--space-3); padding: var(--space-3) var(--space-4); }
    .checkbox-control input[type="checkbox"] { width: var(--space-6); height: var(--space-6); }
    .slider-control { gap: var(--space-4); padding: var(--space-3) var(--space-4); }
    .slider-control input[type="range"]::-webkit-slider-runnable-track,
    .slider-control input[type="range"]::-moz-range-track { height: 8px; }
    .slider-control input[type="range"]::-webkit-slider-thumb { width: 18px; height: 18px; margin-top: -5px; }
    .slider-control input[type="range"]::-moz-range-thumb { width: 18px; height: 18px; }
  }

  @media (min-width: 768px) {
    .setting-item select { padding: var(--space-4) var(--space-5); padding-right: 3rem; font-size: var(--font-md); background-position: right 1.25rem center; background-size: 14px 14px; }
    .checkbox-control { gap: var(--space-4); padding: var(--space-4); }
    .checkbox-control span { font-size: var(--font-md); }
    .checkbox-control input[type="checkbox"] { width: var(--space-7); height: var(--space-7); }
    .checkbox-label { font-size: var(--font-md); }
    .slider-control { padding: var(--space-4); }
    .slider-control input[type="range"]::-webkit-slider-thumb { width: 20px; height: 20px; margin-top: -6px; }
    .slider-control input[type="range"]::-moz-range-thumb { width: 20px; height: 20px; }
    .slider-value { font-size: var(--font-md); }
  }

  @media (min-width: 1024px) {
    .checkbox-control { gap: var(--space-4); padding: var(--space-4) var(--space-5); }
    .checkbox-control input[type="checkbox"] { width: 20px; height: 20px; }
    .checkbox-label { font-size: var(--font-lg); }
  }

  /* ── Small screen: hide volume slider (iOS ignores programmatic volume) ── */
  @media (max-width: 479px) { .volume-setting { display: none; } }
</style>
