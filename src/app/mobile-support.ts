/**
 * Mobile support — keyboard detection, viewport handling, and touch focus protection.
 *
 * Four layers prevent the software keyboard from pushing content up on Android:
 * 1. `interactive-widget=resizes-visual` (index.html) — only the visual viewport shrinks,
 *    keeping the layout stable (matches iOS behaviour natively).
 * 2. Visual Viewport API — detects keyboard open/close to toggle compact layout overrides.
 * 3. VirtualKeyboard API — Chromium-only progressive enhancement for `keyboard-inset-*` CSS vars.
 * 4. Scroll prevention — pins `scrollTop` to 0 as a safety net for residual scroll attempts.
 */

/**
 * Viewport height fraction below which the software keyboard is assumed open.
 * Keyboards take ~40-60 % of the screen; 0.75 safely ignores browser-chrome hide/show (~5-15 %).
 */
const KEYBOARD_VISIBILITY_RATIO = 0.75

/**
 * Opt into VirtualKeyboard overlay mode (Chromium ≥ 94).
 * Enables `keyboard-inset-*` CSS environment variables; no-op on other browsers.
 */
export function initializeVirtualKeyboardAPI(): void {
	if (!navigator.virtualKeyboard) return
	navigator.virtualKeyboard.overlaysContent = true
}

/** Toggle `keyboard-visible` class on `<body>` and update `--viewport-height` on viewport resize. */
export function initializeMobileKeyboardDetection(): void {
	if (!window.visualViewport) return

	const vv = window.visualViewport
	const initialHeight = vv.height

	const update = () => {
		const keyboardVisible = vv.height < initialHeight * KEYBOARD_VISIBILITY_RATIO
		document.body.classList.toggle('keyboard-visible', keyboardVisible)
		document.documentElement.style.setProperty('--viewport-height', `${vv.height}px`)
	}

	vv.addEventListener('resize', update)
	update()
}

/**
 * When `?keyboard` is present in the URL, immediately apply the `keyboard-visible` class
 * and a simulated viewport height (55 % of the current window height, approximating a
 * typical software keyboard consuming ~45 % of the screen).  Useful for iterating on
 * the compact keyboard layout on desktop without a physical device.
 */
export function initializeKeyboardDebugMode(): void {
	if (!new URLSearchParams(window.location.search).has('keyboard')) return

	const simulatedHeight = Math.round(window.innerHeight * 0.55)
	document.body.classList.add('keyboard-visible')
	document.documentElement.style.setProperty('--viewport-height', `${simulatedHeight}px`)
}

/** Pin `scrollTop` to 0 to prevent scroll-into-view from the hidden input shifting the layout. */
export function initializeScrollPrevention(): void {
	const lock = () => {
		document.documentElement.scrollTop = 0
		document.body.scrollTop = 0
	}

	window.visualViewport?.addEventListener('resize', lock)
	window.addEventListener('scroll', lock, { passive: false })
}

/** Prevent touch events on the game area from stealing focus away from the mobile input element. */
export function initializeTouchFocusProtection(
	gameArea: HTMLElement,
	mobileInput: HTMLInputElement,
	isEnabled: () => boolean
): void {
	gameArea.addEventListener(
		'touchstart',
		(e) => {
			if (!isEnabled()) return
			e.preventDefault()
			if (document.activeElement !== mobileInput) {
				mobileInput.focus()
			}
		},
		{ passive: false }
	)
}
