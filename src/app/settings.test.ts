import { vi } from 'vitest'
import { initializeAudio, initializeGameSettings, createSettingsControl } from './settings'
import { GAME_MODE_CHALLENGE, GAME_MODE_PRACTICE, KANA_SET_HIRAGANA, KANA_SET_KATAKANA } from '../game/constants/constants'

// ── Mock DOM elements ─────────────────────────────────────────────────────────

const {
  audioToggle, musicToggle, musicVolumeSlider, musicVolumeValue,
  gameModeSelect, kanaSelect, includeDakutenToggle, includeYoonToggle, highScoresStartEl
} = vi.hoisted(() => {
  const audioToggle = document.createElement('input') as HTMLInputElement
  audioToggle.type = 'checkbox'
  const musicToggle = document.createElement('input') as HTMLInputElement
  musicToggle.type = 'checkbox'
  const musicVolumeSlider = document.createElement('input') as HTMLInputElement
  musicVolumeSlider.type = 'range'
  const musicVolumeValue = document.createElement('span') as HTMLSpanElement
  const gameModeSelect = document.createElement('select') as HTMLSelectElement
  const kanaSelect = document.createElement('select') as HTMLSelectElement
  // Populate options so that setting .value works correctly
  ;(['challenge', 'practice'] as const).forEach(v => {
    const opt = document.createElement('option'); opt.value = v; gameModeSelect.appendChild(opt)
  })
  ;(['hiragana', 'katakana', 'mixed'] as const).forEach(v => {
    const opt = document.createElement('option'); opt.value = v; kanaSelect.appendChild(opt)
  })
  const includeDakutenToggle = document.createElement('input') as HTMLInputElement
  includeDakutenToggle.type = 'checkbox'
  const includeYoonToggle = document.createElement('input') as HTMLInputElement
  includeYoonToggle.type = 'checkbox'
  const highScoresStartEl = document.createElement('div')
  return {
    audioToggle, musicToggle, musicVolumeSlider, musicVolumeValue,
    gameModeSelect, kanaSelect, includeDakutenToggle, includeYoonToggle, highScoresStartEl
  }
})

vi.mock('./dom-elements', () => ({
  audioToggle,
  musicToggle,
  musicVolumeSlider,
  musicVolumeValue,
  gameModeSelect,
  kanaSelect,
  includeDakutenToggle,
  includeYoonToggle,
  highScoresStartEl
}))

vi.mock('../game/storage/storage', () => ({
  loadSettings: vi.fn(() => ({})),
  updateSetting: vi.fn()
}))

