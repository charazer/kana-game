import { DOMRenderer } from './renderer_dom'
import {
  DATASET_KANA_ID
} from '../constants/constants'

describe('renderer_dom', () => {
  let container: HTMLElement
  let renderer: DOMRenderer

  beforeEach(() => {
    // Create a fresh container for each test
    container = document.createElement('div')
    container.id = 'test-container'
    container.style.width = '800px'
    container.style.height = '600px'
    document.body.appendChild(container)
    
    renderer = new DOMRenderer(container)
    
    vi.useFakeTimers()
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('DOMRenderer initialization', () => {
    it('should initialize with container', () => {
      expect(renderer.container).toBe(container)
    })

    it('should have empty container initially', () => {
      expect(container.children.length).toBe(0)
    })
  })

  describe('createTokenEl', () => {
    it('should create a token element with correct class', () => {
      const el = renderer.createTokenEl('a', 'あ')
      
      expect(el).toBeInstanceOf(HTMLElement)
      expect(el.className).toBe('token')
      expect(el.textContent).toBe('あ')
    })

    it('should set kana id in dataset', () => {
      const el = renderer.createTokenEl('ka', 'か')
      
      expect(el.dataset[DATASET_KANA_ID]).toBe('ka')
    })

    it('should append element to container', () => {
      renderer.createTokenEl('a', 'あ')
      
      expect(container.children.length).toBe(1)
      expect(container.firstChild).toBeInstanceOf(HTMLElement)
    })

    it('should initialize position custom properties', () => {
      const el = renderer.createTokenEl('a', 'あ')
      
      expect(el.style.getPropertyValue('--tx')).toBe('0px')
      expect(el.style.getPropertyValue('--ty')).toBe('0px')
    })

    it('should create multiple tokens', () => {
      renderer.createTokenEl('a', 'あ')
      renderer.createTokenEl('ka', 'か')
      renderer.createTokenEl('sa', 'さ')
      
      expect(container.children.length).toBe(3)
    })
  })

  describe('removeTokenEl', () => {
    it('should remove token element from DOM', () => {
      const el = renderer.createTokenEl('a', 'あ')
      expect(container.children.length).toBe(1)
      
      renderer.removeTokenEl(el)
      
      expect(container.children.length).toBe(0)
    })

    it('should handle removing already removed element', () => {
      const el = renderer.createTokenEl('a', 'あ')
      renderer.removeTokenEl(el)
      
      // Should not throw
      expect(() => renderer.removeTokenEl(el)).not.toThrow()
    })
  })

  describe('setTokenPosition', () => {
    it('should set transform style', () => {
      const el = renderer.createTokenEl('a', 'あ')
      
      renderer.setTokenPosition(el, 100, 200)
      
      expect(el.style.transform).toBe('translate3d(100px, 200px, 0)')
    })

    it('should update CSS custom properties', () => {
      const el = renderer.createTokenEl('a', 'あ')
      
      renderer.setTokenPosition(el, 150, 250)
      
      expect(el.style.getPropertyValue('--tx')).toBe('150px')
      expect(el.style.getPropertyValue('--ty')).toBe('250px')
    })

    it('should handle negative positions', () => {
      const el = renderer.createTokenEl('a', 'あ')
      
      renderer.setTokenPosition(el, -50, -100)
      
      expect(el.style.transform).toBe('translate3d(-50px, -100px, 0)')
      expect(el.style.getPropertyValue('--tx')).toBe('-50px')
      expect(el.style.getPropertyValue('--ty')).toBe('-100px')
    })

    it('should handle zero positions', () => {
      const el = renderer.createTokenEl('a', 'あ')
      
      renderer.setTokenPosition(el, 0, 0)
      
      expect(el.style.transform).toBe('translate3d(0px, 0px, 0)')
    })

    it('should update position multiple times', () => {
      const el = renderer.createTokenEl('a', 'あ')
      
      renderer.setTokenPosition(el, 10, 20)
      expect(el.style.transform).toBe('translate3d(10px, 20px, 0)')
      
      renderer.setTokenPosition(el, 50, 100)
      expect(el.style.transform).toBe('translate3d(50px, 100px, 0)')
      
      renderer.setTokenPosition(el, 200, 300)
      expect(el.style.transform).toBe('translate3d(200px, 300px, 0)')
    })
  })

  describe('flashToken', () => {
    it('should add success class for successful match', () => {
      const el = renderer.createTokenEl('a', 'あ')
      
      renderer.flashToken(el, true)
      
      expect(el.classList.contains('token-success')).toBe(true)
    })

    it('should add miss class for failed match', () => {
      const el = renderer.createTokenEl('a', 'あ')
      
      renderer.flashToken(el, false)
      
      expect(el.classList.contains('token-miss')).toBe(true)
    })

    it('should attach animationend event listener for success', () => {
      const el = renderer.createTokenEl('a', 'あ')
      const addEventListenerSpy = vi.spyOn(el, 'addEventListener')
      
      renderer.flashToken(el, true)
      
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'animationend',
        expect.any(Function),
        { once: true }
      )
    })

    it('should attach animationend event listener for miss', () => {
      const el = renderer.createTokenEl('a', 'あ')
      const addEventListenerSpy = vi.spyOn(el, 'addEventListener')
      
      renderer.flashToken(el, false)
      
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'animationend',
        expect.any(Function),
        { once: true }
      )
    })

    it('should remove element on animationend', () => {
      const el = renderer.createTokenEl('a', 'あ')
      
      renderer.flashToken(el, true)
      
      // Manually trigger animationend
      const event = new Event('animationend')
      el.dispatchEvent(event)
      
      expect(container.contains(el)).toBe(false)
    })

    it('should use once:true option for event listener', () => {
      const el = renderer.createTokenEl('a', 'あ')
      
      renderer.flashToken(el, true)
      
      // First animationend should remove
      el.dispatchEvent(new Event('animationend'))
      expect(container.contains(el)).toBe(false)
      
      // Second animationend should not cause issues
      expect(() => el.dispatchEvent(new Event('animationend'))).not.toThrow()
    })
  })

  describe('showFloatingText', () => {
    it('should create floating text element', () => {
      renderer.showFloatingText(100, 200, '+10', 'points')
      
      expect(container.children.length).toBe(1)
      const floater = container.firstChild as HTMLElement
      expect(floater.textContent).toBe('+10')
    })

    it('should set correct classes for points type', () => {
      renderer.showFloatingText(100, 200, '+10', 'points')
      
      const floater = container.firstChild as HTMLElement
      expect(floater.classList.contains('floating-text')).toBe(true)
      expect(floater.classList.contains('floating-points')).toBe(true)
    })

    it('should set correct classes for combo type', () => {
      renderer.showFloatingText(100, 200, '5x combo', 'combo')
      
      const floater = container.firstChild as HTMLElement
      expect(floater.classList.contains('floating-text')).toBe(true)
      expect(floater.classList.contains('floating-combo')).toBe(true)
    })

    it('should set correct classes for life type', () => {
      renderer.showFloatingText(100, 200, '-1', 'life')
      
      const floater = container.firstChild as HTMLElement
      expect(floater.classList.contains('floating-text')).toBe(true)
      expect(floater.classList.contains('floating-life')).toBe(true)
    })

    it('should set position styles', () => {
      renderer.showFloatingText(150, 250, '+10', 'points')
      
      const floater = container.firstChild as HTMLElement
      expect(floater.style.left).toBe('150px')
      expect(floater.style.top).toBe('250px')
    })

    it('should remove element after animation ends', () => {
      renderer.showFloatingText(100, 200, '+10', 'points')
      
      expect(container.children.length).toBe(1)
      
      const floater = container.firstChild as HTMLElement
      floater.dispatchEvent(new Event('animationend'))
      
      expect(container.children.length).toBe(0)
    })

    it('should not remove element before animation ends', () => {
      renderer.showFloatingText(100, 200, '+10', 'points')
      
      expect(container.children.length).toBe(1)
      
      // Element should remain until animationend fires
      expect(container.children.length).toBe(1)
    })

    it('should create multiple floating texts', () => {
      renderer.showFloatingText(100, 200, '+10', 'points')
      renderer.showFloatingText(150, 250, '3x', 'combo')
      renderer.showFloatingText(200, 300, '-1', 'life')
      
      expect(container.children.length).toBe(3)
    })

    it('should handle special characters and emoji', () => {
      renderer.showFloatingText(100, 200, '💔 -1', 'life')
      
      const floater = container.firstChild as HTMLElement
      expect(floater.textContent).toBe('💔 -1')
    })
  })

  describe('getWidth', () => {
    it('should return container client width', () => {
      const width = renderer.getWidth()
      
      // Test environment doesn't render elements, so clientWidth will be 0
      expect(typeof width).toBe('number')
      expect(width).toBeGreaterThanOrEqual(0)
    })

    it('should call clientWidth property', () => {
      const widthGetter = vi.spyOn(container, 'clientWidth', 'get')
      
      renderer.getWidth()
      
      expect(widthGetter).toHaveBeenCalled()
    })
  })

  describe('getHeight', () => {
    it('should return container client height', () => {
      const height = renderer.getHeight()
      
      // Test environment doesn't render elements, so clientHeight will be 0
      expect(typeof height).toBe('number')
      expect(height).toBeGreaterThanOrEqual(0)
    })

    it('should call clientHeight property', () => {
      const heightGetter = vi.spyOn(container, 'clientHeight', 'get')
      
      renderer.getHeight()
      
      expect(heightGetter).toHaveBeenCalled()
    })
  })

  describe('getDangerZoneHeight', () => {
    it('should return the parsed --danger-zone-height CSS variable when set', () => {
      container.style.setProperty('--danger-zone-height', '60px')

      const height = renderer.getDangerZoneHeight()

      expect(height).toBe(60)
    })

    it('should fall back to DANGER_ZONE constant when CSS variable is not set', () => {
      // No --danger-zone-height set on the container; getComputedStyle returns ''
      const height = renderer.getDangerZoneHeight()

      // happy-dom returns '' for unset custom props → parseFloat('') = NaN → fallback 80
      expect(height).toBe(80)
    })

    it('should return a number', () => {
      expect(typeof renderer.getDangerZoneHeight()).toBe('number')
    })
  })

  describe('integration scenarios', () => {
    it('should handle token lifecycle: create, position, flash, remove', () => {
      const el = renderer.createTokenEl('a', 'あ')
      expect(container.children.length).toBe(1)
      
      renderer.setTokenPosition(el, 100, 200)
      expect(el.style.transform).toBe('translate3d(100px, 200px, 0)')
      
      renderer.flashToken(el, true)
      expect(el.classList.contains('token-success')).toBe(true)
      
      el.dispatchEvent(new Event('animationend'))
      expect(container.children.length).toBe(0)
    })

    it('should handle multiple tokens with different positions', () => {
      const el1 = renderer.createTokenEl('a', 'あ')
      const el2 = renderer.createTokenEl('ka', 'か')
      const el3 = renderer.createTokenEl('sa', 'さ')
      
      renderer.setTokenPosition(el1, 50, 100)
      renderer.setTokenPosition(el2, 150, 200)
      renderer.setTokenPosition(el3, 250, 300)
      
      expect(el1.style.transform).toBe('translate3d(50px, 100px, 0)')
      expect(el2.style.transform).toBe('translate3d(150px, 200px, 0)')
      expect(el3.style.transform).toBe('translate3d(250px, 300px, 0)')
    })

    it('should handle tokens and floating text simultaneously', () => {
      const el = renderer.createTokenEl('a', 'あ')
      renderer.showFloatingText(100, 200, '+10', 'points')
      
      expect(container.children.length).toBe(2)
      
      renderer.flashToken(el, true)
      el.dispatchEvent(new Event('animationend'))
      
      expect(container.children.length).toBe(1)
      
      const floater = container.querySelector('.floating-text') as HTMLElement
      floater.dispatchEvent(new Event('animationend'))
      
      expect(container.children.length).toBe(0)
    })

    it('should handle clearing container with multiple elements', () => {
      renderer.createTokenEl('a', 'あ')
      renderer.createTokenEl('ka', 'か')
      renderer.showFloatingText(100, 200, '+10', 'points')
      
      expect(container.children.length).toBe(3)
      
      // Clear all
      container.innerHTML = ''
      
      expect(container.children.length).toBe(0)
    })
  })
})
