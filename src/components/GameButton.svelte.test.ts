import { render, screen, fireEvent } from '@testing-library/svelte'
import { describe, it, expect, vi } from 'vitest'
import GameButton from './GameButton.svelte'

const baseProps = {
  variant: 'start' as const,
  ariaLabel: 'Start game',
  imgSrc: '/test.png',
  imgWidth: 82,
  imgHeight: 87,
  label: 'Start',
  onclick: vi.fn(),
}

describe('GameButton', () => {
  it('renders the button with the given label', () => {
    render(GameButton, baseProps)
    expect(screen.getByText('Start')).toBeInTheDocument()
  })

  it('renders with the correct aria-label', () => {
    render(GameButton, baseProps)
    expect(screen.getByRole('button', { name: 'Start game' })).toBeInTheDocument()
  })

  it('renders with the given id when provided', () => {
    render(GameButton, { ...baseProps, id: 'start-btn' })
    expect(document.getElementById('start-btn')).toBeInTheDocument()
  })

  it('does not set id when not provided', () => {
    render(GameButton, baseProps)
    const btn = screen.getByRole('button', { name: 'Start game' })
    expect(btn.id).toBe('')
  })

  it('applies the correct variant class', () => {
    render(GameButton, baseProps)
    expect(screen.getByRole('button', { name: 'Start game' })).toHaveClass('btn-start')
  })

  it('applies variant class for restart', () => {
    render(GameButton, { ...baseProps, variant: 'restart', ariaLabel: 'Restart', label: 'Restart' })
    expect(screen.getByRole('button', { name: 'Restart' })).toHaveClass('btn-restart')
  })

  it('calls onclick when clicked', async () => {
    const onclick = vi.fn()
    render(GameButton, { ...baseProps, onclick })
    await fireEvent.click(screen.getByRole('button', { name: 'Start game' }))
    expect(onclick).toHaveBeenCalledOnce()
  })

  it('is disabled when disabled prop is true', () => {
    render(GameButton, { ...baseProps, disabled: true })
    expect(screen.getByRole('button', { name: 'Start game' })).toBeDisabled()
  })

  it('is not disabled by default', () => {
    render(GameButton, baseProps)
    expect(screen.getByRole('button', { name: 'Start game' })).not.toBeDisabled()
  })

  it('renders the img element', () => {
    render(GameButton, baseProps)
    expect(document.querySelector('.btn-icon')).toBeInTheDocument()
  })
})
