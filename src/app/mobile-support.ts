/**
 * Mobile support — keyboard detection, viewport handling, and touch focus protection.
 *
 * Keyboard detection uses the Visual Viewport API (supported in all modern
 * browsers) to compare the live viewport height against the initial height
 * captured at page load.  When the visible area shrinks below a threshold
 * percentage of that initial height the software keyboard is assumed open.
 */

/**
 * Fraction of initial viewport height below which the software keyboard is
 * assumed visible.  Mobile keyboards typically consume 40-60 % of the screen;
 * a 0.75 threshold reliably distinguishes keyboard appearance from smaller
 * viewport changes caused by the browser chrome (URL / toolbar hide/show,
 * typically only 5-15 % height variation).
 */
const KEYBOARD_VISIBILITY_RATIO = 0.75

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
