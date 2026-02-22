import { vi } from 'vitest'
import {
  initializeSettingsModal,
  initializeHelpModal,
  initializeKanaReferenceModal,
  initializeModalEscapeKeys
} from './modal-handlers'

// ── Mock DOM elements ─────────────────────────────────────────────────────────

const {
  settingsBtn, settingsModal, settingsCloseBtn, settingsModalOverlay, activeGameNotice,
  helpModal, helpCloseBtn, helpModalOverlay, howToPlayLink, howToPlayLinkEnd,
  kanaModal, kanaCloseBtn, kanaModalOverlay, openKanaReferenceBtn, tabHiragana, tabKatakana,
  endGameBtn, pauseBtn, pausedIndicator
} = vi.hoisted(() => ({
  settingsBtn: document.createElement('button'),
  settingsModal: document.createElement('div'),
  settingsCloseBtn: document.createElement('button'),
  settingsModalOverlay: document.createElement('div'),
  activeGameNotice: document.createElement('div'),
  helpModal: document.createElement('div'),
  helpCloseBtn: document.createElement('button'),
  helpModalOverlay: document.createElement('div'),
  howToPlayLink: document.createElement('a'),
  howToPlayLinkEnd: document.createElement('a'),
  kanaModal: document.createElement('div'),
  kanaCloseBtn: document.createElement('button'),
  kanaModalOverlay: document.createElement('div'),
  openKanaReferenceBtn: document.createElement('button'),
  tabHiragana: document.createElement('button'),
  tabKatakana: document.createElement('button'),
  endGameBtn: document.createElement('button'),
  pauseBtn: document.createElement('button'),
  pausedIndicator: document.createElement('div')
}))

vi.mock('./dom-elements', () => ({
  settingsBtn,
  settingsModal,
  settingsCloseBtn,
  settingsModalOverlay,
  activeGameNotice,
  helpModal,
  helpCloseBtn,
  helpModalOverlay,
  howToPlayLink,
  howToPlayLinkEnd,
  kanaModal,
  kanaCloseBtn,
  kanaModalOverlay,
  openKanaReferenceBtn,
  tabHiragana,
  tabKatakana,
  endGameBtn,
  pauseBtn,
  pausedIndicator
}))

