/**
 * Mobile support — keyboard detection, viewport handling, and touch focus protection.
 */

/** Fraction of initial viewport height below which the software keyboard is assumed visible. */
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
