import { vi } from 'vitest'
import { renderHighScores, renderKanaReference, updateKanaScrollIndicators } from './ui-helpers'
import { GAME_MODE_PRACTICE, GAME_MODE_CHALLENGE } from '../game/constants/constants'

// ── Mocks ────────────────────────────────────────────────────────────────────

const { kanaContentEl } = vi.hoisted(() => ({
  kanaContentEl: document.createElement('div')
}))

vi.mock('./dom-elements', () => ({
  kanaContent: kanaContentEl
}))

vi.mock('../game/storage/storage', () => ({
  getHighScores: vi.fn(() => [])
}))

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ui-helpers', () => {
  beforeEach(() => {
    kanaContentEl.innerHTML = ''
  })

  // ─── renderHighScores ──────────────────────────────────────────────────────

  describe('renderHighScores', () => {
    let container: HTMLElement

    beforeEach(() => {
      container = document.createElement('div')
    })

    it('should render empty state when there are no scores', async () => {
      const { getHighScores } = await import('../game/storage/storage')
      vi.mocked(getHighScores).mockReturnValue([])

      renderHighScores(container, GAME_MODE_CHALLENGE)

      expect(container.innerHTML).toContain('No scores yet!')
    })

    it('should render scores in challenge mode', async () => {
      const { getHighScores } = await import('../game/storage/storage')
      vi.mocked(getHighScores).mockReturnValue([
        { score: 500, date: '2024-01-01T00:00:00.000Z' },
        { score: 300, date: '2024-01-02T00:00:00.000Z' }
      ])

      renderHighScores(container, GAME_MODE_CHALLENGE)

      expect(container.innerHTML).toContain('500')
      expect(container.innerHTML).toContain('300')
    })

    it('should highlight a matching score', async () => {
      const { getHighScores } = await import('../game/storage/storage')
      vi.mocked(getHighScores).mockReturnValue([
        { score: 500, date: '2024-01-01T00:00:00.000Z' }
      ])

      renderHighScores(container, GAME_MODE_CHALLENGE, 500)

      expect(container.innerHTML).toContain('highlight')
    })

    it('should not highlight when highlightScore does not match', async () => {
      const { getHighScores } = await import('../game/storage/storage')
      vi.mocked(getHighScores).mockReturnValue([
        { score: 500, date: '2024-01-01T00:00:00.000Z' }
      ])

      renderHighScores(container, GAME_MODE_CHALLENGE, 999)

      expect(container.innerHTML).not.toContain('highlight')
    })

    it('should render practice-mode message in practice mode', async () => {
      const { getHighScores } = await import('../game/storage/storage')
      vi.mocked(getHighScores).mockReturnValue([])

      renderHighScores(container, GAME_MODE_PRACTICE)

      expect(container.innerHTML).toContain('practice mode')
    })

    it('should assign rank starting from 1', async () => {
      const { getHighScores } = await import('../game/storage/storage')
      vi.mocked(getHighScores).mockReturnValue([
        { score: 800, date: '2024-01-01T00:00:00.000Z' },
        { score: 400, date: '2024-01-02T00:00:00.000Z' }
      ])

      renderHighScores(container, GAME_MODE_CHALLENGE)

      expect(container.innerHTML).toContain('#1')
      expect(container.innerHTML).toContain('#2')
    })
  })

  // ─── renderKanaReference ───────────────────────────────────────────────────

  describe('renderKanaReference', () => {
    beforeEach(() => {
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        cb(0)
        return 0
      })
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should set kanaContent innerHTML for hiragana', () => {
      renderKanaReference('hiragana')

      expect(kanaContentEl.innerHTML).toBeTruthy()
      expect(kanaContentEl.innerHTML).toContain('kana-section')
    })

    it('should set kanaContent innerHTML for katakana', () => {
      renderKanaReference('katakana')

      expect(kanaContentEl.innerHTML).toBeTruthy()
      expect(kanaContentEl.innerHTML).toContain('kana-section')
    })

    it('should render different content for hiragana vs katakana', () => {
      renderKanaReference('hiragana')
      const hiraganaHTML = kanaContentEl.innerHTML

      renderKanaReference('katakana')
      const katakanaHTML = kanaContentEl.innerHTML

      expect(hiraganaHTML).not.toBe(katakanaHTML)
    })

    it('should call requestAnimationFrame to schedule scroll indicator update', () => {
      renderKanaReference('hiragana')

      expect(window.requestAnimationFrame).toHaveBeenCalledWith(updateKanaScrollIndicators)
    })
  })

  // ─── updateKanaScrollIndicators ───────────────────────────────────────────

  describe('updateKanaScrollIndicators', () => {
    it('should not throw when kanaContent is empty', () => {
      kanaContentEl.innerHTML = ''

      expect(() => updateKanaScrollIndicators()).not.toThrow()
    })

    it('should add has-scroll class when table overflows', () => {
      kanaContentEl.innerHTML = `
        <div class="kana-section">
          <div class="kana-table"></div>
        </div>
      `
      const section = kanaContentEl.querySelector('.kana-section') as HTMLElement
      const table = kanaContentEl.querySelector('.kana-table') as HTMLElement
      Object.defineProperty(table, 'scrollWidth', { get: () => 600, configurable: true })
      Object.defineProperty(table, 'clientWidth', { get: () => 300, configurable: true })

      updateKanaScrollIndicators()

      expect(section.classList.contains('has-scroll')).toBe(true)
    })

    it('should not add has-scroll class when table does not overflow', () => {
      kanaContentEl.innerHTML = `
        <div class="kana-section">
          <div class="kana-table"></div>
        </div>
      `
      const section = kanaContentEl.querySelector('.kana-section') as HTMLElement
      const table = kanaContentEl.querySelector('.kana-table') as HTMLElement
      Object.defineProperty(table, 'scrollWidth', { get: () => 100, configurable: true })
      Object.defineProperty(table, 'clientWidth', { get: () => 300, configurable: true })

      updateKanaScrollIndicators()

      expect(section.classList.contains('has-scroll')).toBe(false)
    })

    it('should handle sections without a kana-table', () => {
      kanaContentEl.innerHTML = `<div class="kana-section"><div class="kana-grid"></div></div>`

      expect(() => updateKanaScrollIndicators()).not.toThrow()
    })

    it('should update multiple sections independently', () => {
      kanaContentEl.innerHTML = `
        <div class="kana-section">
          <div class="kana-table" id="t1"></div>
        </div>
        <div class="kana-section">
          <div class="kana-table" id="t2"></div>
        </div>
      `
      const sections = kanaContentEl.querySelectorAll('.kana-section')
      const t1 = kanaContentEl.querySelector('#t1')!
      const t2 = kanaContentEl.querySelector('#t2')!
      Object.defineProperty(t1, 'scrollWidth', { get: () => 600, configurable: true })
      Object.defineProperty(t1, 'clientWidth', { get: () => 200, configurable: true })
      Object.defineProperty(t2, 'scrollWidth', { get: () => 100, configurable: true })
      Object.defineProperty(t2, 'clientWidth', { get: () => 300, configurable: true })

      updateKanaScrollIndicators()

      expect((sections[0] as HTMLElement).classList.contains('has-scroll')).toBe(true)
      expect((sections[1] as HTMLElement).classList.contains('has-scroll')).toBe(false)
    })
  })
})
