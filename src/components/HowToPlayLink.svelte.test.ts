import { render, screen, fireEvent } from '@testing-library/svelte'
import { describe, it, expect, vi } from 'vitest'
import HowToPlayLink from './HowToPlayLink.svelte'

describe('HowToPlayLink', () => {
  it('renders the link with how to play text', () => {
    render(HowToPlayLink, { onclick: vi.fn() })
    expect(screen.getByText(/How to play/i)).toBeInTheDocument()
  })

  it('calls onclick when link is clicked', async () => {
    const onclick = vi.fn()
    render(HowToPlayLink, { onclick })
    await fireEvent.click(screen.getByText(/How to play/i))
    expect(onclick).toHaveBeenCalledOnce()
  })

  it('prevents default link navigation on click', async () => {
    const onclick = vi.fn()
    render(HowToPlayLink, { onclick })
    const link = screen.getByText(/How to play/i).closest('a') as HTMLAnchorElement
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    link.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })

  it('renders as an anchor element', () => {
    render(HowToPlayLink, { onclick: vi.fn() })
    expect(screen.getByText(/How to play/i).closest('a')).toBeInTheDocument()
  })
})
