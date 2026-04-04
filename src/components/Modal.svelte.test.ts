import { render, screen, fireEvent } from '@testing-library/svelte'
import { describe, it, expect, vi } from 'vitest'
import Modal from './Modal.svelte'
import { createRawSnippet } from 'svelte'

function makeSnippet(text: string) {
  return createRawSnippet(() => ({ render: () => `<span>${text}</span>` }))
}

describe('Modal', () => {
  const baseProps = {
    id: 'test-modal',
    open: true,
    titleId: 'test-title',
    title: makeSnippet('Test Title'),
    body: makeSnippet('Test body content'),
    onClose: vi.fn(),
    closeButtonId: 'test-close',
    closeLabel: 'Close test',
  }

  it('renders with the given id', () => {
    render(Modal, baseProps)
    expect(document.getElementById('test-modal')).toBeInTheDocument()
  })

  it('is visible when open is true', () => {
    render(Modal, baseProps)
    expect(document.getElementById('test-modal')).not.toHaveClass('hidden')
  })

  it('has hidden class when open is false', () => {
    render(Modal, { ...baseProps, open: false })
    expect(document.getElementById('test-modal')).toHaveClass('hidden')
  })

  it('renders the title snippet', () => {
    render(Modal, baseProps)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders the body snippet', () => {
    render(Modal, baseProps)
    expect(screen.getByText('Test body content')).toBeInTheDocument()
  })

  it('renders close button with correct label', () => {
    render(Modal, baseProps)
    expect(screen.getByRole('button', { name: 'Close test' })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(Modal, { ...baseProps, onClose })
    fireEvent.click(screen.getByRole('button', { name: 'Close test' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn()
    render(Modal, { ...baseProps, onClose })
    const overlay = document.querySelector('.modal-overlay') as HTMLElement
    fireEvent.click(overlay)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not render close button when onClose is not provided', () => {
    const { onClose: _omit, closeButtonId: _omit2, closeLabel: _omit3, ...propsWithoutClose } = baseProps
    render(Modal, propsWithoutClose)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('applies contentWidth style when provided', () => {
    render(Modal, { ...baseProps, contentWidth: '500px' })
    const content = document.querySelector('.modal-content') as HTMLElement
    expect(content.style.width).toBe('500px')
  })

  it('has correct aria attributes', () => {
    render(Modal, baseProps)
    const modal = document.getElementById('test-modal')
    expect(modal).toHaveAttribute('role', 'dialog')
    expect(modal).toHaveAttribute('aria-modal', 'true')
    expect(modal).toHaveAttribute('aria-labelledby', 'test-title')
  })
})
