import { type GameMode, type KanaSet } from './constants'

const STORAGE_KEY = 'kana-game:v1'

export type Settings = {
  kanaSet?: KanaSet
  gameMode?: GameMode
  audioEnabled?: boolean
  highScores?: Array<{score:number,date:string}>
}

export function loadSettings(): Settings{
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    if(!raw) return {}
    return JSON.parse(raw)
  }catch(e){
    console.warn('Failed to load settings', e)
    return {}
  }
}

export function saveSettings(s: Settings){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  }catch(e){
    console.warn('Failed to save settings', e)
  }
}

export function getHighScores(): Array<{score:number,date:string}>{
  const settings = loadSettings()
  return settings.highScores || []
}

export function addHighScore(score: number){
  // Don't save scores of 0
  if(score <= 0) return []
  
  const settings = loadSettings()
  const highScores = settings.highScores || []
  
  // Add new score
  highScores.push({
    score,
    date: new Date().toISOString()
  })
  
  // Sort by score descending and keep top 5
  highScores.sort((a, b) => b.score - a.score)
  settings.highScores = highScores.slice(0, 5)
  
  saveSettings(settings)
  return settings.highScores
}

export function isHighScore(score: number): boolean{
  // Scores of 0 or less are never high scores
  if(score <= 0) return false
  
  const highScores = getHighScores()
  if(highScores.length < 5) return true
  return score > highScores[highScores.length - 1].score
}
