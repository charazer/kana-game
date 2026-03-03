import {
	initializeMobileKeyboardDetection,
	initializeTouchFocusProtection,
	initializeVirtualKeyboardAPI,
	initializeScrollPrevention,
	initializeKeyboardDebugMode
} from './mobile-support'

describe('mobile-support', () => {
	describe('initializeVirtualKeyboardAPI', () => {
		let originalVK: VirtualKeyboard | undefined

		beforeEach(() => {
			originalVK = navigator.virtualKeyboard
		})

		afterEach(() => {
			Object.defineProperty(navigator, 'virtualKeyboard', {
				value: originalVK,
				writable: true,
				configurable: true
			})
		})

		it('should do nothing when VirtualKeyboard API is not available', () => {
			Object.defineProperty(navigator, 'virtualKeyboard', {
				value: undefined,
				writable: true,
				configurable: true
			})
			// Should not throw
			initializeVirtualKeyboardAPI()
		})

		it('should set overlaysContent to true when VirtualKeyboard API is available', () => {
			const mockVK = { overlaysContent: false } as VirtualKeyboard
			Object.defineProperty(navigator, 'virtualKeyboard', {
				value: mockVK,
				writable: true,
				configurable: true
			})

			initializeVirtualKeyboardAPI()

			expect(mockVK.overlaysContent).toBe(true)
		})
	})

	describe('initializeMobileKeyboardDetection', () => {
		let originalVisualViewport: VisualViewport | null

		beforeEach(() => {
			originalVisualViewport = window.visualViewport
			document.body.className = ''
			document.documentElement.style.removeProperty('--viewport-height')
		})

		afterEach(() => {
			Object.defineProperty(window, 'visualViewport', {
				value: originalVisualViewport,
				writable: true,
				configurable: true
			})
		})

		it('should do nothing when visualViewport is not available', () => {
			Object.defineProperty(window, 'visualViewport', {
				value: null,
				writable: true,
				configurable: true
			})

			// Should not throw
			initializeMobileKeyboardDetection()
			expect(document.body.classList.contains('keyboard-visible')).toBe(false)
		})

		it('should set --viewport-height on init', () => {
			const mockVV = {
				height: 800,
				addEventListener: vi.fn()
			}
			Object.defineProperty(window, 'visualViewport', {
				value: mockVV,
				writable: true,
				configurable: true
			})

			initializeMobileKeyboardDetection()

			expect(document.documentElement.style.getPropertyValue('--viewport-height')).toBe('800px')
		})

		it('should add keyboard-visible class when viewport shrinks below threshold of initial height', () => {
			let resizeCallback: ((e: Event) => void) | undefined
			const mockVV = {
				height: 800,
				addEventListener: (_event: string, cb: (e: Event) => void) => {
					resizeCallback = cb
				}
			}
			Object.defineProperty(window, 'visualViewport', {
				value: mockVV,
				writable: true,
				configurable: true
			})

			initializeMobileKeyboardDetection()
			expect(document.body.classList.contains('keyboard-visible')).toBe(false)

			// Simulate keyboard opening — viewport shrinks to 50% of initial height (400/800)
			// This also covers iOS where innerHeight shrinks alongside visualViewport
			mockVV.height = 400
			resizeCallback!(new Event('resize'))

			expect(document.body.classList.contains('keyboard-visible')).toBe(true)
			expect(document.documentElement.style.getPropertyValue('--viewport-height')).toBe('400px')
		})

		it('should remove keyboard-visible class when viewport returns to initial height', () => {
			let resizeCallback: ((e: Event) => void) | undefined
			// Start with a small height to simulate keyboard already open at init —
			// in practice this cannot happen, but tests the "restore" path correctly
			const mockVV = {
				height: 400,
				addEventListener: (_event: string, cb: (e: Event) => void) => {
					resizeCallback = cb
				}
			}
			Object.defineProperty(window, 'visualViewport', {
				value: mockVV,
				writable: true,
				configurable: true
			})

			initializeMobileKeyboardDetection()

			// Simulate viewport growing back to full height
			mockVV.height = 800
			resizeCallback!(new Event('resize'))

			expect(document.body.classList.contains('keyboard-visible')).toBe(false)
		})

		it('should not trigger keyboard-visible when viewport shrinks only slightly', () => {
			let resizeCallback: ((e: Event) => void) | undefined
			const mockVV = {
				height: 800,
				addEventListener: (_event: string, cb: (e: Event) => void) => {
					resizeCallback = cb
				}
			}
			Object.defineProperty(window, 'visualViewport', {
				value: mockVV,
				writable: true,
				configurable: true
			})

			initializeMobileKeyboardDetection()

			// Shrink to 80% — above threshold, e.g. URL bar hiding
			mockVV.height = 640
			resizeCallback!(new Event('resize'))

			expect(document.body.classList.contains('keyboard-visible')).toBe(false)
		})
	})

	describe('initializeScrollPrevention', () => {
		let originalVisualViewport: VisualViewport | null

		beforeEach(() => {
			originalVisualViewport = window.visualViewport
			document.documentElement.scrollTop = 0
			document.body.scrollTop = 0
		})

		afterEach(() => {
			Object.defineProperty(window, 'visualViewport', {
				value: originalVisualViewport,
				writable: true,
				configurable: true
			})
		})

		it('should reset scrollTop to 0 on viewport resize', () => {
			let resizeCallback: ((e: Event) => void) | undefined
			const mockVV = {
				height: 800,
				addEventListener: (_event: string, cb: (e: Event) => void) => {
					resizeCallback = cb
				}
			}
			Object.defineProperty(window, 'visualViewport', {
				value: mockVV,
				writable: true,
				configurable: true
			})

			initializeScrollPrevention()

			document.documentElement.scrollTop = 100
			document.body.scrollTop = 100
			resizeCallback!(new Event('resize'))

			expect(document.documentElement.scrollTop).toBe(0)
			expect(document.body.scrollTop).toBe(0)
		})

		it('should reset scrollTop to 0 on window scroll', () => {
			const mockVV = {
				height: 800,
				addEventListener: vi.fn()
			}
			Object.defineProperty(window, 'visualViewport', {
				value: mockVV,
				writable: true,
				configurable: true
			})

			initializeScrollPrevention()

			document.documentElement.scrollTop = 50
			document.body.scrollTop = 50
			window.dispatchEvent(new Event('scroll'))

			expect(document.documentElement.scrollTop).toBe(0)
			expect(document.body.scrollTop).toBe(0)
		})

		it('should not throw when visualViewport is not available', () => {
			Object.defineProperty(window, 'visualViewport', {
				value: null,
				writable: true,
				configurable: true
			})

			// Should not throw — scroll listener still attaches
			initializeScrollPrevention()

			document.documentElement.scrollTop = 50
			window.dispatchEvent(new Event('scroll'))

			expect(document.documentElement.scrollTop).toBe(0)
		})
	})

	describe('initializeKeyboardDebugMode', () => {
		const setSearch = (search: string) => {
			Object.defineProperty(window, 'location', {
				value: { search },
				writable: true,
				configurable: true
			})
		}

		beforeEach(() => {
			document.body.className = ''
			document.documentElement.style.removeProperty('--viewport-height')
			setSearch('')
		})

		it('should do nothing when ?keyboard param is absent', () => {
			setSearch('')
			initializeKeyboardDebugMode()
			expect(document.body.classList.contains('keyboard-visible')).toBe(false)
			expect(document.documentElement.style.getPropertyValue('--viewport-height')).toBe('')
		})

		it('should force keyboard-visible and set --viewport-height when ?keyboard is present', () => {
			setSearch('?keyboard')
			initializeKeyboardDebugMode()
			expect(document.body.classList.contains('keyboard-visible')).toBe(true)
			const vh = document.documentElement.style.getPropertyValue('--viewport-height')
			expect(vh).toMatch(/^\d+px$/)
		})

		it('should set --viewport-height to 55% of window.innerHeight', () => {
			setSearch('?keyboard')
			const expected = `${Math.round(window.innerHeight * 0.55)}px`
			initializeKeyboardDebugMode()
			expect(document.documentElement.style.getPropertyValue('--viewport-height')).toBe(expected)
		})

		it('should activate when ?keyboard appears alongside other params', () => {
			setSearch('?foo=1&keyboard&bar=2')
			initializeKeyboardDebugMode()
			expect(document.body.classList.contains('keyboard-visible')).toBe(true)
		})
	})

	describe('initializeTouchFocusProtection', () => {
		let gameArea: HTMLElement
		let mobileInput: HTMLInputElement
		let isEnabled: ReturnType<typeof vi.fn<() => boolean>>

		beforeEach(() => {
			gameArea = document.createElement('div')
			mobileInput = document.createElement('input')
			document.body.appendChild(gameArea)
			document.body.appendChild(mobileInput)
			isEnabled = vi.fn<() => boolean>()
		})

		afterEach(() => {
			document.body.innerHTML = ''
		})

		it('should prevent default on touchstart when game is active', () => {
			isEnabled.mockReturnValue(true)
			initializeTouchFocusProtection(gameArea, mobileInput, isEnabled)

			const event = new TouchEvent('touchstart', { cancelable: true })
			const preventSpy = vi.spyOn(event, 'preventDefault')
			gameArea.dispatchEvent(event)

			expect(preventSpy).toHaveBeenCalled()
		})

		it('should not prevent default when game is inactive', () => {
			isEnabled.mockReturnValue(false)
			initializeTouchFocusProtection(gameArea, mobileInput, isEnabled)

			const event = new TouchEvent('touchstart', { cancelable: true })
			const preventSpy = vi.spyOn(event, 'preventDefault')
			gameArea.dispatchEvent(event)

			expect(preventSpy).not.toHaveBeenCalled()
		})

		it('should focus input when game is active and input is not focused', () => {
			isEnabled.mockReturnValue(true)
			initializeTouchFocusProtection(gameArea, mobileInput, isEnabled)
			mobileInput.blur()

			const focusSpy = vi.spyOn(mobileInput, 'focus')
			const event = new TouchEvent('touchstart', { cancelable: true })
			gameArea.dispatchEvent(event)

			expect(focusSpy).toHaveBeenCalled()
		})

		it('should not re-focus input when already focused', () => {
			isEnabled.mockReturnValue(true)
			initializeTouchFocusProtection(gameArea, mobileInput, isEnabled)
			mobileInput.focus()

			const focusSpy = vi.spyOn(mobileInput, 'focus')
			const event = new TouchEvent('touchstart', { cancelable: true })
			gameArea.dispatchEvent(event)

			expect(focusSpy).not.toHaveBeenCalled()
		})
	})
})
