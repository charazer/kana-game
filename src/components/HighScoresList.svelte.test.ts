import { render, screen } from '@testing-library/svelte'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import HighScoresList from './HighScoresList.svelte'
import { GAME_MODE_CHALLENGE, GAME_MODE_PRACTICE } from '../game/constants/constants'
import * as storage from '../game/storage/storage'

describe('HighScoresList', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('shows "No scores yet!" when no high scores exist', () => {
    render(HighScoresList, { gameMode: GAME_MODE_CHALLENGE })
    expect(screen.getByText('No scores yet!')).toBeInTheDocument()
    expect(screen.getByText('High Scores')).toBeInTheDocument()
  })

  it('shows practice mode message in practice mode', () => {
    render(HighScoresList, { gameMode: GAME_MODE_PRACTICE })
    expect(screen.getByText(/not recorded in practice mode/)).toBeInTheDocument()
    expect(screen.queryByText('No scores yet!')).not.toBeInTheDocument()
  })

  it('renders score entries when high scores exist', () => {
    vi.spyOn(storage, 'getHighScores').mockReturnValue([
      { score: 500, date: '2024-01-01T00:00:00.000Z' },
      { score: 300, date: '2024-01-02T00:00:00.000Z' }
    ])
    render(HighScoresList, { gameMode: GAME_MODE_CHALLENGE })
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('300')).toBeInTheDocument()
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
  })

  it('applies highlight class to matching score', () => {
    vi.spyOn(storage, 'getHighScores').mockReturnValue([
      { score: 500, date: '2024-01-01T00:00:00.000Z' }
    ])
    const { container } = render(HighScoresList, {
      gameMode: GAME_MODE_CHALLENGE,
      highlightScore: 500
    })
    const entry = container.querySelector('.high-score-entry')
    expect(entry).toHaveClass('highlight')
  })

  it('does not apply highlight when scores differ', () => {
    vi.spyOn(storage, 'getHighScores').mockReturnValue([
      { score: 500, date: '2024-01-01T00:00:00.000Z' }
    ])
    const { container } = render(HighScoresList, {
      gameMode: GAME_MODE_CHALLENGE,
      highlightScore: 999
    })
    const entry = container.querySelector('.high-score-entry')
    expect(entry).not.toHaveClass('highlight')
  })

  it('renders no entries in practice mode even if scores exist', () => {
    vi.spyOn(storage, 'getHighScores').mockReturnValue([
      { score: 500, date: '2024-01-01T00:00:00.000Z' }
    ])
    render(HighScoresList, { gameMode: GAME_MODE_PRACTICE })
    expect(screen.queryByText('500')).not.toBeInTheDocument()
    expect(screen.getByText(/not recorded in practice mode/)).toBeInTheDocument()
  })
})
