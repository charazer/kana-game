import type { KanaEntry } from '../core/types'
import { BASIC_KANA_IDS, DAKUTEN_KANA_IDS, YOON_KANA_IDS } from '../constants/kana-constants'
import { GOJUON_COLUMNS, DAKUTEN_COLUMNS, YOON_COLUMNS } from './kana-tables'

import buttonPauseImg from '../../assets/img/button_pause.png'
import buttonPlayImg from '../../assets/img/button_play.png'

interface ButtonParts {
  icon: string
  label: string
}

export interface HighScoreEntry {
  score: number
  date: string
  rank: number
  highlight?: boolean
}

function buttonContent(parts: ButtonParts): string {
  return `<span class="btn-icon-wrap">${parts.icon}</span><span class="btn-label">${parts.label}</span>`
}

/** Updates a button's inner HTML while preserving the element */
export function updateButtonContent(button: HTMLButtonElement, parts: ButtonParts): void {
  button.innerHTML = buttonContent(parts)
}

export const ButtonTemplates = {
  pause: {
    icon: `<img src="${buttonPauseImg}" alt="Pause" class="btn-icon">`,
    label: 'Pause'
  },
  resume: {
    icon: `<img src="${buttonPlayImg}" alt="Resume" class="btn-icon">`,
    label: 'Resume'
  }
} as const

export function createHighScoreEntry(entry: HighScoreEntry, rankPrefix: string): string {
  const date = new Date(entry.date).toLocaleDateString()
  return `<div class="high-score-entry ${entry.highlight ? 'highlight' : ''}">
    <span class="high-score-rank">${rankPrefix}${entry.rank}</span>
    <span class="high-score-value">${entry.score}</span>
    <span class="high-score-date">${date}</span>
  </div>`
}

export function createHighScoresList(
  entries: HighScoreEntry[],
  rankPrefix: string,
  isPracticeMode = false,
  emptyMessage = 'No scores yet!'
): string {
  if (isPracticeMode) {
    return `<h3>High Scores</h3><p class="high-score-message">High scores are not recorded in practice mode.</p>`
  }
  if (entries.length === 0) {
    return `<h3>High Scores</h3><p class="high-score-message">${emptyMessage}</p>`
  }
  return `<h3>High Scores</h3>${entries.map(e => createHighScoreEntry(e, rankPrefix)).join('')}`
}

function kanaItem(kana: KanaEntry): string {
  return `<div class="kana-item"><div class="kana-char">${kana.kana}</div><div class="kana-romaji">${kana.romaji.join(' / ')}</div></div>`
}

function kanaSection(kanaData: KanaEntry[], title: string, columns?: string[][]): string {
  const scrollHint = columns ? ' <span class="kana-scroll-hint">(scroll →)</span>' : ''
  let content: string

  if (columns) {
    content = `<div class="kana-table">${columns.map(col =>
      `<div class="kana-column">${col.map(id => {
        const k = kanaData.find(e => e.id === id)
        return k ? kanaItem(k) : ''
      }).join('')}</div>`
    ).join('')}</div>`
  } else {
    content = `<div class="kana-grid">${kanaData.map(kanaItem).join('')}</div>`
  }

  return `<div class="kana-section"><h3>${title}${scrollHint}</h3>${content}</div>`
}

export function createKanaReference(kanaData: KanaEntry[]): string {
  const basic = kanaData.filter(k => BASIC_KANA_IDS.includes(k.id))
  const dakuten = kanaData.filter(k => DAKUTEN_KANA_IDS.includes(k.id))
  const yoon = kanaData.filter(k => YOON_KANA_IDS.includes(k.id))

  let html = ''
  if (basic.length) html += kanaSection(basic, '基本 (Basic Kana)', GOJUON_COLUMNS)
  if (dakuten.length) html += kanaSection(dakuten, '濁音・半濁音 (Dakuten & Handakuten)', DAKUTEN_COLUMNS)
  if (yoon.length) html += kanaSection(yoon, '拗音 (Yoon)', YOON_COLUMNS)
  return html
}
