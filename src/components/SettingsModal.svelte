<script lang="ts">
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
    if (e.code === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div id="settings-modal" class="modal" class:hidden={!open} role="dialog" aria-labelledby="settings-title" aria-modal="true">
    <div class="modal-overlay" role="presentation" onclick={onClose}></div>
    <div class="modal-content settings-modal-content">
      <div class="modal-header">
        <h2 id="settings-title">
          <img src={configImg} alt="" class="modal-header-icon" aria-hidden="true" width="87" height="95" loading="lazy" />
          Settings
        </h2>
        <button id="settings-close" class="btn-modal-close" aria-label="Close settings" onclick={onClose}>
          <span>✕</span>
        </button>
      </div>
      <div class="modal-body">
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
              <input
                type="checkbox"
                id="include-dakuten"
                checked={settings.includeDakuten}
                disabled={isGameActive}
                onchange={(e) => onSettingChange({ includeDakuten: (e.currentTarget as HTMLInputElement).checked })}
              />
              <span class="checkbox-label">が ざ だ ば ぱ etc.</span>
            </label>
          </div>
          <div class="setting-item">
            <label for="include-yoon">Include Yōon</label>
            <label class="checkbox-control" for="include-yoon">
              <input
                type="checkbox"
                id="include-yoon"
                checked={settings.includeYoon}
                disabled={isGameActive}
                onchange={(e) => onSettingChange({ includeYoon: (e.currentTarget as HTMLInputElement).checked })}
              />
              <span class="checkbox-label">きゃ しゃ ちゃ etc.</span>
            </label>
          </div>
          <div class="setting-item">
            <label for="audio-toggle">Audio</label>
            <label class="checkbox-control" for="audio-toggle">
              <input
                type="checkbox"
                id="audio-toggle"
                checked={settings.audioEnabled}
                onchange={(e) => onSettingChange({ audioEnabled: (e.currentTarget as HTMLInputElement).checked })}
              />
              <span class="checkbox-label">Sound Effects</span>
            </label>
          </div>
          <div class="setting-item">
            <label for="music-toggle">Music</label>
            <label class="checkbox-control" for="music-toggle">
              <input
                type="checkbox"
                id="music-toggle"
                checked={settings.musicEnabled}
                onchange={(e) => onSettingChange({ musicEnabled: (e.currentTarget as HTMLInputElement).checked })}
              />
              <span class="checkbox-label">Background Music</span>
            </label>
          </div>
          <div class="setting-item volume-setting">
            <label for="music-volume">Music Volume</label>
            <div class="slider-control">
              <input
                type="range"
                id="music-volume"
                min="0"
                max="100"
                value={Math.round((settings.musicVolume ?? 0.3) * 100)}
                aria-label="Music volume"
                oninput={(e) => onSettingChange({ musicVolume: parseInt((e.currentTarget as HTMLInputElement).value) / 100 })}
              />
              <span class="slider-value" id="music-volume-value" aria-live="polite">
                {Math.round((settings.musicVolume ?? 0.3) * 100)}%
              </span>
            </div>
          </div>
          <div class="setting-item music-credit">
            <span>
              Music: <a href="https://megumi-ryu.itch.io/" target="_blank" rel="noopener noreferrer">YUKARINOTI of Megumi Ryu</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

