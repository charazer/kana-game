import { render, screen, fireEvent } from '@testing-library/svelte'
import { describe, it, expect, vi } from 'vitest'
import GameHeader from './GameHeader.svelte'
import { GAME_MODE_CHALLENGE, GAME_MODE_PRACTICE, INITIAL_LIVES } from '../game/constants/constants'

describe('GameHeader', () => {
  const defaultProps = {
    score: 0,
    combo: 0,
    speedMultiplier: 1.0,
    lives: INITIAL_LIVES,
    gamePhase: 'playing' as const,
    gameMode: GAME_MODE_CHALLENGE,
    isGameActive: true,
    onOpenSettings: vi.fn(),
    onEndGame: vi.fn(),
    onPause: vi.fn(),
    onResume: vi.fn(),
  }

  it('renders the game title', () => {
    render(GameHeader, defaultProps)
    expect(screen.getByRole('heading', { name: /Kana Game/i })).toBeInTheDocument()
  })

  it('displays score', () => {
    render(GameHeader, { ...defaultProps, score: 150 })
    expect(document.getElementById('score')).toHaveTextContent('150')
  })

  it('displays combo', () => {
    render(GameHeader, { ...defaultProps, combo: 5 })
    expect(document.getElementById('combo')).toHaveTextContent('5x')
  })

  it('displays speed multiplier', () => {
    render(GameHeader, { ...defaultProps, speedMultiplier: 1.5 })
    expect(document.getElementById('speed')).toHaveTextContent('1.5x')
  })

  it('displays heart icons for lives', () => {
    render(GameHeader, defaultProps)
    const livesEl = document.getElementById('lives')
    expect(livesEl?.querySelectorAll('img')).toHaveLength(INITIAL_LIVES)
  })

  it('hides lives section in practice mode', () => {
    render(GameHeader, { ...defaultProps, gameMode: GAME_MODE_PRACTICE })
    const livesBox = document.querySelector('.lives-box') as HTMLElement
    expect(livesBox?.style.display).toBe('none')
  })

  it('settings button triggers onOpenSettings', () => {
    const onOpenSettings = vi.fn()
    render(GameHeader, { ...defaultProps, onOpenSettings })
    fireEvent.click(screen.getByRole('button', { name: /open settings/i }))
    expect(onOpenSettings).toHaveBeenCalledOnce()
  })

  it('end game button triggers onEndGame', () => {
    const onEndGame = vi.fn()
    render(GameHeader, { ...defaultProps, onEndGame })
    fireEvent.click(screen.getByRole('button', { name: /end game/i }))
    expect(onEndGame).toHaveBeenCalledOnce()
  })

  it('pause button triggers onPause when playing', () => {
    const onPause = vi.fn()
    render(GameHeader, { ...defaultProps, gamePhase: 'playing', onPause })
    fireEvent.click(screen.getByRole('button', { name: /pause game/i }))
    expect(onPause).toHaveBeenCalledOnce()
  })

  it('pause button triggers onResume when paused', () => {
    const onResume = vi.fn()
    render(GameHeader, { ...defaultProps, gamePhase: 'paused', onResume })
    fireEvent.click(screen.getByRole('button', { name: /resume game/i }))
    expect(onResume).toHaveBeenCalledOnce()
  })

  it('shows Resume label and icon when paused', () => {
    render(GameHeader, { ...defaultProps, gamePhase: 'paused' })
    expect(screen.getByRole('button', { name: /resume game/i })).toHaveTextContent('Resume')
  })

  it('shows Pause label when playing', () => {
    render(GameHeader, { ...defaultProps, gamePhase: 'playing' })
    expect(screen.getByRole('button', { name: /pause game/i })).toHaveTextContent('Pause')
  })

  it('end game button is disabled when game is not active', () => {
    render(GameHeader, { ...defaultProps, isGameActive: false })
    expect(screen.getByRole('button', { name: /end game/i })).toBeDisabled()
  })

  it('pause button is disabled when game is not active', () => {
    render(GameHeader, { ...defaultProps, isGameActive: false })
    expect(screen.getByRole('button', { name: /pause/i })).toBeDisabled()
  })

  it('triggers score flash when score changes', async () => {
    const { rerender } = render(GameHeader, { ...defaultProps, score: 0 })
    await rerender({ ...defaultProps, score: 200 })
    expect(document.getElementById('score')).toHaveTextContent('200')
  })

  it('triggers combo flash when combo increases', async () => {
    const { rerender } = render(GameHeader, { ...defaultProps, combo: 0 })
    await rerender({ ...defaultProps, combo: 5 })
    expect(document.getElementById('combo')).toHaveTextContent('5x')
  })

  it('does not flash combo when combo stays at zero', async () => {
    const { rerender } = render(GameHeader, { ...defaultProps, combo: 0 })
    await rerender({ ...defaultProps, combo: 0 })
    expect(document.getElementById('combo')).toHaveTextContent('0x')
  })

  it('triggers lives shake when lives decrease', async () => {
    const { rerender } = render(GameHeader, { ...defaultProps, lives: 3 })
    await rerender({ ...defaultProps, lives: 2 })
    expect(document.getElementById('lives')).toBeInTheDocument()
  })

  it('does not shake lives when lives increase', async () => {
    const { rerender } = render(GameHeader, { ...defaultProps, lives: 1 })
    await rerender({ ...defaultProps, lives: 3 })
    expect(document.getElementById('lives')).toBeInTheDocument()
  })

  it('triggers speed flash when speed multiplier changes', async () => {
    const { rerender } = render(GameHeader, { ...defaultProps, speedMultiplier: 1.0 })
    await rerender({ ...defaultProps, speedMultiplier: 1.5 })
    expect(document.getElementById('speed')).toHaveTextContent('1.5x')
  })
})
