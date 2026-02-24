/**
 * Mobile support — keyboard detection, viewport handling, and touch focus protection.
 *
 * All functions in this module are safe to call on desktop browsers; they
 * gracefully degrade when the Visual Viewport API or touch events are absent.
 */

/** Threshold: if the visual viewport is shorter than this fraction of
 *  the initial height, we assume the software keyboard is visible.
 *  Captures initial height at setup time so the comparison works on iOS
 *  Safari where both `visualViewport.height` and `window.innerHeight`
 *  shrink together when the keyboard opens. */
const KEYBOARD_VISIBILITY_RATIO = 0.75

/**
 * Toggle the `keyboard-visible` class on `<body>` and set the
 * `--viewport-height` custom property whenever the visual viewport resizes
 * (e.g. software keyboard open / close).
 */
export function initializeMobileKeyboardDetection(): void {
	if (!window.visualViewport) return

	const vv = window.visualViewport
	// Capture initial viewport height before any keyboard can appear.
	// On iOS Safari both vv.height and window.innerHeight shrink when the
	// keyboard opens, so comparing against the snapshot is the only reliable
	// cross-platform approach.
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
 * Prevent touch events on the game area from stealing focus away from
 * the mobile input element.  If the game is active and the input is focused
 * (or should be), `preventDefault()` stops the browser from blurring it.
 *
 * Additionally re-focuses the element when the user taps the game area
 * without any focused input.
 */
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
