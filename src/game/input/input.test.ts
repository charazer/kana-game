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

    it('should handle numbers as valid input', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }))
      
      expect(inputManager.buffer).toBe('1')
      expect(mockOnKey).toHaveBeenCalledWith('1')
    })

    it('should handle special characters as valid input', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '-' }))
      
      expect(inputManager.buffer).toBe('-')
      expect(mockOnKey).toHaveBeenCalledWith('-')
    })

    it('should prevent default behavior on backspace', () => {
      const event = new KeyboardEvent('keydown', { key: 'Backspace' })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      
      window.dispatchEvent(event)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })
})
