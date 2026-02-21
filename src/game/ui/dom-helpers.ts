/**
 * DOM utility helpers for common UI operations
 */

type Disableable = (HTMLButtonElement | HTMLSelectElement | HTMLInputElement) | null

export function enableElement(el: Disableable): void {
  if (!el) return
  el.disabled = false
  el.style.opacity = '1'
  el.style.cursor = 'pointer'
}

export function disableElement(el: Disableable): void {
  if (!el) return
  el.disabled = true
  el.style.opacity = '0.5'
  el.style.cursor = 'not-allowed'
}

export function enableElements(...elements: Disableable[]): void {
  for (const el of elements) enableElement(el)
}

export function disableElements(...elements: Disableable[]): void {
  for (const el of elements) disableElement(el)
}

/**
 * Sets up modal close handlers for close button and overlay click
 */
export function setupModalHandlers(
  modal: HTMLElement,
  options: {
    closeButton?: HTMLElement | null
    overlay?: HTMLElement | null
    onClose?: () => void
  }
): void {
  const { closeButton, overlay, onClose } = options
  const close = () => {
    modal.classList.add('hidden')
    onClose?.()
  }
  closeButton?.addEventListener('click', close)
  overlay?.addEventListener('click', close)
}
