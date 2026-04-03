import { render, screen, fireEvent } from '@testing-library/svelte'
import { describe, it, expect, vi } from 'vitest'
import SettingsModal from './SettingsModal.svelte'
import { GAME_MODE_CHALLENGE, GAME_MODE_PRACTICE, KANA_SET_HIRAGANA, KANA_SET_KATAKANA } from '../game/constants/constants'
import type { Settings } from '../game/storage/storage'

const defaultSettings: Settings = {
  gameMode: GAME_MODE_CHALLENGE,
  kanaSet: KANA_SET_HIRAGANA,
  audioEnabled: true,
  musicEnabled: false,
  musicVolume: 0.3,
  includeDakuten: true,
  includeYoon: true
}

describe('SettingsModal', () => {
  it('renders when open is true', () => {
    render(SettingsModal, {
      open: true,
      settings: defaultSettings,
      isGameActive: false,
      onClose: vi.fn(),
      onSettingChange: vi.fn()
    })
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('is not visible when open is false', () => {
    render(SettingsModal, {
      open: false,
      settings: defaultSettings,
      isGameActive: false,
      onClose: vi.fn(),
      onSettingChange: vi.fn()
    })
    // element stays in DOM but gets 'hidden' class (display:none via CSS)
    expect(document.getElementById('settings-modal')).toHaveClass('hidden')
  })

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn()
    render(SettingsModal, {
      open: true,
      settings: defaultSettings,
      isGameActive: false,
      onClose,
      onSettingChange: vi.fn()
    })
    await fireEvent.click(screen.getByRole('button', { name: /close settings/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows active game notice when isGameActive is true', () => {
    render(SettingsModal, {
      open: true,
      settings: defaultSettings,
      isGameActive: true,
      onClose: vi.fn(),
      onSettingChange: vi.fn()
    })
    expect(screen.getByText(/Your game is currently paused/)).toBeInTheDocument()
  })

  it('hides active game notice when isGameActive is false', () => {
    render(SettingsModal, {
      open: true,
      settings: defaultSettings,
      isGameActive: false,
      onClose: vi.fn(),
      onSettingChange: vi.fn()
    })
    expect(screen.queryByText(/Your game is currently paused/)).not.toBeInTheDocument()
  })

  it('calls onSettingChange with gameMode when game-mode select changes', async () => {
    const onSettingChange = vi.fn()
    render(SettingsModal, {
      open: true,
      settings: defaultSettings,
      isGameActive: false,
      onClose: vi.fn(),
      onSettingChange
    })
    const select = screen.getByLabelText('Game Mode') as HTMLSelectElement
    await fireEvent.change(select, { target: { value: GAME_MODE_PRACTICE } })
    expect(onSettingChange).toHaveBeenCalledWith({ gameMode: GAME_MODE_PRACTICE })
  })

  it('calls onSettingChange with kanaSet when kana-set select changes', async () => {
    const onSettingChange = vi.fn()
    render(SettingsModal, {
      open: true,
      settings: defaultSettings,
      isGameActive: false,
      onClose: vi.fn(),
      onSettingChange
    })
    const select = screen.getByLabelText('Kana Set') as HTMLSelectElement
    await fireEvent.change(select, { target: { value: KANA_SET_KATAKANA } })
    expect(onSettingChange).toHaveBeenCalledWith({ kanaSet: KANA_SET_KATAKANA })
  })

  it('calls onSettingChange with audioEnabled on toggle', async () => {
    const onSettingChange = vi.fn()
    render(SettingsModal, {
      open: true,
      settings: { ...defaultSettings, audioEnabled: true },
      isGameActive: false,
      onClose: vi.fn(),
      onSettingChange
    })
    const toggle = screen.getByRole('checkbox', { name: /sound effects/i })
    await fireEvent.change(toggle, { target: { checked: false } })
    expect(onSettingChange).toHaveBeenCalledWith({ audioEnabled: false })
  })

  it('calls onSettingChange with musicEnabled on toggle', async () => {
    const onSettingChange = vi.fn()
    render(SettingsModal, {
      open: true,
      settings: { ...defaultSettings, musicEnabled: false },
      isGameActive: false,
      onClose: vi.fn(),
      onSettingChange
    })
    const toggle = screen.getByRole('checkbox', { name: /background music/i })
    await fireEvent.change(toggle, { target: { checked: true } })
    expect(onSettingChange).toHaveBeenCalledWith({ musicEnabled: true })
  })

  it('calls onSettingChange with includeDakuten on toggle', async () => {
    const onSettingChange = vi.fn()
    render(SettingsModal, {
      open: true,
      settings: defaultSettings,
      isGameActive: false,
      onClose: vi.fn(),
      onSettingChange
    })
    const toggle = screen.getByRole('checkbox', { name: /dakuten/i })
    await fireEvent.change(toggle, { target: { checked: false } })
    expect(onSettingChange).toHaveBeenCalledWith({ includeDakuten: false })
  })

  it('calls onSettingChange with includeYoon on toggle', async () => {
    const onSettingChange = vi.fn()
    render(SettingsModal, {
      open: true,
      settings: defaultSettings,
      isGameActive: false,
      onClose: vi.fn(),
      onSettingChange
    })
    const toggle = screen.getByRole('checkbox', { name: /yōon/i })
    await fireEvent.change(toggle, { target: { checked: false } })
    expect(onSettingChange).toHaveBeenCalledWith({ includeYoon: false })
  })

  it('disables game settings controls when isGameActive is true', () => {
    render(SettingsModal, {
      open: true,
      settings: defaultSettings,
      isGameActive: true,
      onClose: vi.fn(),
      onSettingChange: vi.fn()
    })
    expect(screen.getByLabelText('Game Mode')).toBeDisabled()
    expect(screen.getByLabelText('Kana Set')).toBeDisabled()
  })

  it('calls onClose on Escape key when open', async () => {
    const onClose = vi.fn()
    render(SettingsModal, {
      open: true,
      settings: defaultSettings,
      isGameActive: false,
      onClose,
      onSettingChange: vi.fn()
    })
    await fireEvent.keyDown(window, { code: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not call onClose on Escape when closed', async () => {
    const onClose = vi.fn()
    render(SettingsModal, {
      open: false,
      settings: defaultSettings,
      isGameActive: false,
      onClose,
      onSettingChange: vi.fn()
    })
    await fireEvent.keyDown(window, { code: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })
})
