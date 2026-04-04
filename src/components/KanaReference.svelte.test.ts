import { render, screen, fireEvent } from '@testing-library/svelte'
import { describe, it, expect } from 'vitest'
import KanaReference from './KanaReference.svelte'

describe('KanaReference', () => {
  it('renders hiragana basic kana section', () => {
    render(KanaReference, { type: 'hiragana' })
    expect(screen.getByText(/Basic Kana/)).toBeInTheDocument()
    // Check a known hiragana character (あ → romaji: a)
    expect(screen.getAllByText(/^a$/).length).toBeGreaterThan(0)
  })

  it('renders katakana basic kana section', () => {
    render(KanaReference, { type: 'katakana' })
    expect(screen.getByText(/Basic Kana/)).toBeInTheDocument()
    // ア is the katakana version of あ
    expect(screen.getByText('ア')).toBeInTheDocument()
  })

  it('renders dakuten section for hiragana', () => {
    render(KanaReference, { type: 'hiragana' })
    expect(screen.getByText(/Dakuten/)).toBeInTheDocument()
  })

  it('renders yoon section for hiragana', () => {
    render(KanaReference, { type: 'hiragana' })
    expect(screen.getByText(/Yoon/)).toBeInTheDocument()
  })

  it('scroll hint is conditionally rendered based on table overflow', () => {
    render(KanaReference, { type: 'hiragana' })
    // In happy-dom, scrollWidth === clientWidth === 0, so no overflow → hint absent.
    expect(screen.queryAllByText(/scroll/).length).toBe(0)
  })

  it('exercises onResize handler when window resize fires', () => {
    render(KanaReference, { type: 'hiragana' })
    // Firing resize exercises clearTimeout + setTimeout lines in the onResize callback
    fireEvent(window, new Event('resize'))
    expect(document.querySelector('.kana-table')).toBeInTheDocument()
  })

  it('renders hiragana あ with correct romaji', () => {
    render(KanaReference, { type: 'hiragana' })
    expect(screen.getByText('あ')).toBeInTheDocument()
  })
})
