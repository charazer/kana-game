/**
 * DOM utility helpers for common UI operations
 * Extracts repeated patterns from main.ts
 */

import {
  UI_DISABLED_OPACITY,
  UI_ENABLED_OPACITY,
  UI_CURSOR_NOT_ALLOWED,
  UI_CURSOR_POINTER
} from './constants'

/**
 * Interface for elements that can be enabled/disabled
 */
interface EnableableElement extends HTMLElement {
  disabled: boolean
  style: CSSStyleDeclaration
}

/**
 * Enables a UI element (button, select, input, etc.)
 */
export function enableElement(element: EnableableElement | null): void {
  if (!element) return
  
  element.disabled = false
  element.style.opacity = UI_ENABLED_OPACITY
  element.style.cursor = UI_CURSOR_POINTER
}

/**
 * Disables a UI element (button, select, input, etc.)
 */
export function disableElement(element: EnableableElement | null): void {
  if (!element) return
  
  element.disabled = true
  element.style.opacity = UI_DISABLED_OPACITY
  element.style.cursor = UI_CURSOR_NOT_ALLOWED
}

/**
 * Enables multiple UI elements at once
 */
export function enableElements(...elements: (EnableableElement | null)[]): void {
  elements.forEach(element => enableElement(element))
}

/**
 * Disables multiple UI elements at once
 */
export function disableElements(...elements: (EnableableElement | null)[]): void {
  elements.forEach(element => disableElement(element))
}

/**
 * Creates a modal close handler with optional pause/resume logic
 */
export function createModalCloseHandler(
  modal: HTMLElement,
  options: {
    onClose?: () => void
    hideClass?: string
  } = {}
): () => void {
  const { onClose, hideClass = 'hidden' } = options
  
  return () => {
    modal.classList.add(hideClass)
    if (onClose) onClose()
  }
}

/**
 * Sets up modal event handlers (close button, overlay, escape key)
 */
export function setupModalHandlers(
  modal: HTMLElement,
  options: {
    closeButton?: HTMLElement | null
    overlay?: HTMLElement | null
    onClose?: () => void
    hideClass?: string
  }
): () => void {
  const { closeButton, overlay, onClose, hideClass = 'hidden' } = options
  const closeHandler = createModalCloseHandler(modal, { onClose, hideClass })
  
  // Close button
  if (closeButton) {
    closeButton.addEventListener('click', closeHandler)
  }
  
  // Overlay click
  if (overlay) {
    overlay.addEventListener('click', closeHandler)
  }
  
  // Return the close handler for programmatic use
  return closeHandler
}
