import { render } from '@testing-library/svelte'
import { describe, it, expect, vi } from 'vitest'
import GameArea from './GameArea.svelte'
import { GAME_MODE_CHALLENGE } from '../game/constants/constants'

describe('GameArea', () => {
  const defaultProps = {
    gamePhase: 'playing' as const,
    gameMode: GAME_MODE_CHALLENGE,
    finalScore: 0,
    isNewHighScore: false,
    speedMultiplier: 1.0,
    onStart: vi.fn(),
    onRestart: vi.fn(),
    onOpenHelp: vi.fn(),
  }

  it('renders the tokens container', () => {
    render(GameArea, defaultProps)
    expect(document.getElementById('tokens')).toBeInTheDocument()
  })

  it('renders the game area element', () => {
    render(GameArea, defaultProps)
    expect(document.getElementById('game-area')).toBeInTheDocument()
  })

  it('shows start screen when gamePhase is start', () => {
    render(GameArea, { ...defaultProps, gamePhase: 'start' })
    expect(document.getElementById('start-screen')).toBeInTheDocument()
  })

  it('does not render start screen when playing', () => {
    render(GameArea, defaultProps)
    expect(document.getElementById('start-screen')).toBeNull()
  })

  it('always renders the game over component', () => {
    render(GameArea, defaultProps)
    expect(document.getElementById('game-over')).toBeInTheDocument()
  })

  it('shows paused indicator when gamePhase is paused', () => {
    render(GameArea, { ...defaultProps, gamePhase: 'paused' })
    expect(document.getElementById('paused-indicator')).not.toHaveClass('hidden')
  })

  it('hides paused indicator when playing', () => {
    render(GameArea, defaultProps)
    expect(document.getElementById('paused-indicator')).toHaveClass('hidden')
  })

  it('hides paused indicator on start screen', () => {
    render(GameArea, { ...defaultProps, gamePhase: 'start' })
    expect(document.getElementById('paused-indicator')).toHaveClass('hidden')
  })

  it('triggers speed-flash branch when speedMultiplier changes', async () => {
    const { rerender } = render(GameArea, defaultProps)
    // gameAreaEl is unbound in unit tests; effect exercises the m !== prevSpeed
    // true branch and the if (gameAreaEl) false branch
    await rerender({ ...defaultProps, speedMultiplier: 2.0 })
    expect(document.getElementById('game-area')).toBeInTheDocument()
  })
})
