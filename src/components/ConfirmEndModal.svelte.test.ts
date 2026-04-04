import { render, screen, fireEvent } from '@testing-library/svelte'
import { describe, it, expect, vi } from 'vitest'
import ConfirmEndModal from './ConfirmEndModal.svelte'

describe('ConfirmEndModal', () => {
  it('renders when open is true', () => {
    render(ConfirmEndModal, { open: true, onConfirm: vi.fn(), onCancel: vi.fn() })
    expect(screen.getByText('End Game?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /yes/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /no/i })).toBeInTheDocument()
  })

  it('is not visible when open is false', () => {
    render(ConfirmEndModal, { open: false, onConfirm: vi.fn(), onCancel: vi.fn() })
    // element stays in DOM but gets 'hidden' class (display:none via CSS)
    expect(document.getElementById('confirm-end-modal')).toHaveClass('hidden')
  })

  it('calls onConfirm when Yes button clicked', async () => {
    const onConfirm = vi.fn()
    render(ConfirmEndModal, { open: true, onConfirm, onCancel: vi.fn() })
    await fireEvent.click(screen.getByRole('button', { name: /yes/i }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onCancel when No button clicked', async () => {
    const onCancel = vi.fn()
    render(ConfirmEndModal, { open: true, onConfirm: vi.fn(), onCancel })
    await fireEvent.click(screen.getByRole('button', { name: /no/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls onConfirm on Y key press when open', async () => {
    const onConfirm = vi.fn()
    render(ConfirmEndModal, { open: true, onConfirm, onCancel: vi.fn() })
    await fireEvent.keyDown(window, { key: 'y' })
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onConfirm on Enter key press when open', async () => {
    const onConfirm = vi.fn()
    render(ConfirmEndModal, { open: true, onConfirm, onCancel: vi.fn() })
    await fireEvent.keyDown(window, { code: 'Enter' })
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onCancel on N key press when open', async () => {
    const onCancel = vi.fn()
    render(ConfirmEndModal, { open: true, onConfirm: vi.fn(), onCancel })
    await fireEvent.keyDown(window, { key: 'n' })
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls onCancel on Escape key press when open', async () => {
    const onCancel = vi.fn()
    render(ConfirmEndModal, { open: true, onConfirm: vi.fn(), onCancel })
    await fireEvent.keyDown(window, { code: 'Escape' })
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('does not call onConfirm on Y key press when closed', async () => {
    const onConfirm = vi.fn()
    render(ConfirmEndModal, { open: false, onConfirm, onCancel: vi.fn() })
    await fireEvent.keyDown(window, { key: 'y' })
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
