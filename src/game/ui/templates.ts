/**
 * UI Template utilities for generating consistent HTML structures
 * This module provides template functions to avoid hardcoded HTML strings
 * scattered throughout the codebase.
 */

import type { KanaEntry } from '../core/types'
import { BASIC_KANA_IDS, DAKUTEN_KANA_IDS, YOON_KANA_IDS, GOJUON_COLUMNS, DAKUTEN_COLUMNS, YOON_COLUMNS } from '../constants/kana-constants'

// Import image assets so Vite can process them
import buttonPauseImg from '../../assets/img/button_pause.png'
import buttonPlayImg from '../../assets/img/button_play.png'

/**
 * Button structure with label and icon
 */
interface ButtonParts {
  icon: string
  label: string
}

/**
 * High score entry data
 */
export interface HighScoreEntry {
  score: number
  date: string
  rank: number
  highlight?: boolean
}

/**
 * Creates a button's inner HTML structure with label and icon
 * @param parts - Button component parts
 * @returns HTML string for button content
 */
function createButtonContent(parts: ButtonParts): string {
  return `<span class="btn-icon-wrap">${parts.icon}</span><span class="btn-label">${parts.label}</span>`
}

/**
 * Creates the HTML structure for a single high score entry
 * @param entry - High score entry data
 * @param rankPrefix - Prefix for rank display (e.g., "#")
 * @returns HTML string for a high score entry
 */
export function createHighScoreEntry(entry: HighScoreEntry, rankPrefix: string): string {
  const date = new Date(entry.date).toLocaleDateString()
  const highlightClass = entry.highlight ? 'highlight' : ''
  
  return `<div class="high-score-entry ${highlightClass}">
    <span class="high-score-rank">${rankPrefix}${entry.rank}</span>
    <span class="high-score-value">${entry.score}</span>
    <span class="high-score-date">${date}</span>
  </div>`
}

/**
 * Creates the complete high scores list HTML
 * @param entries - Array of high score entries
 * @param rankPrefix - Prefix for rank display
 * @param isPracticeMode - Whether the game is in practice mode (hides scores)
 * @param emptyMessage - Message to show when no scores exist
 * @returns HTML string for high scores section
 */
export function createHighScoresList(
  entries: HighScoreEntry[],
  rankPrefix: string,
  isPracticeMode: boolean = false,
  emptyMessage: string = 'No scores yet!'
): string {
  if (isPracticeMode) {
    return `<h3>High Scores</h3><p class="high-score-message">High scores are not recorded in practice mode.</p>`
  }
  
  if (entries.length === 0) {
    return `<h3>High Scores</h3><p class="high-score-message">${emptyMessage}</p>`
  }
  
  const entriesHtml = entries
    .map(entry => createHighScoreEntry(entry, rankPrefix))
    .join('')
  
  return `<h3>High Scores</h3>${entriesHtml}`
}

/**
 * DOM builder utility functions for creating elements programmatically
 */
export const DOMBuilder = {
  /**
   * Updates button content while preserving button element
   */
  updateButton(button: HTMLButtonElement, parts: ButtonParts): void {
    button.innerHTML = createButtonContent(parts)
  }
}

/**
 * Predefined button configurations for common UI patterns
 */
export const ButtonTemplates = {
  pause: {
    icon: `<img src="${buttonPauseImg}" alt="Pause" class="btn-icon">`,
    label: 'Pause'
  },
  resume: {
    icon: `<img src="${buttonPlayImg}" alt="Resume" class="btn-icon">`,
    label: 'Resume'
  }
}

/**
 * Creates HTML for a single kana character item
 * @param kana - Kana entry data
 * @returns HTML string for kana item
 */
function createKanaItem(kana: KanaEntry): string {
  const romajiText = kana.romaji.join(' / ')
  return `
    <div class="kana-item">
      <div class="kana-char">${kana.kana}</div>
      <div class="kana-romaji">${romajiText}</div>
    </div>
  `
}

/**
 * Creates HTML for a kana section with title and items
 * @param kanaData - Array of kana entries
 * @param title - Section title
 * @param columns - Column structure for organizing kana (if undefined, uses grid layout)
 * @returns HTML string for kana section
 */
function createKanaSection(kanaData: KanaEntry[], title: string, columns?: string[][]): string {
  let html = `<div class="kana-section"><h3>${title}`
  
  // Add scroll hint for columnar layout
  if (columns) {
    html += ` <span class="kana-scroll-hint">(scroll →)</span>`
  }
  
  html += `</h3>`
  
  if (columns) {
    // Render as vertical columns (traditional table layout)
    html += `<div class="kana-table">`
    columns.forEach(column => {
      html += `<div class="kana-column">`
      column.forEach(id => {
        const kana = kanaData.find(k => k.id === id)
        if (kana) {
          html += createKanaItem(kana)
        }
      })
      html += `</div>`
    })
    html += `</div>`
  } else {
    // Render as grid (fallback for uncategorized kana)
    html += `<div class="kana-grid">`
    kanaData.forEach(kana => {
      html += createKanaItem(kana)
    })
    html += `</div>`
  }
  
  html += `</div>`
  return html
}

/**
 * Creates complete kana reference HTML for a specific type
 * @param kanaData - Full array of kana entries (hiragana or katakana)
 * @returns HTML string for complete kana reference
 */
export function createKanaReference(kanaData: KanaEntry[]): string {
  // Categorize kana
  const basicKana = kanaData.filter(k => BASIC_KANA_IDS.includes(k.id))
  const dakutenKana = kanaData.filter(k => DAKUTEN_KANA_IDS.includes(k.id))
  const yoonKana = kanaData.filter(k => YOON_KANA_IDS.includes(k.id))
  
  // Build HTML
  let html = ''
  if (basicKana.length > 0) {
    html += createKanaSection(basicKana, '基本 (Basic Kana)', GOJUON_COLUMNS)
  }
  if (dakutenKana.length > 0) {
    html += createKanaSection(dakutenKana, '濁音・半濁音 (Dakuten & Handakuten)', DAKUTEN_COLUMNS)
  }
  if (yoonKana.length > 0) {
    html += createKanaSection(yoonKana, '拗音 (Yoon)', YOON_COLUMNS)
  }
  
  return html
}
