import { enableElement, disableElement, enableElements, disableElements, setupModalHandlers } from './dom-helpers'

describe('dom-helpers', () => {
  describe('enableElement', () => {
    it('should enable a disabled button', () => {
      const btn = document.createElement('button')
      btn.disabled = true
      btn.style.opacity = '0.5'
      btn.style.cursor = 'not-allowed'

      enableElement(btn)

      expect(btn.disabled).toBe(false)
      expect(btn.style.opacity).toBe('1')
      expect(btn.style.cursor).toBe('pointer')
    })

    it('should enable a disabled input', () => {
      const input = document.createElement('input')
      input.disabled = true

      enableElement(input)

      expect(input.disabled).toBe(false)
      expect(input.style.opacity).toBe('1')
      expect(input.style.cursor).toBe('pointer')
    })

    it('should enable a disabled select', () => {
      const select = document.createElement('select')
      select.disabled = true

      enableElement(select)

      expect(select.disabled).toBe(false)
      expect(select.style.opacity).toBe('1')
    })

    it('should handle null without throwing', () => {
      expect(() => enableElement(null)).not.toThrow()
    })
  })

  describe('disableElement', () => {
    it('should disable an enabled button', () => {
      const btn = document.createElement('button')

      disableElement(btn)

      expect(btn.disabled).toBe(true)
      expect(btn.style.opacity).toBe('0.5')
      expect(btn.style.cursor).toBe('not-allowed')
    })

    it('should disable an enabled input', () => {
      const input = document.createElement('input')

      disableElement(input)

      expect(input.disabled).toBe(true)
      expect(input.style.opacity).toBe('0.5')
      expect(input.style.cursor).toBe('not-allowed')
    })

    it('should disable an enabled select', () => {
      const select = document.createElement('select')

      disableElement(select)

      expect(select.disabled).toBe(true)
    })

    it('should handle null without throwing', () => {
      expect(() => disableElement(null)).not.toThrow()
    })
  })

  describe('enableElements', () => {
    it('should enable multiple elements', () => {
      const btn1 = document.createElement('button')
      const btn2 = document.createElement('button')
      const select = document.createElement('select')
      btn1.disabled = true
      btn2.disabled = true
      select.disabled = true

      enableElements(btn1, btn2, select)

      expect(btn1.disabled).toBe(false)
      expect(btn2.disabled).toBe(false)
      expect(select.disabled).toBe(false)
    })

    it('should handle nulls mixed with valid elements', () => {
      const btn = document.createElement('button')
      btn.disabled = true

      expect(() => enableElements(btn, null, null)).not.toThrow()
      expect(btn.disabled).toBe(false)
    })

    it('should handle all nulls', () => {
      expect(() => enableElements(null, null)).not.toThrow()
    })
  })

  describe('disableElements', () => {
    it('should disable multiple elements', () => {
      const btn1 = document.createElement('button')
      const btn2 = document.createElement('button')
      const input = document.createElement('input')

      disableElements(btn1, btn2, input)

      expect(btn1.disabled).toBe(true)
      expect(btn2.disabled).toBe(true)
      expect(input.disabled).toBe(true)
    })

    it('should handle nulls mixed with valid elements', () => {
      const btn = document.createElement('button')

      expect(() => disableElements(null, btn)).not.toThrow()
      expect(btn.disabled).toBe(true)
    })
  })

  describe('setupModalHandlers', () => {
    let modal: HTMLElement
    let closeButton: HTMLButtonElement
    let overlay: HTMLElement
    let onClose: ReturnType<typeof vi.fn>

    beforeEach(() => {
      modal = document.createElement('div')
      closeButton = document.createElement('button')
      overlay = document.createElement('div')
      onClose = vi.fn()
    })

    it('should close the modal and call onClose when close button is clicked', () => {
      setupModalHandlers(modal, { closeButton, overlay, onClose })

      closeButton.click()

      expect(modal.classList.contains('hidden')).toBe(true)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should close the modal and call onClose when overlay is clicked', () => {
      setupModalHandlers(modal, { closeButton, overlay, onClose })

      overlay.click()

      expect(modal.classList.contains('hidden')).toBe(true)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should work without an onClose callback', () => {
      setupModalHandlers(modal, { closeButton, overlay })

      expect(() => closeButton.click()).not.toThrow()
      expect(modal.classList.contains('hidden')).toBe(true)
    })

    it('should work without a close button', () => {
      setupModalHandlers(modal, { overlay, onClose })

      overlay.click()

      expect(modal.classList.contains('hidden')).toBe(true)
      expect(onClose).toHaveBeenCalled()
    })

    it('should work without an overlay', () => {
      setupModalHandlers(modal, { closeButton, onClose })

      closeButton.click()

      expect(modal.classList.contains('hidden')).toBe(true)
      expect(onClose).toHaveBeenCalled()
    })

    it('should work with no options provided', () => {
      expect(() => setupModalHandlers(modal, {})).not.toThrow()
    })

    it('should call onClose once per click, not multiple times', () => {
      setupModalHandlers(modal, { closeButton, onClose })

      closeButton.click()
      closeButton.click()

      expect(onClose).toHaveBeenCalledTimes(2)
    })
  })
})
