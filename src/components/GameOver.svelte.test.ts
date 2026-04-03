import { render, screen, fireEvent } from '@testing-library/svelte'
import { describe, it, expect, vi } from 'vitest'
import GameOver from './GameOver.svelte'
import { GAME_MODE_CHALLENGE, GAME_MODE_PRACTICE } from '../game/constants/constants'

describe('GameOver', () => {
  const defaultProps = {
    gameMode: GAME_MODE_CHALLENGE,
    finalScore: 0,
    isNewHighScore: false,
    visible: true,
    onRestart: vi.fn(),
    onOpenHelp: vi.fn()
  }

  it('renders game over heading', () => {
    render(GameOver, defaultProps)
    expect(screen.getByText('Game Over!')).toBeInTheDocument()
  })

  it('displays the final score', () => {
    render(GameOver, { ...defaultProps, finalScore: 1234 })
    expect(screen.getByText('1234')).toBeInTheDocument()
  })

  it('shows new high score message when isNewHighScore is true', () => {
    render(GameOver, { ...defaultProps, isNewHighScore: true })
    expect(screen.getByText(/New High Score/)).toBeInTheDocument()
  })

  it('hides new high score message when isNewHighScore is false', () => {
    render(GameOver, { ...defaultProps, isNewHighScore: false })
    expect(screen.queryByText(/New High Score/)).not.toBeInTheDocument()
  })

  it('calls onRestart when restart button is clicked', async () => {
    const onRestart = vi.fn()
    render(GameOver, { ...defaultProps, onRestart })
    await fireEvent.click(screen.getByRole('button', { name: /play again/i }))
    expect(onRestart).toHaveBeenCalledOnce()
  })

  it('calls onOpenHelp when how-to-play button is clicked', async () => {
    const onOpenHelp = vi.fn()
    render(GameOver, { ...defaultProps, onOpenHelp })
    await fireEvent.click(screen.getByText(/How to play/i))
    expect(onOpenHelp).toHaveBeenCalledOnce()
  })

  it('shows practice mode message in high scores for practice mode', () => {
    render(GameOver, { ...defaultProps, gameMode: GAME_MODE_PRACTICE })
    expect(screen.getByText(/not recorded in practice mode/)).toBeInTheDocument()
  })
})