vi.mock('./ui-helpers', () => ({
  renderKanaReference: vi.fn(),
  updateKanaScrollIndicators: vi.fn()
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeEngine(overrides: Record<string, unknown> = {}) {
  return {
    running: false,
    pause: vi.fn(),
    resume: vi.fn(),
    ...overrides
  }
}

function makeAudio() {
  return {
    playPause: vi.fn(),
    playResume: vi.fn()
  }
}

function resetModals() {
  settingsModal.classList.add('hidden')
  helpModal.classList.add('hidden')
  kanaModal.classList.add('hidden')
  activeGameNotice.classList.add('hidden')
  pausedIndicator.classList.add('hidden')
  endGameBtn.disabled = true
  pauseBtn.disabled = true
  tabHiragana.classList.remove('active')
  tabKatakana.classList.remove('active')
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('modal-handlers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetModals()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  // ─── initializeSettingsModal ──────────────────────────────────────────────

  describe('initializeSettingsModal', () => {
    it('should open settings modal when settings button is clicked', () => {
      const engine = makeEngine()
      const audio = makeAudio()
      initializeSettingsModal(engine as any, audio as any)

      settingsBtn.click()

      expect(settingsModal.classList.contains('hidden')).toBe(false)
    })

    it('should show active-game notice when a game is in progress', () => {
      const engine = makeEngine({ running: true })
      const audio = makeAudio()
      endGameBtn.disabled = false
      initializeSettingsModal(engine as any, audio as any)

      settingsBtn.click()

      expect(activeGameNotice.classList.contains('hidden')).toBe(false)
    })

    it('should hide active-game notice when no game is in progress', () => {
      const engine = makeEngine({ running: false })
      const audio = makeAudio()
      endGameBtn.disabled = true
      initializeSettingsModal(engine as any, audio as any)

      settingsBtn.click()

      expect(activeGameNotice.classList.contains('hidden')).toBe(true)
    })

    it('should auto-pause the engine when opening during an active game', () => {
      const engine = makeEngine({ running: true })
      const audio = makeAudio()
      endGameBtn.disabled = false
      initializeSettingsModal(engine as any, audio as any)

      settingsBtn.click()

      expect(engine.pause).toHaveBeenCalledOnce()
      expect(audio.playPause).toHaveBeenCalledOnce()
    })

    it('should close settings modal when close button is clicked', () => {
      const engine = makeEngine()
      const audio = makeAudio()
      initializeSettingsModal(engine as any, audio as any)
      settingsBtn.click()

      settingsCloseBtn.click()

      expect(settingsModal.classList.contains('hidden')).toBe(true)
    })

    it('should close settings modal when overlay is clicked', () => {
      const engine = makeEngine()
      const audio = makeAudio()
      initializeSettingsModal(engine as any, audio as any)
      settingsBtn.click()

      settingsModalOverlay.click()

      expect(settingsModal.classList.contains('hidden')).toBe(true)
    })

    it('should resume auto-paused engine when closing the modal', () => {
      const engine = makeEngine({ running: true })
      const audio = makeAudio()
      endGameBtn.disabled = false
      initializeSettingsModal(engine as any, audio as any)
      settingsBtn.click() // auto-pauses

      settingsCloseBtn.click()

      expect(engine.resume).toHaveBeenCalledOnce()
      expect(audio.playResume).toHaveBeenCalledOnce()
    })

    it('should not resume engine on close if it was already paused before opening', () => {
      const engine = makeEngine({ running: false })
      const audio = makeAudio()
      endGameBtn.disabled = false
      initializeSettingsModal(engine as any, audio as any)
      settingsBtn.click() // game running=false, no auto-pause

      settingsCloseBtn.click()

      expect(engine.resume).not.toHaveBeenCalled()
    })
  })

  // ─── initializeHelpModal ──────────────────────────────────────────────────

  describe('initializeHelpModal', () => {
    it('should open help modal when how-to-play link is clicked', () => {
      initializeHelpModal()

      howToPlayLink.click()

      expect(helpModal.classList.contains('hidden')).toBe(false)
    })

    it('should open help modal when bottom how-to-play link is clicked', () => {
      initializeHelpModal()

      howToPlayLinkEnd.click()

      expect(helpModal.classList.contains('hidden')).toBe(false)
    })

    it('should close help modal when close button is clicked', () => {
      initializeHelpModal()
      howToPlayLink.click()

      helpCloseBtn.click()

      expect(helpModal.classList.contains('hidden')).toBe(true)
    })

    it('should close help modal when overlay is clicked', () => {
      initializeHelpModal()
      howToPlayLink.click()

      helpModalOverlay.click()

      expect(helpModal.classList.contains('hidden')).toBe(true)
    })

    it('should prevent default on link click', () => {
      initializeHelpModal()
      const event = new MouseEvent('click', { bubbles: true, cancelable: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      howToPlayLink.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  // ─── initializeKanaReferenceModal ─────────────────────────────────────────

  describe('initializeKanaReferenceModal', () => {
    it('should open kana modal showing hiragana tab when button is clicked', async () => {
      const { renderKanaReference } = await import('./ui-helpers')
      initializeKanaReferenceModal()

      openKanaReferenceBtn.click()

      expect(kanaModal.classList.contains('hidden')).toBe(false)
      expect(renderKanaReference).toHaveBeenCalledWith('hiragana')
    })

    it('should set hiragana tab active when modal opens', () => {
      initializeKanaReferenceModal()

      openKanaReferenceBtn.click()

      expect(tabHiragana.classList.contains('active')).toBe(true)
      expect(tabKatakana.classList.contains('active')).toBe(false)
    })

    it('should switch to katakana tab when katakana tab is clicked', async () => {
      const { renderKanaReference } = await import('./ui-helpers')
      initializeKanaReferenceModal()

      tabKatakana.click()

      expect(renderKanaReference).toHaveBeenCalledWith('katakana')
      expect(tabKatakana.classList.contains('active')).toBe(true)
      expect(tabHiragana.classList.contains('active')).toBe(false)
    })

    it('should switch back to hiragana tab when hiragana tab is clicked', async () => {
      const { renderKanaReference } = await import('./ui-helpers')
      initializeKanaReferenceModal()
      tabKatakana.click()

      tabHiragana.click()

      expect(renderKanaReference).toHaveBeenLastCalledWith('hiragana')
      expect(tabHiragana.classList.contains('active')).toBe(true)
    })

    it('should close kana modal when close button is clicked', () => {
      initializeKanaReferenceModal()
      openKanaReferenceBtn.click()

      kanaCloseBtn.click()

      expect(kanaModal.classList.contains('hidden')).toBe(true)
    })

    it('should close kana modal when overlay is clicked', () => {
      initializeKanaReferenceModal()
      openKanaReferenceBtn.click()

      kanaModalOverlay.click()

      expect(kanaModal.classList.contains('hidden')).toBe(true)
    })

    it('should call updateKanaScrollIndicators on resize when modal is open', async () => {
      const { updateKanaScrollIndicators } = await import('./ui-helpers')
      initializeKanaReferenceModal()
      openKanaReferenceBtn.click() // modal is now visible

      window.dispatchEvent(new Event('resize'))
      vi.advanceTimersByTime(200) // debounce delay is 150ms

      expect(updateKanaScrollIndicators).toHaveBeenCalled()
    })

    it('should not call updateKanaScrollIndicators on resize when modal is hidden', async () => {
      const { updateKanaScrollIndicators } = await import('./ui-helpers')
      initializeKanaReferenceModal()
      // modal stays hidden

      window.dispatchEvent(new Event('resize'))
      vi.advanceTimersByTime(200)

      expect(updateKanaScrollIndicators).not.toHaveBeenCalled()
    })
  })

  // ─── initializeModalEscapeKeys ────────────────────────────────────────────
  // Use beforeAll so the document keydown listener is only registered once.
  // Per-test calls accumulate anonymous listeners that interfere with each other.

  describe('initializeModalEscapeKeys', () => {
    const sharedEngine = { running: false, pause: vi.fn(), resume: vi.fn() }

    beforeAll(() => {
      initializeModalEscapeKeys(sharedEngine as any)
    })

    beforeEach(() => {
      sharedEngine.running = false
      resetModals()
    })

    it('should close settings modal on Escape when engine is not running', () => {
      sharedEngine.running = false
      settingsModal.classList.remove('hidden')

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape', bubbles: true }))

      expect(settingsModal.classList.contains('hidden')).toBe(true)
    })

    it('should not close settings modal on Escape when engine is running', () => {
      sharedEngine.running = true
      settingsModal.classList.remove('hidden')

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape', bubbles: true }))

      expect(settingsModal.classList.contains('hidden')).toBe(false)
    })

    it('should close help modal on Escape', () => {
      settingsModal.classList.add('hidden')
      helpModal.classList.remove('hidden')

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape', bubbles: true }))

      expect(helpModal.classList.contains('hidden')).toBe(true)
    })

    it('should close kana modal on Escape', () => {
      settingsModal.classList.add('hidden')
      helpModal.classList.add('hidden')
      kanaModal.classList.remove('hidden')

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape', bubbles: true }))

      expect(kanaModal.classList.contains('hidden')).toBe(true)
    })

    it('should do nothing on Escape when all modals are hidden', () => {
      // Covers the false branch of `if (!kanaModal.classList.contains('hidden'))`
      // All modals hidden — no visible modal to close, handler exits silently
      settingsModal.classList.add('hidden')
      helpModal.classList.add('hidden')
      kanaModal.classList.add('hidden')

      // Should not throw, and no modal state changes
      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape', bubbles: true }))

      expect(kanaModal.classList.contains('hidden')).toBe(true)
    })

    it('should not respond to non-Escape keys', () => {
      settingsModal.classList.remove('hidden')

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter', bubbles: true }))

      expect(settingsModal.classList.contains('hidden')).toBe(false)
    })
  })
})
