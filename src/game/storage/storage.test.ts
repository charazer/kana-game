import { loadSettings, saveSettings, updateSetting, getHighScores, addHighScore, isHighScore, type Settings } from './storage'

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('loadSettings', () => {
    it('should return empty object when no settings exist', () => {
      const settings = loadSettings()
      expect(settings).toEqual({})
    })

    it('should load settings from localStorage', () => {
      const mockSettings: Settings = {
        kanaSet: 'hiragana',
        gameMode: 'practice',
        audioEnabled: true,
        includeDakuten: false,
        includeYoon: true
      }
      localStorage.setItem('kana-game:v1', JSON.stringify(mockSettings))
      
      const settings = loadSettings()
      expect(settings).toEqual(mockSettings)
    })

    it('should return empty object on JSON parse error', () => {
      localStorage.setItem('kana-game:v1', 'invalid json')
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const settings = loadSettings()
      expect(settings).toEqual({})
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to load settings', expect.any(Error))
      
      consoleWarnSpy.mockRestore()
    })

    it('should handle localStorage access errors', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage access denied')
      })
      
      const settings = loadSettings()
      expect(settings).toEqual({})
      expect(consoleWarnSpy).toHaveBeenCalled()
      
      consoleWarnSpy.mockRestore()
    })
  })

  describe('saveSettings', () => {
    it('should save settings to localStorage', () => {
      const settings: Settings = {
        kanaSet: 'katakana',
        gameMode: 'challenge',
        audioEnabled: false
      }
      
      saveSettings(settings)
      
      const stored = localStorage.getItem('kana-game:v1')
      expect(stored).toBe(JSON.stringify(settings))
    })

    it('should handle localStorage write errors', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })
      
      saveSettings({ audioEnabled: true })
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to save settings', expect.any(Error))
      
      consoleWarnSpy.mockRestore()
    })
  })

  describe('getHighScores', () => {
    it('should return empty array when no high scores exist', () => {
      const scores = getHighScores()
      expect(scores).toEqual([])
    })

    it('should return high scores from settings', () => {
      const mockScores = [
        { score: 100, date: '2024-01-01T00:00:00.000Z' },
        { score: 50, date: '2024-01-02T00:00:00.000Z' }
      ]
      localStorage.setItem('kana-game:v1', JSON.stringify({ highScores: mockScores }))
      
      const scores = getHighScores()
      expect(scores).toEqual(mockScores)
    })
  })

  describe('addHighScore', () => {
    it('should not add score of 0', () => {
      const result = addHighScore(0)
      expect(result).toEqual([])
      expect(getHighScores()).toEqual([])
    })

    it('should not add negative score', () => {
      const result = addHighScore(-10)
      expect(result).toEqual([])
      expect(getHighScores()).toEqual([])
    })

    it('should add first high score', () => {
      const result = addHighScore(100)
      expect(result).toHaveLength(1)
      expect(result[0].score).toBe(100)
      expect(result[0].date).toBeDefined()
    })

    it('should add multiple high scores', () => {
      addHighScore(100)
      addHighScore(200)
      const result = addHighScore(150)
      
      expect(result).toHaveLength(3)
      expect(result[0].score).toBe(200)
      expect(result[1].score).toBe(150)
      expect(result[2].score).toBe(100)
    })

    it('should maintain only top 5 scores', () => {
      addHighScore(10)
      addHighScore(20)
      addHighScore(30)
      addHighScore(40)
      addHighScore(50)
      const result = addHighScore(60)
      
      expect(result).toHaveLength(5)
      expect(result[0].score).toBe(60)
      expect(result[4].score).toBe(20)
      expect(result.find(s => s.score === 10)).toBeUndefined()
    })

    it('should sort scores in descending order', () => {
      addHighScore(30)
      addHighScore(10)
      addHighScore(50)
      const result = addHighScore(20)
      
      expect(result[0].score).toBe(50)
      expect(result[1].score).toBe(30)
      expect(result[2].score).toBe(20)
      expect(result[3].score).toBe(10)
    })

    it('should store ISO date string', () => {
      const beforeAdd = new Date().toISOString()
      const result = addHighScore(100)
      const afterAdd = new Date().toISOString()
      
      expect(result[0].date).toBeDefined()
      expect(result[0].date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      expect(result[0].date >= beforeAdd).toBe(true)
      expect(result[0].date <= afterAdd).toBe(true)
    })
  })

  describe('isHighScore', () => {
    it('should return false for score of 0', () => {
      expect(isHighScore(0)).toBe(false)
    })

    it('should return false for negative score', () => {
      expect(isHighScore(-10)).toBe(false)
    })

    it('should return true when less than 5 high scores exist', () => {
      addHighScore(100)
      addHighScore(200)
      expect(isHighScore(50)).toBe(true)
    })

    it('should return true when score would make top 5', () => {
      addHighScore(10)
      addHighScore(20)
      addHighScore(30)
      addHighScore(40)
      addHighScore(50)
      
      expect(isHighScore(60)).toBe(true)
      expect(isHighScore(25)).toBe(true)
    })

    it('should return false when score is lower than 5th place', () => {
      addHighScore(10)
      addHighScore(20)
      addHighScore(30)
      addHighScore(40)
      addHighScore(50)
      
      expect(isHighScore(9)).toBe(false)
      expect(isHighScore(10)).toBe(false)
    })

    it('should return true for equal score to 5th place plus 1', () => {
      addHighScore(10)
      addHighScore(20)
      addHighScore(30)
      addHighScore(40)
      addHighScore(50)
      
      expect(isHighScore(11)).toBe(true)
    })
  })

  describe('updateSetting', () => {
    it('should persist a partial setting update', () => {
      saveSettings({ audioEnabled: true, gameMode: 'challenge' })

      updateSetting({ audioEnabled: false })

      const result = loadSettings()
      expect(result.audioEnabled).toBe(false)
      expect(result.gameMode).toBe('challenge')
    })

    it('should create settings entry when none exists', () => {
      updateSetting({ kanaSet: 'katakana' })

      const result = loadSettings()
      expect(result.kanaSet).toBe('katakana')
    })

    it('should not overwrite unrelated settings', () => {
      saveSettings({ audioEnabled: true, musicEnabled: false, musicVolume: 0.5 })

      updateSetting({ musicVolume: 0.8 })

      const result = loadSettings()
      expect(result.audioEnabled).toBe(true)
      expect(result.musicEnabled).toBe(false)
      expect(result.musicVolume).toBe(0.8)
    })
  })
})
