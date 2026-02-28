# Kana Game

<p align="center">
  <img src="public/favicon/android-chrome-512x512.png" alt="Kana Game Logo" width="200" />
</p>

A fast-paced browser game for learning Japanese Hiragana and Katakana. Type romaji to clear falling kana tokens before they reach the danger zone.

## Features

- **Two Game Modes** - Practice (no lives, slower) or Challenge (progressive difficulty, limited lives)
- **Multiple Kana Sets** - Hiragana, Katakana, or Mixed
- **Character Toggles** - Enable/disable dakuten and yōon characters
- **Smart Spawning** - Weighted selection prioritises characters you haven't seen recently
- **Combo System** - Chain correct answers for score multipliers
- **Difficulty Scoring** - Score multipliers based on enabled character types (0.5x to 1.25x)
- **Alternative Romaji** - Accepts multiple romanisations (e.g., "shi"/"si", "tsu"/"tu")
- **High Scores** - Top 5 scores saved locally with dates
- **Responsive Design** - Works on mobile, tablet, and desktop (320px-1920px)
- **Audio Feedback** - Sound effects for game events (toggleable)

## Getting Started

### Prerequisites

- Node.js 25+ (recommended: use `.nvmrc` with `nvm use`)
- pnpm 10+ (`corepack enable` to activate)

### Installation

```bash
pnpm install
```

**For E2E testing:** Install Playwright browsers (one-time setup):

```bash
pnpm exec playwright install chromium
```

### Development

```bash
pnpm run dev
```

Open browser to `http://localhost:5173`

### Build

```bash
pnpm run build
```

Production files output to `dist/`

### Testing

```bash
# Run all tests
pnpm run test                # Run unit tests and E2E tests

# Unit tests
pnpm run test:unit           # Run tests
pnpm run test:unit:watch     # Watch mode
pnpm run test:unit:coverage  # Coverage report
pnpm run test:unit:ui        # Interactive UI

# End-to-end tests (requires: pnpm exec playwright install chromium)
pnpm run test:e2e            # Run E2E tests (headless)
pnpm run test:e2e:ui         # Run E2E tests with UI mode
pnpm run test:e2e:headed     # Run E2E tests in headed mode
pnpm run test:e2e:debug      # Debug E2E tests
pnpm run test:e2e:report     # View last test report

# Other checks
pnpm run typecheck           # TypeScript check
pnpm run lint                # ESLint check
pnpm run preview             # Preview production build
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
- Vitest (unit tests), Playwright (E2E tests)
- Vanilla JS/DOM (no framework dependencies)
- Web Audio API
- CSS Transforms (GPU-accelerated)
- LocalStorage (settings/scores persistence)
- ESLint (TypeScript/HTML/CSS)

---

Made with love for Japanese language learners by a fellow Japanese language learner 🇯🇵 ❤️
