import { render, screen, fireEvent } from '@testing-library/svelte'
import { describe, it, expect, vi } from 'vitest'
import HelpModal from './HelpModal.svelte'

describe('HelpModal', () => {
  it('renders when open is true', () => {
    render(HelpModal, { open: true, onClose: vi.fn(), onOpenKanaReference: vi.fn() })
    expect(screen.getByText('📖 How to play')).toBeInTheDocument()
    expect(screen.getByText('🎯 Objective')).toBeInTheDocument()
  })

  it('does not render when open is false', () => {
    render(HelpModal, { open: false, onClose: vi.fn(), onOpenKanaReference: vi.fn() })
    expect(screen.queryByText('📖 How to play')).not.toBeInTheDocument()
  })

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn()
    render(HelpModal, { open: true, onClose, onOpenKanaReference: vi.fn() })
    await fireEvent.click(screen.getByRole('button', { name: /close help/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onOpenKanaReference (and onClose) when kana reference button clicked', async () => {
    const onClose = vi.fn()
    const onOpenKanaReference = vi.fn()
    render(HelpModal, { open: true, onClose, onOpenKanaReference })
    await fireEvent.click(screen.getByRole('button', { name: /full kana reference/i }))
    expect(onClose).toHaveBeenCalledOnce()
    expect(onOpenKanaReference).toHaveBeenCalledOnce()
  })

  it('calls onClose on Escape key when open', async () => {
    const onClose = vi.fn()
    render(HelpModal, { open: true, onClose, onOpenKanaReference: vi.fn() })
    await fireEvent.keyDown(window, { code: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not call onClose on Escape when closed', async () => {
    const onClose = vi.fn()
    render(HelpModal, { open: false, onClose, onOpenKanaReference: vi.fn() })
    await fireEvent.keyDown(window, { code: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })
})
