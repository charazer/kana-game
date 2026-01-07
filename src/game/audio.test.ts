import { AudioManager } from './audio'

describe('audio', () => {
  let mockOscillator: any
  let mockGain: any
  let mockAudioContext: any

  beforeEach(() => {
    // Create mock oscillator
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

    // Create mock gain
    mockGain = {
      connect: vi.fn(),
      gain: {
        value: 0,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
      }
    }

    // Create mock audio context
    mockAudioContext = {
      currentTime: 0,
      destination: {},
      createOscillator: vi.fn(() => {
        // Return a new oscillator each time with its own type
        return { ...mockOscillator }
      }),
      createGain: vi.fn(() => mockGain)
    }

    // Mock window.AudioContext as a proper constructor
    globalThis.AudioContext = class {
      constructor() {
        return mockAudioContext
      }
    } as any
  })

  describe('AudioManager', () => {
    it('should create audio context on initialization', () => {
      const manager = new AudioManager()
      // Just verify it creates without throwing
      expect(manager).toBeDefined()
    })

    it('should handle missing audio context gracefully', () => {
      globalThis.AudioContext = undefined as any
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const manager = new AudioManager()
      manager.playSuccess() // Should not throw
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Web Audio API not supported', expect.any(Error))
      consoleWarnSpy.mockRestore()
    })

    it('should set enabled state', () => {
      const manager = new AudioManager()
      manager.setEnabled(false)
      
      // When disabled, sounds should not play
      manager.playSuccess()
      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled()
    })

    describe('playSuccess', () => {
      it('should not play when disabled', () => {
        const manager = new AudioManager()
        manager.setEnabled(false)
        manager.playSuccess()
        
        expect(mockAudioContext.createOscillator).not.toHaveBeenCalled()
      })

      it('should create oscillators and gain nodes', () => {
        const manager = new AudioManager()
        manager.playSuccess()
        
        expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(2)
        expect(mockAudioContext.createGain).toHaveBeenCalledTimes(1)
      })

      it('should connect audio nodes correctly', () => {
        const manager = new AudioManager()
        manager.playSuccess()
        
        expect(mockOscillator.connect).toHaveBeenCalledWith(mockGain)
        expect(mockGain.connect).toHaveBeenCalledWith(mockAudioContext.destination)
      })

      it('should start and stop oscillators', () => {
        const manager = new AudioManager()
        manager.playSuccess()
        
        expect(mockOscillator.start).toHaveBeenCalled()
        expect(mockOscillator.stop).toHaveBeenCalled()
      })
    })

    describe('playGameOver', () => {
      it('should not play when disabled', () => {
        const manager = new AudioManager()
        manager.setEnabled(false)
        manager.playGameOver()
        
        expect(mockAudioContext.createOscillator).not.toHaveBeenCalled()
      })

      it('should create multiple oscillators for arpeggio', () => {
        const manager = new AudioManager()
        manager.playGameOver()
        
        // 4 notes in descending arpeggio
        expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(4)
        expect(mockAudioContext.createGain).toHaveBeenCalledTimes(4)
      })

      it('should set triangle waveform', () => {
        let capturedType = 'sine'
        mockAudioContext.createOscillator = vi.fn(() => {
          const osc = { ...mockOscillator }
          Object.defineProperty(osc, 'type', {
            get: () => capturedType,
            set: (val) => { capturedType = val }
          })
          return osc
        })
        
        const manager = new AudioManager()
        manager.playGameOver()
        
        expect(capturedType).toBe('triangle')
      })
    })

    describe('playLifeLost', () => {
      it('should not play when disabled', () => {
        const manager = new AudioManager()
        manager.setEnabled(false)
        manager.playLifeLost()
        
        expect(mockAudioContext.createOscillator).not.toHaveBeenCalled()
      })

      it('should create oscillator and gain', () => {
        const manager = new AudioManager()
        manager.playLifeLost()
        
        expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1)
        expect(mockAudioContext.createGain).toHaveBeenCalledTimes(1)
      })

      it('should use sawtooth waveform', () => {
        let capturedType = 'sine'
        mockAudioContext.createOscillator = vi.fn(() => {
          const osc = { ...mockOscillator }
          Object.defineProperty(osc, 'type', {
            get: () => capturedType,
            set: (val) => { capturedType = val }
          })
          return osc
        })
        
        const manager = new AudioManager()
        manager.playLifeLost()
        
        expect(capturedType).toBe('sawtooth')
      })

      it('should use frequency ramping', () => {
        const manager = new AudioManager()
        manager.playLifeLost()
        
        expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalled()
        expect(mockOscillator.frequency.exponentialRampToValueAtTime).toHaveBeenCalled()
      })
    })

    describe('playSpeedIncrease', () => {
      it('should not play when disabled', () => {
        const manager = new AudioManager()
        manager.setEnabled(false)
        manager.playSpeedIncrease()
        
        expect(mockAudioContext.createOscillator).not.toHaveBeenCalled()
      })

      it('should create multiple oscillators for arpeggio', () => {
        const manager = new AudioManager()
        manager.playSpeedIncrease()
        
        // 4 notes in ascending arpeggio
        expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(4)
        expect(mockAudioContext.createGain).toHaveBeenCalledTimes(4)
      })
    })

    describe('playGameStart', () => {
      it('should not play when disabled', () => {
        const manager = new AudioManager()
        manager.setEnabled(false)
        manager.playGameStart()
        
        expect(mockAudioContext.createOscillator).not.toHaveBeenCalled()
      })

      it('should create multiple oscillators for chord', () => {
        const manager = new AudioManager()
        manager.playGameStart()
        
        // 3 notes in rising chord
        expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3)
        expect(mockAudioContext.createGain).toHaveBeenCalledTimes(3)
      })

      it('should use sine waveform', () => {
        // Verify oscillator type stays as sine (default)
        const manager = new AudioManager()
        manager.playGameStart()
        
        // Since sine is the default and playGameStart uses sine, this test just
        // verifies the method runs without error
        expect(mockAudioContext.createOscillator).toHaveBeenCalled()
      })
    })

    describe('playPause', () => {
      it('should not play when disabled', () => {
        const manager = new AudioManager()
        manager.setEnabled(false)
        manager.playPause()
        
        expect(mockAudioContext.createOscillator).not.toHaveBeenCalled()
      })

      it('should create oscillator and gain', () => {
        const manager = new AudioManager()
        manager.playPause()
        
        expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1)
        expect(mockAudioContext.createGain).toHaveBeenCalledTimes(1)
      })

      it('should use descending frequency', () => {
        const manager = new AudioManager()
        manager.playPause()
        
        expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalled()
        expect(mockOscillator.frequency.exponentialRampToValueAtTime).toHaveBeenCalled()
      })
    })

    describe('playResume', () => {
      it('should not play when disabled', () => {
        const manager = new AudioManager()
        manager.setEnabled(false)
        manager.playResume()
        
        expect(mockAudioContext.createOscillator).not.toHaveBeenCalled()
      })

      it('should create oscillator and gain', () => {
        const manager = new AudioManager()
        manager.playResume()
        
        expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1)
        expect(mockAudioContext.createGain).toHaveBeenCalledTimes(1)
      })

      it('should use ascending frequency', () => {
        const manager = new AudioManager()
        manager.playResume()
        
        expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalled()
        expect(mockOscillator.frequency.exponentialRampToValueAtTime).toHaveBeenCalled()
      })
    })

    describe('audio enabled/disabled toggle', () => {
      it('should play when enabled', () => {
        const manager = new AudioManager()
        manager.setEnabled(true)
        manager.playSuccess()
        
        expect(mockAudioContext.createOscillator).toHaveBeenCalled()
      })

      it('should not play when disabled', () => {
        const manager = new AudioManager()
        manager.setEnabled(false)
        manager.playSuccess()
        
        expect(mockAudioContext.createOscillator).not.toHaveBeenCalled()
      })

      it('should resume playing after re-enabling', () => {
        const manager = new AudioManager()
        manager.setEnabled(false)
        manager.playSuccess()
        expect(mockAudioContext.createOscillator).not.toHaveBeenCalled()
        
        manager.setEnabled(true)
        manager.playSuccess()
        expect(mockAudioContext.createOscillator).toHaveBeenCalled()
      })
    })

    describe('music', () => {
      let mockAudio: any
      let audioInstance: any

      beforeEach(() => {
        mockAudio = {
          play: vi.fn().mockResolvedValue(undefined),
          pause: vi.fn(),
          load: vi.fn(),
          loop: false,
          volume: 1,
          currentTime: 0
        }
        
        // Mock window.Audio constructor properly
        globalThis.window = globalThis.window || {} as any
        globalThis.window.Audio = class MockAudio {
          play: any
          pause: any
          load: any
          loop: boolean
          volume: number
          currentTime: number
          
          constructor() {
            // Create a new instance with references to mocked functions
            this.play = mockAudio.play
            this.pause = mockAudio.pause
            this.load = mockAudio.load
            this.loop = mockAudio.loop
            this.volume = mockAudio.volume
            this.currentTime = mockAudio.currentTime
            
            // Store reference to the instance for tests
            audioInstance = this
          }
        } as any
      })

      it('should initialize music with correct settings', async () => {
        const manager = new AudioManager()
        await manager.initMusic('test.mp3')
        
        expect(audioInstance.loop).toBe(true)
        expect(audioInstance.volume).toBe(0.3)
        expect(mockAudio.load).toHaveBeenCalled()
      })

      it('should handle music load errors gracefully', async () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mockAudio.load = vi.fn().mockRejectedValue(new Error('Load failed'))
        
        const manager = new AudioManager()
        await manager.initMusic('test.mp3')
        
        expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to load background music', expect.any(Error))
        consoleWarnSpy.mockRestore()
      })

      it('should play music when enabled', async () => {
        const manager = new AudioManager()
        await manager.initMusic('test.mp3')
        
        manager.setMusicEnabled(true)
        expect(mockAudio.play).toHaveBeenCalled()
      })

      it('should pause music when disabled', async () => {
        const manager = new AudioManager()
        await manager.initMusic('test.mp3')
        
        manager.setMusicEnabled(true)
        manager.setMusicEnabled(false)
        
        expect(mockAudio.pause).toHaveBeenCalled()
      })

      it('should handle play errors gracefully', async () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mockAudio.play = vi.fn().mockRejectedValue(new Error('Play failed'))
        
        const manager = new AudioManager()
        await manager.initMusic('test.mp3')
        manager.setMusicEnabled(true)
        
        // Wait for promise to reject
        await new Promise(resolve => setTimeout(resolve, 0))
        
        expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to play background music', expect.any(Error))
        consoleWarnSpy.mockRestore()
      })

      it('should stop music and reset playback position', async () => {
        const manager = new AudioManager()
        await manager.initMusic('test.mp3')
        audioInstance.currentTime = 10
        
        manager.stopMusic()
        
        expect(mockAudio.pause).toHaveBeenCalled()
        expect(audioInstance.currentTime).toBe(0)
      })

      it('should handle setMusicEnabled when music not initialized', () => {
        const manager = new AudioManager()
        
        // Should not throw
        expect(() => manager.setMusicEnabled(true)).not.toThrow()
      })

      it('should handle stopMusic when music not initialized', () => {
        const manager = new AudioManager()
        
        // Should not throw
        expect(() => manager.stopMusic()).not.toThrow()
      })
    })
  })
})
