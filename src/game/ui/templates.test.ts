import { createHighScoreEntry, createHighScoresList, createKanaReference, DOMBuilder, ButtonTemplates, type HighScoreEntry } from './templates'
import type { KanaEntry } from '../core/types'

describe('templates', () => {
  describe('createHighScoreEntry', () => {
    it('should create high score entry HTML without highlight', () => {
      const entry: HighScoreEntry = {
        score: 100,
        date: '2024-01-15T12:00:00.000Z',
        rank: 1,
        highlight: false
      }
      
      const html = createHighScoreEntry(entry, '#')
      
      expect(html).toContain('high-score-entry')
      expect(html).toContain('#1')
      expect(html).toContain('100')
      expect(html).not.toContain('highlight')
    })

    it('should create high score entry HTML with highlight', () => {
      const entry: HighScoreEntry = {
        score: 200,
        date: '2024-01-15T12:00:00.000Z',
        rank: 2,
        highlight: true
      }
      
      const html = createHighScoreEntry(entry, '#')
      
      expect(html).toContain('highlight')
      expect(html).toContain('#2')
      expect(html).toContain('200')
    })

    it('should format date as locale date string', () => {
      const entry: HighScoreEntry = {
        score: 100,
        date: '2024-01-15T12:00:00.000Z',
        rank: 1
      }
      
      const html = createHighScoreEntry(entry, '#')
      const expectedDate = new Date('2024-01-15T12:00:00.000Z').toLocaleDateString()
      
      expect(html).toContain(expectedDate)
    })

    it('should use custom rank prefix', () => {
      const entry: HighScoreEntry = {
        score: 100,
        date: '2024-01-15T12:00:00.000Z',
        rank: 3
      }
      
      const html = createHighScoreEntry(entry, 'Rank ')
      
      expect(html).toContain('Rank 3')
    })
  })

  describe('createHighScoresList', () => {
    it('should show empty message when no entries', () => {
      const html = createHighScoresList([], '#')
      
      expect(html).toContain('High Scores')
      expect(html).toContain('No scores yet!')
    })

    it('should use custom empty message', () => {
      const html = createHighScoresList([], '#', 'Play to get your first score!')
      
      expect(html).toContain('Play to get your first score!')
    })

    it('should create list with single entry', () => {
      const entries: HighScoreEntry[] = [
        { score: 100, date: '2024-01-15T12:00:00.000Z', rank: 1 }
      ]
      
      const html = createHighScoresList(entries, '#')
      
      expect(html).toContain('High Scores')
      expect(html).toContain('high-score-entry')
      expect(html).toContain('#1')
      expect(html).toContain('100')
    })

    it('should create list with multiple entries', () => {
      const entries: HighScoreEntry[] = [
        { score: 100, date: '2024-01-15T12:00:00.000Z', rank: 1 },
        { score: 80, date: '2024-01-14T12:00:00.000Z', rank: 2 },
        { score: 60, date: '2024-01-13T12:00:00.000Z', rank: 3 }
      ]
      
      const html = createHighScoresList(entries, '#')
      
      expect(html).toContain('#1')
      expect(html).toContain('#2')
      expect(html).toContain('#3')
      expect(html).toContain('100')
      expect(html).toContain('80')
      expect(html).toContain('60')
    })
  })

  describe('DOMBuilder', () => {
    describe('updateButton', () => {
      it('should update button innerHTML with correct structure', () => {
        const button = document.createElement('button')
        
        DOMBuilder.updateButton(button, {
          leftIcon: '<img src="test.png" alt="test">',
          label: 'Test Button',
          rightKey: 'T'
        })
        
        expect(button.innerHTML).toContain('btn-left')
        expect(button.innerHTML).toContain('btn-label')
        expect(button.innerHTML).toContain('btn-right')
        expect(button.innerHTML).toContain('<img src="test.png" alt="test">')
        expect(button.innerHTML).toContain('Test Button')
        expect(button.innerHTML).toContain('<kbd>T</kbd>')
      })

      it('should preserve button element reference', () => {
        const button = document.createElement('button')
        button.className = 'my-button'
        button.id = 'btn-1'
        
        DOMBuilder.updateButton(button, {
          leftIcon: '',
          label: 'Updated',
          rightKey: 'U'
        })
        
        expect(button.className).toBe('my-button')
        expect(button.id).toBe('btn-1')
      })
    })
  })

  describe('ButtonTemplates', () => {
    it('should have pause button template', () => {
      expect(ButtonTemplates.pause).toBeDefined()
      expect(ButtonTemplates.pause.label).toBe('Pause')
      expect(ButtonTemplates.pause.rightKey).toBe('Space')
      expect(ButtonTemplates.pause.leftIcon).toContain('button_pause.png')
    })

    it('should have resume button template', () => {
      expect(ButtonTemplates.resume).toBeDefined()
      expect(ButtonTemplates.resume.label).toBe('Resume')
      expect(ButtonTemplates.resume.rightKey).toBe('Space')
      expect(ButtonTemplates.resume.leftIcon).toContain('button_play.png')
    })
  })

  describe('createKanaReference', () => {
    const mockHiraganaData: KanaEntry[] = [
      // Basic kana
      { id: 'a', kana: 'あ', romaji: ['a'], type: 'hiragana' },
      { id: 'i', kana: 'い', romaji: ['i'], type: 'hiragana' },
      { id: 'ka', kana: 'か', romaji: ['ka'], type: 'hiragana' },
      // Dakuten kana
      { id: 'ga', kana: 'が', romaji: ['ga'], type: 'hiragana' },
      { id: 'pa', kana: 'ぱ', romaji: ['pa'], type: 'hiragana' },
      // Yoon kana
      { id: 'kya', kana: 'きゃ', romaji: ['kya'], type: 'hiragana' },
      { id: 'nya', kana: 'にゃ', romaji: ['nya'], type: 'hiragana' }
    ]

    it('should create hiragana reference with basic kana section', () => {
      const html = createKanaReference(mockHiraganaData)
      
      expect(html).toContain('基本')
      expect(html).toContain('Basic Kana')
      expect(html).toContain('あ')
      expect(html).toContain('い')
      expect(html).toContain('か')
    })

    it('should create hiragana reference with dakuten section', () => {
      const html = createKanaReference(mockHiraganaData)
      
      expect(html).toContain('濁音・半濁音')
      expect(html).toContain('Dakuten')
      expect(html).toContain('が')
      expect(html).toContain('ぱ')
    })

    it('should create hiragana reference with yoon section', () => {
      const html = createKanaReference(mockHiraganaData)
      
      expect(html).toContain('拗音')
      expect(html).toContain('Yoon')
      expect(html).toContain('きゃ')
      expect(html).toContain('にゃ')
    })

    it('should display romaji alternatives', () => {
      const data: KanaEntry[] = [
        { id: 'shi', kana: 'し', romaji: ['shi', 'si'], type: 'hiragana' }
      ]
      
      const html = createKanaReference(data)
      
      expect(html).toContain('shi / si')
    })

    it('should handle empty kana data', () => {
      const html = createKanaReference([])
      
      expect(html).toBe('')
    })

    it('should handle katakana type', () => {
      const katakanaData: KanaEntry[] = [
        { id: 'a', kana: 'ア', romaji: ['a'], type: 'katakana' }
      ]
      
      const html = createKanaReference(katakanaData)
      
      expect(html).toContain('ア')
    })

    it('should organize kana items into sections', () => {
      const html = createKanaReference(mockHiraganaData)
      
      expect(html).toContain('kana-section')
      expect(html).toContain('kana-item')
      expect(html).toContain('kana-char')
      expect(html).toContain('kana-romaji')
    })

    it('should only include sections that have kana', () => {
      const basicOnly: KanaEntry[] = [
        { id: 'a', kana: 'あ', romaji: ['a'], type: 'hiragana' }
      ]
      
      const html = createKanaReference(basicOnly)
      
      expect(html).toContain('基本')
      expect(html).not.toContain('濁音・半濁音')
      expect(html).not.toContain('拗音')
    })
  })
})
