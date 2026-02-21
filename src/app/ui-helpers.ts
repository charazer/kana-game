/**
 * UI helpers — high scores and kana reference rendering
 */

import { getHighScores } from '../game/storage/storage'
import { createHighScoresList, createKanaReference, type HighScoreEntry } from '../game/ui/templates'
import { GAME_MODE_PRACTICE, type GameMode } from '../game/constants/constants'
import kanaHiragana from '../data/kana/hiragana.json'
import kanaKatakana from '../data/kana/katakana.json'
import type { KanaEntry } from '../game/core/types'
import { kanaContent } from './dom-elements'

export function renderHighScores(container: HTMLElement, gameMode: GameMode, highlightScore?: number) {
	const entries: HighScoreEntry[] = getHighScores().map((entry, idx) => ({
		score: entry.score,
		date: entry.date,
		rank: idx + 1,
		highlight: highlightScore === entry.score
	}))
	container.innerHTML = createHighScoresList(entries, '#', gameMode === GAME_MODE_PRACTICE)
}

export function renderKanaReference(type: 'hiragana' | 'katakana') {
	const kanaData = (type === 'hiragana' ? kanaHiragana : kanaKatakana) as KanaEntry[]
	kanaContent.innerHTML = createKanaReference(kanaData)
	requestAnimationFrame(updateKanaScrollIndicators)
}

export function updateKanaScrollIndicators() {
	for (const section of kanaContent.querySelectorAll('.kana-section')) {
		const table = section.querySelector('.kana-table')
		if (table) section.classList.toggle('has-scroll', table.scrollWidth > table.clientWidth)
	}
}
