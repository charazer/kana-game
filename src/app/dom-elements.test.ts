/**
 * Tests for dom-elements.ts
 *
 * dom-elements.ts executes DOM queries at module load time, so the DOM must be
 * fully set up before the module is imported. We use vi.resetModules() + dynamic
 * import inside each test to ensure a fresh module evaluation against our DOM.
 */

function setupDOM() {
  document.body.innerHTML = `
    <div id="game-area"></div>
    <div id="tokens"></div>
    <div id="paused-indicator"></div>
    <div id="score"></div>
    <div id="combo"></div>
    <div id="speed"></div>
    <div id="lives"></div>
    <select id="game-mode"></select>
    <select id="kana-set"></select>
    <input id="music-toggle" type="checkbox">
    <input id="music-volume" type="range">
    <span id="music-volume-value"></span>
    <input id="audio-toggle" type="checkbox">
    <input id="include-dakuten" type="checkbox">
    <input id="include-yoon" type="checkbox">
    <input id="mobile-input" type="text">
    <div id="input-echo"></div>
    <button id="end-game"></button>
    <button id="pause"></button>
    <button id="start"></button>
    <button id="restart"></button>
    <div id="start-screen"></div>
    <div id="game-over"></div>
    <div id="final-score"></div>
    <div id="new-high-score"></div>
    <div id="high-scores-start"></div>
    <div id="high-scores-end"></div>
    <button id="settings-btn"></button>
    <div id="settings-modal"><div class="modal-overlay"></div></div>
    <button id="settings-close"></button>
    <div id="active-game-notice"></div>
    <a id="how-to-play-link" href="#"></a>
    <a id="how-to-play-link-end" href="#"></a>
    <div id="help-modal"><div class="modal-overlay"></div></div>
    <button id="help-close"></button>
    <button id="open-kana-reference"></button>
    <div id="kana-modal"><div class="modal-overlay"></div></div>
    <button id="kana-close"></button>
    <button id="tab-hiragana"></button>
    <button id="tab-katakana"></button>
    <div id="kana-content"></div>
    <div id="confirm-end-modal"></div>
    <button id="confirm-end-yes"></button>
    <button id="confirm-end-no"></button>
  `
}

describe('dom-elements', () => {
  beforeEach(() => {
    setupDOM()
    vi.resetModules()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should export required HTMLElement references', async () => {
    const els = await import('./dom-elements')

    expect(els.tokensLayer).toBeInstanceOf(HTMLElement)
    expect(els.pausedIndicator).toBeInstanceOf(HTMLElement)
    expect(els.scoreEl).toBeInstanceOf(HTMLElement)
    expect(els.comboEl).toBeInstanceOf(HTMLElement)
    expect(els.speedEl).toBeInstanceOf(HTMLElement)
    expect(els.livesEl).toBeInstanceOf(HTMLElement)
    expect(els.inputEcho).toBeInstanceOf(HTMLElement)
    expect(els.startScreenEl).toBeInstanceOf(HTMLElement)
    expect(els.gameOverEl).toBeInstanceOf(HTMLElement)
    expect(els.finalScoreEl).toBeInstanceOf(HTMLElement)
    expect(els.newHighScoreEl).toBeInstanceOf(HTMLElement)
    expect(els.highScoresStartEl).toBeInstanceOf(HTMLElement)
    expect(els.highScoresEndEl).toBeInstanceOf(HTMLElement)
    expect(els.kanaContent).toBeInstanceOf(HTMLElement)
    expect(els.confirmEndModal).toBeInstanceOf(HTMLElement)
  })

  it('should export optional game area and mobile input references', async () => {
    const els = await import('./dom-elements')

    expect(els.gameArea).toBeInstanceOf(HTMLElement)
    expect(els.mobileInput).toBeInstanceOf(HTMLInputElement)
  })

  it('should export modal elements with their overlays', async () => {
    const els = await import('./dom-elements')

    expect(els.settingsModal).toBeInstanceOf(HTMLElement)
    expect(els.settingsModalOverlay).toBeInstanceOf(HTMLElement)
    expect(els.helpModal).toBeInstanceOf(HTMLElement)
    expect(els.helpModalOverlay).toBeInstanceOf(HTMLElement)
    expect(els.kanaModal).toBeInstanceOf(HTMLElement)
    expect(els.kanaModalOverlay).toBeInstanceOf(HTMLElement)
  })

  it('should export optional (nullable) form controls', async () => {
    const els = await import('./dom-elements')

    expect(els.gameModeSelect).toBeInstanceOf(HTMLSelectElement)
    expect(els.kanaSelect).toBeInstanceOf(HTMLSelectElement)
    expect(els.musicToggle).toBeInstanceOf(HTMLInputElement)
    expect(els.musicVolumeSlider).toBeInstanceOf(HTMLInputElement)
    expect(els.musicVolumeValue).toBeInstanceOf(HTMLSpanElement)
    expect(els.audioToggle).toBeInstanceOf(HTMLInputElement)
    expect(els.includeDakutenToggle).toBeInstanceOf(HTMLInputElement)
    expect(els.includeYoonToggle).toBeInstanceOf(HTMLInputElement)
  })

  it('should export optional button references', async () => {
    const els = await import('./dom-elements')

    expect(els.endGameBtn).toBeInstanceOf(HTMLButtonElement)
    expect(els.pauseBtn).toBeInstanceOf(HTMLButtonElement)
    expect(els.startBtn).toBeInstanceOf(HTMLButtonElement)
    expect(els.restartBtn).toBeInstanceOf(HTMLButtonElement)
    expect(els.settingsBtn).toBeInstanceOf(HTMLButtonElement)
    expect(els.settingsCloseBtn).toBeInstanceOf(HTMLButtonElement)
    expect(els.helpCloseBtn).toBeInstanceOf(HTMLButtonElement)
    expect(els.openKanaReferenceBtn).toBeInstanceOf(HTMLButtonElement)
    expect(els.kanaCloseBtn).toBeInstanceOf(HTMLButtonElement)
    expect(els.tabHiragana).toBeInstanceOf(HTMLButtonElement)
    expect(els.tabKatakana).toBeInstanceOf(HTMLButtonElement)
    expect(els.confirmEndYesBtn).toBeInstanceOf(HTMLButtonElement)
    expect(els.confirmEndNoBtn).toBeInstanceOf(HTMLButtonElement)
  })

  it('should export link references', async () => {
    const els = await import('./dom-elements')

    expect(els.howToPlayLink).toBeInstanceOf(HTMLAnchorElement)
    expect(els.howToPlayLinkEnd).toBeInstanceOf(HTMLAnchorElement)
  })

  it('should export activeGameNotice', async () => {
    const els = await import('./dom-elements')

    expect(els.activeGameNotice).toBeInstanceOf(HTMLElement)
  })

  it('should return null for optional elements missing from the DOM', async () => {
    // Remove the optional elements before import
    document.getElementById('game-mode')?.remove()
    document.getElementById('kana-set')?.remove()
    document.getElementById('music-toggle')?.remove()
    document.getElementById('audio-toggle')?.remove()

    const els = await import('./dom-elements')

    expect(els.gameModeSelect).toBeNull()
    expect(els.kanaSelect).toBeNull()
    expect(els.musicToggle).toBeNull()
    expect(els.audioToggle).toBeNull()
  })
})
