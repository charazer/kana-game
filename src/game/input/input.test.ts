import { InputManager } from './input'

describe('input', () => {
  let inputManager: InputManager
  let mockOnKey: ReturnType<typeof vi.fn>
  let mockOnCommit: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Clear any existing event listeners
    document.body.innerHTML = ''
    
    inputManager = new InputManager()
    mockOnKey = vi.fn()
    mockOnCommit = vi.fn()
    inputManager.onKey = mockOnKey as any
    inputManager.onCommit = mockOnCommit as any
    // Enable input by default so existing tests work
    inputManager.enabled = true
  })

  describe('InputManager', () => {
    it('should initialize with empty buffer', () => {
      expect(inputManager.buffer).toBe('')
    })

    it('should handle lowercase letter input', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' })
      window.dispatchEvent(event)
      
      expect(inputManager.buffer).toBe('a')
      expect(mockOnKey).toHaveBeenCalledWith('a')
      expect(mockOnCommit).toHaveBeenCalledWith('a')
    })

    it('should handle uppercase letter input and convert to lowercase', () => {
      const event = new KeyboardEvent('keydown', { key: 'A' })
      window.dispatchEvent(event)
      
      expect(inputManager.buffer).toBe('a')
      expect(mockOnKey).toHaveBeenCalledWith('a')
    })

    it('should accumulate multiple characters', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
      
      expect(inputManager.buffer).toBe('ka')
      expect(mockOnKey).toHaveBeenCalledTimes(2)
      expect(mockOnKey).toHaveBeenLastCalledWith('ka')
    })

    it('should handle backspace to delete last character', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }))
      
      expect(inputManager.buffer).toBe('k')
      expect(mockOnKey).toHaveBeenLastCalledWith('k')
    })

    it('should handle backspace on empty buffer', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }))
      
      expect(inputManager.buffer).toBe('')
      expect(mockOnKey).toHaveBeenCalledWith('')
    })

    it('should ignore ctrl key combinations', () => {
      const event = new KeyboardEvent('keydown', { key: 'c', ctrlKey: true })
      window.dispatchEvent(event)
      
      expect(inputManager.buffer).toBe('')
      expect(mockOnKey).not.toHaveBeenCalled()
    })

    it('should ignore meta key combinations', () => {
      const event = new KeyboardEvent('keydown', { key: 'v', metaKey: true })
      window.dispatchEvent(event)
      
      expect(inputManager.buffer).toBe('')
      expect(mockOnKey).not.toHaveBeenCalled()
    })

    it('should ignore multi-character keys like Enter', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      window.dispatchEvent(event)
      
      expect(inputManager.buffer).toBe('')
      expect(mockOnKey).not.toHaveBeenCalled()
    })

    it('should ignore multi-character keys like Escape', () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      window.dispatchEvent(event)
      
      expect(inputManager.buffer).toBe('')
      expect(mockOnKey).not.toHaveBeenCalled()
    })

    it('should call onCommit after each keystroke', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }))
      expect(mockOnCommit).toHaveBeenCalledWith('s')
      
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' }))
      expect(mockOnCommit).toHaveBeenCalledWith('sh')
      
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'i' }))
      expect(mockOnCommit).toHaveBeenCalledWith('shi')
      
      expect(mockOnCommit).toHaveBeenCalledTimes(3)
    })

    it('should not call onCommit for backspace', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
      mockOnCommit.mockClear()
      
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }))
      
      expect(mockOnCommit).not.toHaveBeenCalled()
      expect(mockOnKey).toHaveBeenCalledWith('')
    })

    it('should handle rapid input sequence', () => {
      const keys = ['s', 'h', 'i', 'k', 'a']
      keys.forEach(key => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key }))
      })
      
      expect(inputManager.buffer).toBe('shika')
      expect(mockOnKey).toHaveBeenCalledTimes(5)
      expect(mockOnCommit).toHaveBeenCalledTimes(5)
    })

    it('should allow buffer manipulation directly', () => {
      inputManager.buffer = 'test'
      expect(inputManager.buffer).toBe('test')
      
      inputManager.buffer = ''
      expect(inputManager.buffer).toBe('')
    })

    it('should ignore numbers (not valid romaji)', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }))
      
      expect(inputManager.buffer).toBe('')
      expect(mockOnKey).not.toHaveBeenCalled()
      expect(mockOnCommit).not.toHaveBeenCalled()
    })

    it('should ignore special characters (not valid romaji)', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '-' }))
      
      expect(inputManager.buffer).toBe('')
      expect(mockOnKey).not.toHaveBeenCalled()
    })

    it('should ignore letters not used in any romaji (l, q, v, x)', () => {
      for (const key of ['l', 'q', 'v', 'x']) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key }))
      }
      expect(inputManager.buffer).toBe('')
      expect(mockOnKey).not.toHaveBeenCalled()
    })

    it('should accept all valid romaji characters', () => {
      for (const key of 'abcdefghijkmnoprstuwyz') {
        inputManager.buffer = ''
        mockOnKey.mockClear()
        window.dispatchEvent(new KeyboardEvent('keydown', { key }))
        expect(inputManager.buffer).toBe(key)
        expect(mockOnKey).toHaveBeenCalledWith(key)
      }
    })

    it('should accept kana characters for IME input', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'か' }))
      
      expect(inputManager.buffer).toBe('か')
      expect(mockOnKey).toHaveBeenCalledWith('か')
      expect(mockOnCommit).toHaveBeenCalledWith('か')
    })

    it('should prevent default behavior on backspace', () => {
      const event = new KeyboardEvent('keydown', { key: 'Backspace' })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      
      window.dispatchEvent(event)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should initialize with enabled set to false', () => {
      const freshManager = new InputManager()
      expect(freshManager.enabled).toBe(false)
    })

    it('should ignore all keydown events when disabled', () => {
      inputManager.enabled = false
      
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }))
      
      expect(inputManager.buffer).toBe('')
      expect(mockOnKey).not.toHaveBeenCalled()
      expect(mockOnCommit).not.toHaveBeenCalled()
    })

    it('should accept input again after being re-enabled', () => {
      inputManager.enabled = false
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
      expect(inputManager.buffer).toBe('')
      
      inputManager.enabled = true
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }))
      expect(inputManager.buffer).toBe('b')
      expect(mockOnKey).toHaveBeenCalledWith('b')
    })
  })
})
