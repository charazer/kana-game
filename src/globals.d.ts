// Global type declarations
export {}

/**
 * VirtualKeyboard API — Chromium-only progressive enhancement.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/VirtualKeyboard_API
 */
declare global {
	interface VirtualKeyboard extends EventTarget {
		readonly boundingRect: DOMRect
		overlaysContent: boolean
		show(): void
		hide(): void
	}

	interface Navigator {
		readonly virtualKeyboard?: VirtualKeyboard
	}
}
