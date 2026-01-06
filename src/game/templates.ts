/**
 * UI Template utilities for generating consistent HTML structures
 * This module provides template functions to avoid hardcoded HTML strings
 * scattered throughout the codebase.
 */

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
    leftIcon: '⏸️',
    label: 'Pause',
    rightKey: 'Space'
  },
  resume: {
    leftIcon: '▶️',
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