vi.mock('./ui-helpers', () => ({
  renderHighScores: vi.fn(),
  updateLivesDisplay: vi.fn()
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeAudio() {
  return {
    initMusic: vi.fn(),
    setEnabled: vi.fn(),
    setMusicEnabled: vi.fn(),
    setMusicVolume: vi.fn()
  }
}

function makeEngine() {
  return {
    setGameMode: vi.fn(),
    loadKana: vi.fn(),
    includeDakuten: true,
    includeYoon: true
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('settings', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    // Reset element state
    audioToggle.checked = false
    musicToggle.checked = false
    musicVolumeSlider.value = '30'
    musicVolumeValue.textContent = ''

    const { loadSettings } = await import('../game/storage/storage')
    vi.mocked(loadSettings).mockReturnValue({})
  })

  // ─── initializeAudio ──────────────────────────────────────────────────────

  describe('initializeAudio', () => {
    it('should call audio.initMusic with the saved volume', async () => {
      const { loadSettings } = await import('../game/storage/storage')
      vi.mocked(loadSettings).mockReturnValue({ musicVolume: 0.5 })
      const audio = makeAudio()

      await initializeAudio(audio as any)

      expect(audio.initMusic).toHaveBeenCalledWith(expect.any(Function), 0.5)
    })

    it('should use 0.3 as default music volume when not saved', async () => {
      const audio = makeAudio()

      await initializeAudio(audio as any)

      expect(audio.initMusic).toHaveBeenCalledWith(expect.any(Function), 0.3)
    })

    it('should set audioToggle.checked from saved settings', async () => {
      const { loadSettings } = await import('../game/storage/storage')
      vi.mocked(loadSettings).mockReturnValue({ audioEnabled: false })
      const audio = makeAudio()

      await initializeAudio(audio as any)

      expect(audioToggle.checked).toBe(false)
      expect(audio.setEnabled).toHaveBeenCalledWith(false)
    })

    it('should default audioEnabled to true when not saved', async () => {
      const audio = makeAudio()

      await initializeAudio(audio as any)

      expect(audioToggle.checked).toBe(true)
      expect(audio.setEnabled).toHaveBeenCalledWith(true)
    })

    it('should update audio enabled state and save on toggle change', async () => {
      const { updateSetting } = await import('../game/storage/storage')
      const audio = makeAudio()
      await initializeAudio(audio as any)

      audioToggle.checked = false
      audioToggle.dispatchEvent(new Event('change'))

      expect(audio.setEnabled).toHaveBeenLastCalledWith(false)
      expect(updateSetting).toHaveBeenCalledWith({ audioEnabled: false })
    })

    it('should set musicToggle.checked from saved settings', async () => {
      const { loadSettings } = await import('../game/storage/storage')
      vi.mocked(loadSettings).mockReturnValue({ musicEnabled: true })
      const audio = makeAudio()

      await initializeAudio(audio as any)

      expect(musicToggle.checked).toBe(true)
    })

    it('should default musicEnabled to false when not saved', async () => {
      const audio = makeAudio()

      await initializeAudio(audio as any)

      expect(musicToggle.checked).toBe(false)
    })

    it('should call setMusicEnabled and save on music toggle change', async () => {
      const { updateSetting } = await import('../game/storage/storage')
      const audio = makeAudio()
      await initializeAudio(audio as any)

      musicToggle.checked = true
      musicToggle.dispatchEvent(new Event('change'))
      // The handler is async (awaits setMusicEnabled), so flush microtasks
      await Promise.resolve()

      expect(audio.setMusicEnabled).toHaveBeenCalledWith(true)
      expect(updateSetting).toHaveBeenCalledWith({ musicEnabled: true })
    })

    it('should set volume slider and label from saved volume', async () => {
      const { loadSettings } = await import('../game/storage/storage')
      vi.mocked(loadSettings).mockReturnValue({ musicVolume: 0.7 })
      const audio = makeAudio()

      await initializeAudio(audio as any)

      expect(musicVolumeSlider.value).toBe('70')
      expect(musicVolumeValue.textContent).toBe('70%')
    })

    it('should update music volume and save on slider input', async () => {
      const { updateSetting } = await import('../game/storage/storage')
      const audio = makeAudio()
      await initializeAudio(audio as any)

      musicVolumeSlider.value = '60'
      musicVolumeSlider.dispatchEvent(new Event('input'))

      expect(audio.setMusicVolume).toHaveBeenCalledWith(0.6)
      expect(musicVolumeValue.textContent).toBe('60%')
      expect(updateSetting).toHaveBeenCalledWith({ musicVolume: 0.6 })
    })
  })

  // ─── initializeGameSettings ───────────────────────────────────────────────

  describe('initializeGameSettings', () => {
    it('should set game mode from saved settings and update engine', async () => {
      const { loadSettings } = await import('../game/storage/storage')
      vi.mocked(loadSettings).mockReturnValue({ gameMode: GAME_MODE_PRACTICE })
      const engine = makeEngine()

      initializeGameSettings(engine as any)

      expect(gameModeSelect.value).toBe(GAME_MODE_PRACTICE)
      expect(engine.setGameMode).toHaveBeenCalledWith(GAME_MODE_PRACTICE)
    })

    it('should default to challenge mode when not saved', async () => {
      const engine = makeEngine()

      initializeGameSettings(engine as any)

      expect(engine.setGameMode).toHaveBeenCalledWith(GAME_MODE_CHALLENGE)
    })

    it('should update engine mode, lives display, high scores, and save on game mode change', async () => {
      const { updateSetting } = await import('../game/storage/storage')
      const { updateLivesDisplay } = await import('./ui-helpers')
      const { renderHighScores } = await import('./ui-helpers')
      const engine = makeEngine()
      initializeGameSettings(engine as any)

      gameModeSelect.value = GAME_MODE_PRACTICE
      gameModeSelect.dispatchEvent(new Event('change'))

      expect(engine.setGameMode).toHaveBeenLastCalledWith(GAME_MODE_PRACTICE)
      expect(updateLivesDisplay).toHaveBeenCalledWith(GAME_MODE_PRACTICE)
      expect(renderHighScores).toHaveBeenCalledWith(highScoresStartEl, GAME_MODE_PRACTICE)
      expect(updateSetting).toHaveBeenCalledWith({ gameMode: GAME_MODE_PRACTICE })
    })

    it('should set kana set from saved settings', async () => {
      const { loadSettings } = await import('../game/storage/storage')
      vi.mocked(loadSettings).mockReturnValue({ kanaSet: KANA_SET_KATAKANA })
      const engine = makeEngine()

      initializeGameSettings(engine as any)

      expect(kanaSelect.value).toBe(KANA_SET_KATAKANA)
      expect(engine.loadKana).toHaveBeenCalledWith(KANA_SET_KATAKANA)
    })

    it('should default to hiragana when kanaSet not saved', async () => {
      const engine = makeEngine()

      initializeGameSettings(engine as any)

      expect(engine.loadKana).toHaveBeenCalledWith(KANA_SET_HIRAGANA)
    })

    it('should update engine kana set and save on kana select change', async () => {
      const { updateSetting } = await import('../game/storage/storage')
      const engine = makeEngine()
      initializeGameSettings(engine as any)

      kanaSelect.value = KANA_SET_KATAKANA
      kanaSelect.dispatchEvent(new Event('change'))

      expect(engine.loadKana).toHaveBeenLastCalledWith(KANA_SET_KATAKANA)
      expect(updateSetting).toHaveBeenCalledWith({ kanaSet: KANA_SET_KATAKANA })
    })

    it('should set includeDakuten from saved settings', async () => {
      const { loadSettings } = await import('../game/storage/storage')
      vi.mocked(loadSettings).mockReturnValue({ includeDakuten: false })
      const engine = makeEngine()

      initializeGameSettings(engine as any)

      expect(includeDakutenToggle.checked).toBe(false)
      expect(engine.includeDakuten).toBe(false)
    })

    it('should default includeDakuten to true when not saved', async () => {
      const engine = makeEngine()

      initializeGameSettings(engine as any)

      expect(includeDakutenToggle.checked).toBe(true)
      expect(engine.includeDakuten).toBe(true)
    })

    it('should update engine includeDakuten and save on toggle change', async () => {
      const { updateSetting } = await import('../game/storage/storage')
      const engine = makeEngine()
      initializeGameSettings(engine as any)

      includeDakutenToggle.checked = false
      includeDakutenToggle.dispatchEvent(new Event('change'))

      expect(engine.includeDakuten).toBe(false)
      expect(updateSetting).toHaveBeenCalledWith({ includeDakuten: false })
    })

    it('should set includeYoon from saved settings', async () => {
      const { loadSettings } = await import('../game/storage/storage')
      vi.mocked(loadSettings).mockReturnValue({ includeYoon: false })
      const engine = makeEngine()

      initializeGameSettings(engine as any)

      expect(includeYoonToggle.checked).toBe(false)
      expect(engine.includeYoon).toBe(false)
    })

    it('should update engine includeYoon and save on toggle change', async () => {
      const { updateSetting } = await import('../game/storage/storage')
      const engine = makeEngine()
      initializeGameSettings(engine as any)

      includeYoonToggle.checked = false
      includeYoonToggle.dispatchEvent(new Event('change'))

      expect(engine.includeYoon).toBe(false)
      expect(updateSetting).toHaveBeenCalledWith({ includeYoon: false })
    })
  })

  // ─── createSettingsControl ────────────────────────────────────────────────

  describe('createSettingsControl', () => {
    it('disable() should disable all settings form controls', () => {
      const handle = createSettingsControl()

      handle.disable()

      expect(gameModeSelect.disabled).toBe(true)
      expect(kanaSelect.disabled).toBe(true)
      expect(includeDakutenToggle.disabled).toBe(true)
      expect(includeYoonToggle.disabled).toBe(true)
    })

    it('enable() should enable all settings form controls', () => {
      const handle = createSettingsControl()
      handle.disable()

      handle.enable()

      expect(gameModeSelect.disabled).toBe(false)
      expect(kanaSelect.disabled).toBe(false)
      expect(includeDakutenToggle.disabled).toBe(false)
      expect(includeYoonToggle.disabled).toBe(false)
    })
  })
})
