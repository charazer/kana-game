import { render, screen, fireEvent } from '@testing-library/svelte'
import { describe, it, expect, vi } from 'vitest'
import KanaReferenceModal from './KanaReferenceModal.svelte'

describe('KanaReferenceModal', () => {
  it('renders when open is true, defaulting to hiragana tab', () => {
    render(KanaReferenceModal, { open: true, onClose: vi.fn() })
    expect(screen.getByText('📚 Kana Reference')).toBeInTheDocument()
    const hiraganaTab = screen.getByRole('tab', { name: /hiragana/i })
    expect(hiraganaTab).toHaveAttribute('aria-selected', 'true')
  })

  it('does not render when open is false', () => {
    render(KanaReferenceModal, { open: false, onClose: vi.fn() })
    expect(screen.queryByText('📚 Kana Reference')).not.toBeInTheDocument()
  })

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn()
    render(KanaReferenceModal, { open: true, onClose })
    await fireEvent.click(screen.getByRole('button', { name: /close kana reference/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('switches to katakana tab when katakana tab clicked', async () => {
    render(KanaReferenceModal, { open: true, onClose: vi.fn() })
    const katakanaTab = screen.getByRole('tab', { name: /katakana/i })
    await fireEvent.click(katakanaTab)
    expect(katakanaTab).toHaveAttribute('aria-selected', 'true')
    const hiraganaTab = screen.getByRole('tab', { name: /hiragana/i })
    expect(hiraganaTab).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onClose on Escape key when open', async () => {
    const onClose = vi.fn()
    render(KanaReferenceModal, { open: true, onClose })
    await fireEvent.keyDown(window, { code: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not call onClose on Escape when closed', async () => {
    const onClose = vi.fn()
    render(KanaReferenceModal, { open: false, onClose })
    await fireEvent.keyDown(window, { code: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('renders hiragana content when hiragana tab is active', () => {
    render(KanaReferenceModal, { open: true, onClose: vi.fn() })
    // あ is hiragana-only
    expect(screen.getByText('あ')).toBeInTheDocument()
  })
})
