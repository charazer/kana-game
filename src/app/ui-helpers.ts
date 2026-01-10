/**
 * UI helper functions
 * Utilities for rendering UI components
 */

import { getHighScores } from '../game/storage/storage'
import { createHighScoresList, createKanaReference, type HighScoreEntry } from '../game/ui/templates'
import { HIGH_SCORE_LIST_START_INDEX, HIGH_SCORE_RANK_PREFIX, GAME_MODE_PRACTICE, type GameMode } from '../game/constants/constants'
import kanaHiragana from '../data/kana/hiragana.json'
import kanaKatakana from '../data/kana/katakana.json'
import type { KanaEntry } from '../game/core/types'
import { kanaContent } from './dom-elements'

/**
 * Renders high scores list to a container element
 */
export function renderHighScores(container: HTMLElement, gameMode: GameMode, highlightScore?: number) {
	const scores = getHighScores()

	// Transform scores into HighScoreEntry format
	const entries: HighScoreEntry[] = scores.map((entry, idx) => ({
		score: entry.score,
		date: entry.date,
		rank: idx + HIGH_SCORE_LIST_START_INDEX,
		highlight: highlightScore === entry.score
	}))

	// Use template utility to generate HTML
	container.innerHTML = createHighScoresList(entries, HIGH_SCORE_RANK_PREFIX, gameMode === GAME_MODE_PRACTICE)
}

/**
 * Renders kana reference table
 */
export function renderKanaReference(type: 'hiragana' | 'katakana') {
	const kanaData = (type === 'hiragana' ? kanaHiragana : kanaKatakana) as KanaEntry[]
	kanaContent.innerHTML = createKanaReference(kanaData)

	// Check for overflow and add scroll indicators
	requestAnimationFrame(() => {
		const sections = kanaContent.querySelectorAll('.kana-section')
		sections.forEach(section => {
			const table = section.querySelector('.kana-table')
			if (table) {
				const hasOverflow = table.scrollWidth > table.clientWidth
				if (hasOverflow) {
					section.classList.add('has-scroll')
				} else {
					section.classList.remove('has-scroll')
				}
			}
		})
	})
}

/**
 * Updates scroll indicators for kana reference tables
 */
export function updateKanaScrollIndicators() {
	const sections = kanaContent.querySelectorAll('.kana-section')
	sections.forEach(section => {
		const table = section.querySelector('.kana-table')
		if (table) {
			const hasOverflow = table.scrollWidth > table.clientWidth
			if (hasOverflow) {
				section.classList.add('has-scroll')
			} else {
				section.classList.remove('has-scroll')
			}
		}
	})
}
