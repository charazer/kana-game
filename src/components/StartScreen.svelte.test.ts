import { render, screen, fireEvent } from '@testing-library/svelte'
import { describe, it, expect, vi } from 'vitest'
import StartScreen from './StartScreen.svelte'
import { GAME_MODE_CHALLENGE, GAME_MODE_PRACTICE } from '../game/constants/constants'

describe('StartScreen', () => {
  it('renders the welcome heading', () => {
    render(StartScreen, {
      gameMode: GAME_MODE_CHALLENGE,
      onStart: vi.fn(),
      onOpenHelp: vi.fn()
    })
    expect(screen.getByText(/ようこそ/)).toBeInTheDocument()
  })

  it('renders the start button', () => {
    render(StartScreen, {
      gameMode: GAME_MODE_CHALLENGE,
      onStart: vi.fn(),
      onOpenHelp: vi.fn()
    })
    expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument()
  })

  it('calls onStart when start button is clicked', async () => {
    const onStart = vi.fn()
    render(StartScreen, {
      gameMode: GAME_MODE_CHALLENGE,
      onStart,
      onOpenHelp: vi.fn()
    })
    await fireEvent.click(screen.getByRole('button', { name: /start game/i }))
    expect(onStart).toHaveBeenCalledOnce()
  })

  it('calls onOpenHelp when how-to-play button is clicked', async () => {
    const onOpenHelp = vi.fn()
    render(StartScreen, {
      gameMode: GAME_MODE_CHALLENGE,
      onStart: vi.fn(),
      onOpenHelp
    })
    await fireEvent.click(screen.getByText(/How to play/i))
    expect(onOpenHelp).toHaveBeenCalledOnce()
  })

  it('passes gameMode to HighScoresList (practice mode message shown)', () => {
    render(StartScreen, {
      gameMode: GAME_MODE_PRACTICE,
      onStart: vi.fn(),
      onOpenHelp: vi.fn()
    })
    expect(screen.getByText(/not recorded in practice mode/)).toBeInTheDocument()
  })
})
