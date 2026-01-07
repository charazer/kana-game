# Kana Game

A fast-paced browser game for learning Japanese Hiragana and Katakana. Type romaji to clear falling kana tokens before they reach the danger zone.

## Features

- **Two Game Modes** - Practice (no lives, slower) or Challenge (progressive difficulty, limited lives)
- **Multiple Kana Sets** - Hiragana, Katakana, or Mixed
- **Character Toggles** - Enable/disable dakuten and yōon characters
- **Smart Spawning** - Weighted selection prioritizes characters you haven't seen recently
- **Combo System** - Chain correct answers for score multipliers
- **Difficulty Scoring** - Score multipliers based on enabled character types (0.5x to 1.25x)
- **Alternative Romaji** - Accepts multiple romanizations (e.g., "shi"/"si", "tsu"/"tu")
- **High Scores** - Top 10 scores saved locally with dates
- **Responsive Design** - Works on mobile, tablet, and desktop (320px-1920px)
- **Audio Feedback** - Sound effects for game events (toggleable)

## Getting Started

### Prerequisites
Node.js 16+ and npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Open browser to `http://localhost:5173`

### Build
```bash
npm run build
```
Production files output to `dist/`

### Testing
```bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run test:ui       # Interactive UI
npm run typecheck     # TypeScript check
npm run lint          # ESLint check
```

## How to Play

1. Choose kana set (Hiragana/Katakana/Mixed) and game mode (Practice/Challenge)
2. Configure character types (dakuten/yōon) in settings
3. Type romaji as kana tokens fall
4. Build combos for score multipliers
5. In Challenge mode, don't let tokens reach the danger zone

**Controls:** Type a-z, Backspace to delete, Pause/End buttons

## Scoring

- Base points per match
- Time bonus for faster clears
- Combo multiplier for consecutive matches
- Difficulty multiplier (0.5x-1.25x based on enabled character types)

## Tech Stack

- TypeScript, Vite
- Vanilla JS/DOM (no framework dependencies)
- Web Audio API
- CSS Transforms (GPU-accelerated)
- LocalStorage (settings/scores persistence)
- Vitest (98.78% test coverage)
- ESLint (TypeScript/HTML/CSS)

---

Made for Japanese language learners
