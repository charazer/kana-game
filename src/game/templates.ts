/**
 * UI Template utilities for generating consistent HTML structures
 * This module provides template functions to avoid hardcoded HTML strings
 * scattered throughout the codebase.
 */

import type { KanaEntry } from './types'
import { BASIC_KANA_IDS, DAKUTEN_KANA_IDS, YOON_KANA_IDS, GOJUON_COLUMNS, DAKUTEN_COLUMNS, YOON_COLUMNS } from './kana-constants'

/**
 * Button structure with left icon, label, and right keyboard shortcut
 */
export interface ButtonParts {
  leftIcon: string
  label: string
  rightKey: string
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
 * Creates a button's inner HTML structure with icon, label, and keyboard hint
 * @param parts - Button component parts
 * @returns HTML string for button content
 */
export function createButtonContent(parts: ButtonParts): string {
  return `<span class="btn-left">${parts.leftIcon}</span><span class="btn-label">${parts.label}</span><span class="btn-right"><kbd>${parts.rightKey}</kbd></span>`
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
 * @param emptyMessage - Message to show when no scores exist
 * @returns HTML string for high scores section
 */
export function createHighScoresList(
  entries: HighScoreEntry[],
  rankPrefix: string,
  emptyMessage: string = 'No scores yet!'
): string {
  if (entries.length === 0) {
    return `<h3>High Scores</h3><p style="color:rgba(255,255,255,0.4);font-size:14px;padding:8px;">${emptyMessage}</p>`
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
   * Creates a div element with specified class and content
   */
  createDiv(className: string, content?: string): HTMLDivElement {
    const div = document.createElement('div')
    div.className = className
    if (content) div.textContent = content
    return div
  },
  
  /**
   * Creates a span element with specified class and content
   */
  createSpan(className: string, content?: string): HTMLSpanElement {
    const span = document.createElement('span')
    span.className = className
    if (content) span.textContent = content
    return span
  },
  
  /**
   * Creates a button with structured content
   */
  createButton(parts: ButtonParts, className?: string): HTMLButtonElement {
    const button = document.createElement('button')
    if (className) button.className = className
    button.innerHTML = createButtonContent(parts)
    return button
  },
  
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
    leftIcon: '<img src="/assets/img/button_pause.png" alt="Pause" class="btn-icon">',
    label: 'Pause',
    rightKey: 'Space'
  },
  resume: {
    leftIcon: '<img src="/assets/img/button_play.png" alt="Resume" class="btn-icon">',
    label: 'Resume',
    rightKey: 'Space'
  },
  start: {
    leftIcon: '🎌',
    label: 'Start Game',
    rightKey: 'Enter'
  },
  restart: {
    leftIcon: '🔁',
    label: 'Play Again',
    rightKey: 'Enter'
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
  let html = `<div class="kana-section"><h3>${title}</h3>`
  
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
 * @param type - Type of kana ('hiragana' or 'katakana')
 * @returns HTML string for complete kana reference
 */
export function createKanaReference(kanaData: KanaEntry[], type: 'hiragana' | 'katakana'): string {
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
