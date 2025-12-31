import type { KanaEntry } from './types'

// Return true if buffer exactly matches kana or any romaji alternative
export function exactMatch(entry: KanaEntry, buffer: string){
  if(!buffer) return false
  if(entry.kana === buffer) return true
  return entry.romaji.some(r => r === buffer)
}

// Return whether buffer is a valid prefix of any romaji alternative
export function isPrefix(entry: KanaEntry, buffer: string){
  if(!buffer) return false
  return entry.romaji.some(r => r.startsWith(buffer))
}

// Choose longest romaji match from candidate entries given buffer
// Prefers matches at the start of the buffer for proper consumption
export function longestRomajiMatch(entries: KanaEntry[], buffer: string){
  let best: {entry: KanaEntry, romaji: string}|null = null
  
  // First, try to find matches that start at the beginning of the buffer
  for(const e of entries){
    for(const r of e.romaji){
      if(buffer.startsWith(r)){
        if(!best || r.length > best.romaji.length){
          best = { entry: e, romaji: r }
        }
      }
    }
  }
  
  // If no match at start, fall back to matches at the end (legacy behavior)
  if(!best){
    for(const e of entries){
      for(const r of e.romaji){
        if(buffer.endsWith(r)){
          if(!best || r.length > best.romaji.length){
            best = { entry: e, romaji: r }
          }
        }
      }
    }
  }
  
  return best
}
