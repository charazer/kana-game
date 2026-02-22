import { playOscillator, playArpeggio, playChord, playSlide } from './audio-helpers'

describe('audio-helpers', () => {
  let mockOscillator: any
  let mockGain: any
  let mockAudioContext: any

  beforeEach(() => {
    mockOscillator = {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: {
        value: 0,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
      },
      type: 'sine'
    }

    mockGain = {
      connect: vi.fn(),
      gain: {
        value: 0,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
      }
    }

    mockAudioContext = {
      currentTime: 0,
      destination: {},
      createOscillator: vi.fn(() => ({ ...mockOscillator })),
      createGain: vi.fn(() => mockGain)
    }
  })

  // ─── playOscillator ───────────────────────────────────────────────────────

  describe('playOscillator', () => {
    it('should connect oscillator to gain and gain to destination', () => {
      const osc = { ...mockOscillator }
      mockAudioContext.createOscillator.mockReturnValueOnce(osc)

      playOscillator(mockAudioContext, {
        frequency: 440,
        type: 'sine',
        volume: 0.2,
        duration: 0.1,
        startTime: 0
      })

      expect(osc.connect).toHaveBeenCalledWith(mockGain)
      expect(mockGain.connect).toHaveBeenCalledWith(mockAudioContext.destination)
    })

    it('should set static frequency when frequency is a number', () => {
      const osc = { ...mockOscillator }
      mockAudioContext.createOscillator.mockReturnValueOnce(osc)

      playOscillator(mockAudioContext, {
        frequency: 880,
        type: 'sine',
        volume: 0.1,
        duration: 0.2,
        startTime: 0
      })

      expect(osc.frequency.value).toBe(880)
    })

    it('should set slide frequency when frequency is "slide" with start and end', () => {
      const osc = { ...mockOscillator }
      mockAudioContext.createOscillator.mockReturnValueOnce(osc)

      playOscillator(mockAudioContext, {
        frequency: 'slide',
        frequencyStart: 440,
        frequencyEnd: 880,
        type: 'sine',
        volume: 0.1,
        duration: 0.3,
        startTime: 0
      })

      expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(440, 0)
      expect(osc.frequency.exponentialRampToValueAtTime).toHaveBeenCalled()
    })

    it('should skip frequency setup when frequency is "slide" but start/end missing', () => {
      // This covers the false branch of both the slide-if and the else-if
      const osc = { ...mockOscillator }
      mockAudioContext.createOscillator.mockReturnValueOnce(osc)

      playOscillator(mockAudioContext, {
        frequency: 'slide', // 'slide' but no frequencyStart/frequencyEnd
        type: 'sine',
        volume: 0.1,
        duration: 0.2,
        startTime: 0
      })

      expect(osc.frequency.setValueAtTime).not.toHaveBeenCalled()
      expect(osc.frequency.exponentialRampToValueAtTime).not.toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number)
      )
    })

    it('should start and stop the oscillator', () => {
      const osc = { ...mockOscillator }
      mockAudioContext.createOscillator.mockReturnValueOnce(osc)

      playOscillator(mockAudioContext, {
        frequency: 440,
        type: 'square',
        volume: 0.1,
        duration: 0.5,
        startTime: 1.0
      })

      expect(osc.start).toHaveBeenCalledWith(1.0)
      expect(osc.stop).toHaveBeenCalledWith(1.5)
    })

    it('should set the oscillator type', () => {
      const osc = { ...mockOscillator, type: 'sine' }
      mockAudioContext.createOscillator.mockReturnValueOnce(osc)

      playOscillator(mockAudioContext, {
        frequency: 440,
        type: 'triangle',
        volume: 0.1,
        duration: 0.2,
        startTime: 0
      })

      expect(osc.type).toBe('triangle')
    })
  })

  // ─── playArpeggio ─────────────────────────────────────────────────────────

  describe('playArpeggio', () => {
    it('should play each note in sequence with default timing', () => {
      playArpeggio(mockAudioContext, [
        { frequency: 440 },
        { frequency: 550 },
        { frequency: 660 }
      ])

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3)
    })

    it('should use explicit delay when provided', () => {
      // Covers the note.delay ?? branch left-side (delay is provided)
      playArpeggio(mockAudioContext, [
        { frequency: 440, delay: 0.0 },
        { frequency: 550, delay: 0.2 }
      ], 0)

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(2)
    })

    it('should use explicit type, volume, and duration when provided', () => {
      // Covers the note.type ??, note.volume ??, note.duration ?? left-side branches
      playArpeggio(mockAudioContext, [
        {
          frequency: 440,
          type: 'square' as OscillatorType,
          volume: 0.5,
          duration: 0.4
        }
      ])

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1)
    })

    it('should use defaults when type, volume, duration are not provided', () => {
      playArpeggio(mockAudioContext, [{ frequency: 440 }])

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1)
    })

    it('should use the provided baseTime for scheduling', () => {
      const osc = { ...mockOscillator }
      mockAudioContext.createOscillator.mockReturnValue(osc)

      playArpeggio(mockAudioContext, [{ frequency: 440, delay: 0.5 }], 1.0)

      // startTime = 1.0 + 0.5 = 1.5
      expect(osc.start).toHaveBeenCalledWith(1.5)
    })
  })

  // ─── playChord ────────────────────────────────────────────────────────────

  describe('playChord', () => {
    it('should play each frequency simultaneously', () => {
      playChord(mockAudioContext, [440, 550, 660])

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3)
    })

    it('should use default options when none are provided', () => {
      playChord(mockAudioContext, [440])

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1)
    })

    it('should apply explicit options', () => {
      playChord(mockAudioContext, [440], {
        type: 'square',
        volume: 0.3,
        duration: 0.5,
        startTime: 1.0
      })

      const osc = mockAudioContext.createOscillator.mock.results[0].value
      expect(osc.type).toBe('square')
      expect(osc.start).toHaveBeenCalledWith(1.0)
    })
  })

  // ─── playSlide ────────────────────────────────────────────────────────────

  describe('playSlide', () => {
    it('should play a frequency slide from one note to another', () => {
      const osc = { ...mockOscillator }
      mockAudioContext.createOscillator.mockReturnValueOnce(osc)

      playSlide(mockAudioContext, 440, 880)

      expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(440, expect.any(Number))
      expect(osc.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(880, expect.any(Number))
    })

    it('should use default options when none provided', () => {
      playSlide(mockAudioContext, 200, 400)

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1)
    })

    it('should apply explicit options', () => {
      playSlide(mockAudioContext, 200, 400, {
        type: 'sawtooth',
        volume: 0.4,
        duration: 0.5,
        startTime: 2.0
      })

      const osc = mockAudioContext.createOscillator.mock.results[0].value
      expect(osc.type).toBe('sawtooth')
      expect(osc.start).toHaveBeenCalledWith(2.0)
    })
  })
})
