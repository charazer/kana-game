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

  describe('bindElement — mobile input support', () => {
    let inputEl: HTMLInputElement

    beforeEach(() => {
      inputEl = document.createElement('input')
      inputEl.type = 'text'
      document.body.appendChild(inputEl)
    })

    function triggerInputEvent() {
      inputEl.dispatchEvent(new Event('input', { bubbles: true }))
    }

    it('should process characters from the bound input element', () => {
      inputManager.bindElement(inputEl)
      inputEl.value = 'k'
      triggerInputEvent()

      expect(inputManager.buffer).toBe('k')
      expect(mockOnKey).toHaveBeenCalledWith('k')
      expect(mockOnCommit).toHaveBeenCalledWith('k')
    })

    it('should accumulate characters via input events', () => {
      inputManager.bindElement(inputEl)
      inputEl.value = 's'
      triggerInputEvent()
      inputEl.value = 'sh'
      triggerInputEvent()
      inputEl.value = 'shi'
      triggerInputEvent()

      expect(inputManager.buffer).toBe('shi')
      expect(mockOnCommit).toHaveBeenCalledTimes(3)
    })

    it('should filter invalid characters from input element', () => {
      inputManager.bindElement(inputEl)
      inputEl.value = 'k1a2!'
      triggerInputEvent()

      expect(inputManager.buffer).toBe('ka')
      expect(inputEl.value).toBe('ka')
    })

    it('should filter l, q, v, x from input element', () => {
      inputManager.bindElement(inputEl)
      inputEl.value = 'klqvxa'
      triggerInputEvent()

      expect(inputManager.buffer).toBe('ka')
      expect(inputEl.value).toBe('ka')
    })

    it('should handle backspace via input element (shorter value)', () => {
      inputManager.bindElement(inputEl)
      inputEl.value = 'ka'
      triggerInputEvent()
      mockOnKey.mockClear()
      mockOnCommit.mockClear()

      inputEl.value = 'k'
      triggerInputEvent()

      expect(inputManager.buffer).toBe('k')
      expect(mockOnKey).toHaveBeenCalledWith('k')
      // onCommit should NOT be called when deleting
      expect(mockOnCommit).not.toHaveBeenCalled()
    })

    it('should clear element value when disabled', () => {
      inputManager.bindElement(inputEl)
      inputManager.enabled = false

      inputEl.value = 'abc'
      triggerInputEvent()

      expect(inputEl.value).toBe('')
      expect(inputManager.buffer).toBe('')
      expect(mockOnKey).not.toHaveBeenCalled()
    })

    it('should sync buffer setter to element value', () => {
      inputManager.bindElement(inputEl)
      inputManager.buffer = 'test'

      expect(inputEl.value).toBe('test')
    })

    it('should clear element value when buffer set to empty', () => {
      inputManager.bindElement(inputEl)
      inputManager.buffer = 'ka'
      expect(inputEl.value).toBe('ka')

      inputManager.buffer = ''
      expect(inputEl.value).toBe('')
    })

    it('should skip keydown processing when input element is focused', () => {
      inputManager.bindElement(inputEl)
      inputEl.focus()

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))

      // keydown handler should skip — buffer remains empty
      expect(inputManager.buffer).toBe('')
      expect(mockOnKey).not.toHaveBeenCalled()
    })

    it('should process keydown when input element is NOT focused', () => {
      inputManager.bindElement(inputEl)
      inputEl.blur()

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))

      expect(inputManager.buffer).toBe('a')
      expect(mockOnKey).toHaveBeenCalledWith('a')
    })

    it('should accept kana characters via input element', () => {
      inputManager.bindElement(inputEl)
      inputEl.value = 'か'
      triggerInputEvent()

      expect(inputManager.buffer).toBe('か')
      expect(mockOnCommit).toHaveBeenCalledWith('か')
    })

    it('should convert uppercase to lowercase via input element', () => {
      inputManager.bindElement(inputEl)
      inputEl.value = 'KA'
      triggerInputEvent()

      expect(inputManager.buffer).toBe('ka')
      expect(inputEl.value).toBe('ka')
    })

    it('should not call onCommit when input element value is empty after clear', () => {
      inputManager.bindElement(inputEl)
      inputEl.value = 'a'
      triggerInputEvent()
      mockOnCommit.mockClear()

      inputEl.value = ''
      triggerInputEvent()

      expect(mockOnCommit).not.toHaveBeenCalled()
    })
  })

  describe('enabled auto-focus on touch devices', () => {
    let inputEl: HTMLInputElement

    beforeEach(() => {
      inputEl = document.createElement('input')
      inputEl.type = 'text'
      document.body.appendChild(inputEl)
    })

    it('should focus element when enabled on touch device', () => {
      // Simulate touch device
      Object.defineProperty(navigator, 'maxTouchPoints', { value: 1, configurable: true })
      inputManager.bindElement(inputEl)

      const focusSpy = vi.spyOn(inputEl, 'focus')
      inputManager.enabled = true

      expect(focusSpy).toHaveBeenCalled()
      Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true })
    })

    it('should blur element when disabled on touch device', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', { value: 1, configurable: true })
      inputManager.bindElement(inputEl)
      inputManager.enabled = true

      const blurSpy = vi.spyOn(inputEl, 'blur')
      inputManager.enabled = false

      expect(blurSpy).toHaveBeenCalled()
      Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true })
    })

    it('should not auto-focus on non-touch device', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true })

      // Ensure ontouchstart is not defined
      const originalOntouchstart = (window as any).ontouchstart
      delete (window as any).ontouchstart

      inputManager.bindElement(inputEl)
      const focusSpy = vi.spyOn(inputEl, 'focus')
      inputManager.enabled = true

      expect(focusSpy).not.toHaveBeenCalled();

      // Restore
      (window as any).ontouchstart = originalOntouchstart
    })

    it('should re-focus after blur during active gameplay on touch device', async () => {
      vi.useFakeTimers()
      Object.defineProperty(navigator, 'maxTouchPoints', { value: 1, configurable: true })
      inputManager.bindElement(inputEl)
      inputManager.enabled = true

      // Simulate blur
      inputEl.dispatchEvent(new Event('blur'))
      vi.advanceTimersByTime(20)

      // The element should be re-focused
      expect(document.activeElement).toBe(inputEl)

      Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true })
      vi.useRealTimers()
    })

    it('should NOT re-focus after blur when disabled', () => {
      vi.useFakeTimers()
      Object.defineProperty(navigator, 'maxTouchPoints', { value: 1, configurable: true })
      inputManager.bindElement(inputEl)
      inputManager.enabled = true
      inputManager.enabled = false

      inputEl.dispatchEvent(new Event('blur'))
      vi.advanceTimersByTime(20)

      // Should not re-focus because enabled is false
      expect(document.activeElement).not.toBe(inputEl)

      Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true })
      vi.useRealTimers()
    })
  })
})
