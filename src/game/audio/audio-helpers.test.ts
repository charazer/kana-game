import {
  playOscillator,
  playKotoPluck,
  playKotoArpeggio,
  playTaikoDrum,
  playWindChime,
  YO_SCALE,
} from './audio-helpers'

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
      detune: { value: 0 },
      type: 'sine'
    }

    mockGain = {
      connect: vi.fn(),
      gain: {
        value: 0,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
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

  // ─── Scale Constants ──────────────────────────────────────────────────────

  describe('scales', () => {
    it('YO_SCALE should contain 6 positive frequencies', () => {
      expect(YO_SCALE).toHaveLength(6)
      YO_SCALE.forEach(f => expect(f).toBeGreaterThan(0))
    })

    it('YO_SCALE should be in ascending order', () => {
      for (let i = 1; i < YO_SCALE.length; i++) {
        expect(YO_SCALE[i]).toBeGreaterThan(YO_SCALE[i - 1])
      }
    })
  })

  // ─── playOscillator ──────────────────────────────────────────────────────

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
      const osc = { ...mockOscillator }
      mockAudioContext.createOscillator.mockReturnValueOnce(osc)

      playOscillator(mockAudioContext, {
        frequency: 'slide',
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

  // ─── playKotoPluck ────────────────────────────────────────────────────────

  describe('playKotoPluck', () => {
    it('should create 3 oscillators for harmonic layering', () => {
      playKotoPluck(mockAudioContext, { frequency: 440 })

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3)
      expect(mockAudioContext.createGain).toHaveBeenCalledTimes(3)
    })

    it('should connect each oscillator to gain and destination', () => {
      const osc = { ...mockOscillator }
      mockAudioContext.createOscillator.mockReturnValue(osc)

      playKotoPluck(mockAudioContext, { frequency: 440 })

      expect(osc.connect).toHaveBeenCalledWith(mockGain)
      expect(mockGain.connect).toHaveBeenCalledWith(mockAudioContext.destination)
    })

    it('should use triangle for fundamental and sine for overtones', () => {
      const oscillators: any[] = []
      mockAudioContext.createOscillator.mockImplementation(() => {
        const osc = { ...mockOscillator, type: 'sine' }
        oscillators.push(osc)
        return osc
      })

      playKotoPluck(mockAudioContext, { frequency: 440 })

      expect(oscillators[0].type).toBe('triangle')
      expect(oscillators[1].type).toBe('sine')
      expect(oscillators[2].type).toBe('sine')
    })

    it('should set harmonic frequencies based on fundamental', () => {
      const oscillators: any[] = []
      mockAudioContext.createOscillator.mockImplementation(() => {
        const osc = {
          ...mockOscillator,
          frequency: { ...mockOscillator.frequency, value: 0 },
        }
        oscillators.push(osc)
        return osc
      })

      playKotoPluck(mockAudioContext, { frequency: 440 })

      expect(oscillators[0].frequency.value).toBe(440)          // 1× fundamental
      expect(oscillators[1].frequency.value).toBe(880)          // 2× octave
      expect(oscillators[2].frequency.value).toBeCloseTo(1318.68) // ~3× fifth
    })

    it('should set up gain envelope with linear attack ramp', () => {
      playKotoPluck(mockAudioContext, { frequency: 440 })

      expect(mockGain.gain.setValueAtTime).toHaveBeenCalled()
      expect(mockGain.gain.linearRampToValueAtTime).toHaveBeenCalled()
      expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalled()
    })

    it('should start and stop all oscillators', () => {
      const osc = { ...mockOscillator }
      mockAudioContext.createOscillator.mockReturnValue(osc)

      playKotoPluck(mockAudioContext, { frequency: 440 })

      expect(osc.start).toHaveBeenCalledTimes(3)
      expect(osc.stop).toHaveBeenCalledTimes(3)
    })

    it('should use default values when not specified', () => {
      playKotoPluck(mockAudioContext, { frequency: 440 })

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3)
    })

    it('should use custom volume, duration, and startTime', () => {
      const osc = { ...mockOscillator }
      mockAudioContext.createOscillator.mockReturnValue(osc)

      playKotoPluck(mockAudioContext, {
        frequency: 440,
        volume: 0.2,
        duration: 0.5,
        startTime: 1.0
      })

      expect(osc.start).toHaveBeenCalledWith(1.0)
    })
  })

  // ─── playKotoArpeggio ─────────────────────────────────────────────────────

  describe('playKotoArpeggio', () => {
    it('should create oscillators for each note (3 per pluck)', () => {
      playKotoArpeggio(mockAudioContext, [
        { frequency: 440 },
        { frequency: 554.37 },
        { frequency: 659.25 }
      ])

      // 3 notes × 3 harmonics = 9 oscillators
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(9)
    })

    it('should use explicit delay when provided', () => {
      playKotoArpeggio(mockAudioContext, [
        { frequency: 440, delay: 0.0 },
        { frequency: 554.37, delay: 0.2 }
      ], 0)

      // 2 notes × 3 harmonics = 6 oscillators
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(6)
    })

    it('should use provided baseTime for scheduling', () => {
      const osc = { ...mockOscillator }
      mockAudioContext.createOscillator.mockReturnValue(osc)

      playKotoArpeggio(mockAudioContext, [
        { frequency: 440, delay: 0.5 }
      ], 1.0)

      // startTime = 1.0 + 0.5 = 1.5
      expect(osc.start).toHaveBeenCalledWith(1.5)
    })

    it('should use explicit volume and duration when provided', () => {
      playKotoArpeggio(mockAudioContext, [
        { frequency: 440, volume: 0.3, duration: 0.5 }
      ])

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3)
    })

    it('should use defaults when volume and duration are not provided', () => {
      playKotoArpeggio(mockAudioContext, [{ frequency: 440 }])

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3)
    })

    it('should use default delay based on index when delay is not provided', () => {
      const osc = { ...mockOscillator }
      mockAudioContext.createOscillator.mockReturnValue(osc)

      playKotoArpeggio(mockAudioContext, [
        { frequency: 440 },
        { frequency: 550 }
      ], 0)

      // Second note: startTime = 0 + 1 * 0.12 = 0.12
      expect(osc.start).toHaveBeenCalledWith(0.12)
    })
  })

  // ─── playTaikoDrum ────────────────────────────────────────────────────────

  describe('playTaikoDrum', () => {
    it('should create one oscillator and one gain node', () => {
      playTaikoDrum(mockAudioContext)

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1)
      expect(mockAudioContext.createGain).toHaveBeenCalledTimes(1)
    })

    it('should connect oscillator to gain and destination', () => {
      const osc = { ...mockOscillator }
      mockAudioContext.createOscillator.mockReturnValueOnce(osc)

      playTaikoDrum(mockAudioContext)

      expect(osc.connect).toHaveBeenCalledWith(mockGain)
      expect(mockGain.connect).toHaveBeenCalledWith(mockAudioContext.destination)
    })

    it('should use sine waveform', () => {
      const osc = { ...mockOscillator, type: 'sine' }
      mockAudioContext.createOscillator.mockReturnValueOnce(osc)

      playTaikoDrum(mockAudioContext)

      expect(osc.type).toBe('sine')
    })

    it('should apply pitch-bend downward from 150 Hz to 60 Hz', () => {
      playTaikoDrum(mockAudioContext)

      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(150, 0)
      expect(mockOscillator.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(60, 0.08)
    })

    it('should set up gain envelope', () => {
      playTaikoDrum(mockAudioContext)

      expect(mockGain.gain.setValueAtTime).toHaveBeenCalled()
      expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalled()
    })

    it('should start and stop oscillator', () => {
      const osc = { ...mockOscillator }
      mockAudioContext.createOscillator.mockReturnValueOnce(osc)

      playTaikoDrum(mockAudioContext)

      expect(osc.start).toHaveBeenCalledWith(0)
      expect(osc.stop).toHaveBeenCalledWith(0.3)
    })

    it('should use custom options when provided', () => {
      const osc = { ...mockOscillator }
      mockAudioContext.createOscillator.mockReturnValueOnce(osc)

      playTaikoDrum(mockAudioContext, { volume: 0.5, duration: 0.6, startTime: 2.0 })

      expect(osc.start).toHaveBeenCalledWith(2.0)
      expect(osc.stop).toHaveBeenCalledWith(2.6)
    })
  })

  // ─── playWindChime ────────────────────────────────────────────────────────

  describe('playWindChime', () => {
    it('should create 2 oscillators for detuned pair', () => {
      playWindChime(mockAudioContext, 880)

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(2)
      expect(mockAudioContext.createGain).toHaveBeenCalledTimes(2)
    })

    it('should connect each oscillator to gain and destination', () => {
      const osc = { ...mockOscillator }
      mockAudioContext.createOscillator.mockReturnValue(osc)

      playWindChime(mockAudioContext, 880)

      expect(osc.connect).toHaveBeenCalledWith(mockGain)
      expect(mockGain.connect).toHaveBeenCalledWith(mockAudioContext.destination)
    })

    it('should use sine waveform', () => {
      const oscillators: any[] = []
      mockAudioContext.createOscillator.mockImplementation(() => {
        const osc = { ...mockOscillator, type: 'sine' }
        oscillators.push(osc)
        return osc
      })

      playWindChime(mockAudioContext, 880)

      oscillators.forEach(osc => expect(osc.type).toBe('sine'))
    })

    it('should set frequency and opposite detune values (±6 cents)', () => {
      const oscillators: any[] = []
      mockAudioContext.createOscillator.mockImplementation(() => {
        const osc = { ...mockOscillator, detune: { value: 0 } }
        oscillators.push(osc)
        return osc
      })

      playWindChime(mockAudioContext, 880)

      expect(oscillators[0].frequency.value).toBe(880)
      expect(oscillators[0].detune.value).toBe(-6)
      expect(oscillators[1].frequency.value).toBe(880)
      expect(oscillators[1].detune.value).toBe(6)
    })

    it('should set up gain envelope', () => {
      playWindChime(mockAudioContext, 880)

      expect(mockGain.gain.setValueAtTime).toHaveBeenCalled()
      expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalled()
    })

    it('should start and stop both oscillators', () => {
      const osc = { ...mockOscillator }
      mockAudioContext.createOscillator.mockReturnValue(osc)

      playWindChime(mockAudioContext, 880)

      expect(osc.start).toHaveBeenCalledTimes(2)
      expect(osc.stop).toHaveBeenCalledTimes(2)
    })

    it('should use default options when not specified', () => {
      const osc = { ...mockOscillator }
      mockAudioContext.createOscillator.mockReturnValue(osc)

      playWindChime(mockAudioContext, 880)

      expect(osc.start).toHaveBeenCalledWith(0)
      expect(osc.stop).toHaveBeenCalledWith(0.5)
    })

    it('should use custom options when provided', () => {
      const osc = { ...mockOscillator }
      mockAudioContext.createOscillator.mockReturnValue(osc)

      playWindChime(mockAudioContext, 880, { volume: 0.1, duration: 0.8, startTime: 1.0 })

      expect(osc.start).toHaveBeenCalledWith(1.0)
      expect(osc.stop).toHaveBeenCalledWith(1.8)
    })
  })
})
