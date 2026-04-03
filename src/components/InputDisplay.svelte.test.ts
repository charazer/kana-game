import { render, screen } from '@testing-library/svelte'
import { describe, it, expect } from 'vitest'
import InputDisplay from './InputDisplay.svelte'

describe('InputDisplay', () => {
  it('renders input echo with provided text', () => {
    render(InputDisplay, { inputEcho: 'sa' })
    expect(document.getElementById('input-echo')).toHaveTextContent('sa')
  })

  it('shows underscore as empty placeholder', () => {
    render(InputDisplay, { inputEcho: '_' })
    expect(document.getElementById('input-echo')).toHaveTextContent('_')
  })

  it('renders the hidden mobile input element', () => {
    render(InputDisplay, { inputEcho: '_' })
    expect(document.getElementById('mobile-input')).toBeInTheDocument()
  })

  it('renders the label', () => {
    render(InputDisplay, { inputEcho: '_' })
    expect(screen.getByText('Your input:')).toBeInTheDocument()
  })

  it('mobile input has correct attributes', () => {
    render(InputDisplay, { inputEcho: '_' })
    const input = document.getElementById('mobile-input') as HTMLInputElement
    expect(input.getAttribute('inputmode')).toBe('text')
    expect(input.getAttribute('autocomplete')).toBe('off')
    expect(input.getAttribute('tabindex')).toBe('-1')
  })
})
