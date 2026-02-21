import { type GameMode, type KanaSet } from '../constants/constants'

const STORAGE_KEY = 'kana-game:v1'

export type Settings = {
  kanaSet?: KanaSet
  gameMode?: GameMode
  audioEnabled?: boolean
  musicEnabled?: boolean
  musicVolume?: number
  includeDakuten?: boolean
  includeYoon?: boolean
  highScores?: HighScoreRecord[]
}

type HighScoreRecord = { score: number; date: string }

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch (e) {
    console.warn('Failed to load settings', e)
    return {}
  }
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch (e) {
    console.warn('Failed to save settings', e)
  }
}

/** Load settings, apply a partial update, and save back */
export function updateSetting(patch: Partial<Settings>) {
  const s = loadSettings()
  saveSettings({ ...s, ...patch })
}

export function getHighScores(): HighScoreRecord[] {
  return loadSettings().highScores ?? []
}

export function addHighScore(score: number): HighScoreRecord[] {
  if (score <= 0) return []

  const settings = loadSettings()
  const highScores = [...(settings.highScores ?? []), { score, date: new Date().toISOString() }]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  saveSettings({ ...settings, highScores })
  return highScores
}

export function isHighScore(score: number): boolean {
  if (score <= 0) return false
  const highScores = getHighScores()
  return highScores.length < 5 || score > highScores[highScores.length - 1].score
}
