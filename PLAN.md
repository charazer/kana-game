# Game plan

This document is the full design plan for a lightweight browser game to learn Japanese kana (Hiragana and Katakana). The goal is to build a minimal, well-tested, and maintainable TypeScript project that uses vanilla web APIs (DOM, Canvas, Web Audio, Web Animations) rather than a full game engine.

Overview
- Goal: Teach and reinforce recognition and typing of kana by having kana tokens appear/move on-screen and requiring the player to type the corresponding romaji (or input kana via IME) before the token expires or reaches a failure zone.
- Platform: Modern browsers on desktop and mobile (mobile experience will prefer touch controls and a simple on-screen keyboard fallback). Priority: desktop keyboard first.
- Language: TypeScript for logic, minimal HTML/CSS for UI, optional Canvas for performance.

Core gameplay (MVP)
- ✅ Tokens: Visual DOM elements displaying a single kana character. Properties: kana, romaji(s), id, position (x, y), velocity (60 px/sec base in Challenge mode, increases progressively; 40 px/sec constant in Practice mode), spawnTime.
- ✅ Mechanics: Tokens spawn at 0.9s intervals and move downward. Player types romaji to match tokens. Exact matches clear tokens and increment score with time bonus and combo multiplier.
- ✅ Weighted kana selection: Tokens are selected using weighted random based on recency (unseen kana strongly preferred, recently shown kana avoided).
- ✅ Failure: Token expiration at bottom boundary (80px danger zone) decrements lives in Challenge mode or just resets combo in Practice mode.
- ✅ Lives system: Player starts with 3 lives in Challenge mode, game ends when lives reach 0. No lives in Practice mode.
- ✅ Start screen: Manual game start with high scores display.
- ✅ Progressive difficulty: Speed increases 5% every 30 seconds in Challenge mode (capped at 2x base speed, 60→120 px/sec). No speed increase in Practice mode.
- ✅ Game Modes: Practice mode (slower, no lives, no speed increase, 5 max tokens) and Challenge mode (faster, lives, progressive difficulty, 8 max tokens).
- ✅ Scoring: Points calculated with base + time bonus, multiplied by combo multiplier (1 + combo * 0.05).
- ✅ Visual feedback: Floating text shows points/combo gains, life losses. Score/combo/lives displays animate on change. Green glow on success, red on miss.

Acceptance criteria for MVP
- ✅ Player can select Hiragana or Katakana set (dropdown in settings, persisted to localStorage).
- ✅ Player can select game mode: Practice (relaxed learning) or Challenge (challenge mode).
- ✅ Tokens spawn with weighted random selection favoring unseen/old kana (0.9s intervals, 40-120 px/sec depending on mode).
- ✅ Player input (romaji only) clears matching tokens; cleared token increments score with time bonus and combo multiplier.
- ✅ Visual feedback: Floating text shows points gained, combo multiplier, life losses, and speed increases at appropriate positions.
- ✅ Audio feedback: Distinct sounds for success, miss, life loss, speed increase, and game over.
- ✅ Tokens that reach the failure zone (80px danger zone) decrement lives in Challenge mode or just reset combo in Practice mode.
- ✅ Game over when lives reach 0 in Challenge mode. Practice mode continues indefinitely.
- ✅ UI shows score, combo (Nx multiplier), speed (X.Xx multiplier), lives (hearts in Challenge mode only), pause/resume button, and mode selector.
- ✅ Start screen with manual start button and high scores display.
- ✅ High score persistence in localStorage (top 10 scores with dates).
- ✅ Responsive layout optimized for mobile and desktop screens.

Data model
- Kana entry: { id: string, kana: string, romaji: string[], type: "hiragana"|"katakana", audio?: string, difficulty?: number }
- Token instance: { tokenId: string, kanaId: string, x: number, y: number, vx: number, vy: number, spawnAt: number, lifetime: number, state: "active"|"cleared"|"expired", createdFrame?: number }
- Game state: { mode, score, lives, timeLeft, activeTokens: Token[], inputBuffer: string, combo, level, rngSeed }
- Sets: curated subsets (basic 46, diacritics, digraphs, extras). Provide mapping files in JSON.

Input handling
- ✅ Primary input: romaji typed using physical keyboard (normalized to lowercase ASCII, matched against kana romaji arrays).
- ✅ UI: Input buffer echoed in prominent blue box (#input-echo element).
- ✅ Basic matching: `exactMatch` function in matcher.ts handles romaji matching.
- ✅ Partial match detection: `isPrefix` function exists but not yet wired to visual highlighting.
- ✅ Longest-prefix consumption: `longestRomajiMatch` function implemented with buffer consumption logic in handleCommit (matches at buffer start, consumes matched portion, chains remaining).
- ✅ Auto-commit: Matching happens on each keystroke, no Enter key required.
- ⏳ Candidate token highlighting: Not yet implemented (no visual feedback for partial matches while typing).
- ✅ Special keys: `Backspace` deletes last character from buffer.
- ⏳ Escape to pause not yet implemented (pause button works).

Game loop & timing
- ✅ Using `requestAnimationFrame` as the main loop for rendering and time-based updates with high-resolution time (performance.now()).
- ✅ Delta time (dt) passed into update functions for frame-rate independent behavior.
- ✅ Spawn logic: tokens spawn at 0.9 second intervals using accumulator-based timer with weighted random selection.
- ✅ Weighted selection: Kana are chosen based on recency - unseen kana get weight 10,000, recent (<5s) get weight 1, old (>30s) get weight 100.
- ✅ Current settings:
  - Challenge mode: spawnInterval = 0.9s, baseSpeed = 60 px/sec (progressive, no cap), max 8 tokens
  - Practice mode: spawnInterval = 0.9s, speed = 40 px/sec (constant), max 5 tokens
  - Token size = 72px, constrained to 900px centered area
- ✅ Token positioning: Smart spawn with collision avoidance (100px min distance) and edge detection to prevent cutoff
- ✅ Visual feedback: Green glow on correct match, red glow on missed token, visible danger zone at bottom (80px red gradient), blue flash on speed increase
- ✅ Progressive difficulty: Speed increases by 10% every 15 seconds in Challenge mode (no cap)
- ✅ Game time tracking: Total elapsed time tracked for speed scaling with smart change detection to avoid triggering on game start
- ✅ Collision/hit detection: tokens expire when reaching bottom of viewport (y >= failureY), triggering life loss in Challenge mode or just combo reset in Practice mode.
- ⏳ Touch interaction for mobile not yet implemented.

Rendering & animation strategy
- ✅ **DOM + CSS transforms** (IMPLEMENTED): Tokens rendered as absolutely-positioned DOM elements using CSS transforms for movement. Using GPU-friendly `transform: translate3d(...)` for smooth 60fps animation.
- ⏳ Canvas option: Not implemented (DOM renderer chosen for easier debugging and accessibility).
- ✅ Render layer abstracted via `Renderer` interface in engine.ts, allowing future swap to Canvas if needed.
- ✅ Current performance: Smooth animation with GPU acceleration, layout-affecting properties minimized.

Audio & assets
- ✅ Audio system implemented using Web Audio API for low-latency playback
- ✅ SFX sounds: Success (ascending notes C5+E5), Miss (descending sawtooth 200Hz), Combo (variable pitch square wave), Life Lost (descending sawtooth 440→220Hz), Speed Increase (upward arpeggio G4→B4→D5→G5), Game Over (descending arpeggio G4→F4→D4→C4)
- ✅ Audio toggle in settings (persisted to localStorage)
- ⏳ Voice samples for kana pronunciation not yet implemented
- ⏳ Background music not yet implemented

UI & screens
- ✅ Start screen: Game title, Start button, high scores display with top 10 scores.
- ✅ Settings bar: Game mode selector (Practice/Challenge), kana set selector (hiragana/katakana), audio toggle checkbox, integrated into compact gradient header.
- ✅ Gameplay HUD: Score display (green), combo display (purple, Nx format), speed display (blue, X.Xx format), lives display (red, hearts - hidden in Practice mode), pause/resume button (disabled until game starts).
- ✅ Game over screen: Final score, "New High Score" indicator (pulsing animation), high scores list with highlighting, Play Again button.
- ✅ Visual feedback: Floating text animations for points (+N), combo (Nx), life loss (💔 -1), and speed increase (SPEED UP! X.Xx). Stat displays pulse on updates, lives shake on loss, game area flashes blue on speed increase.
- ✅ Input display: Prominent blue box showing current input buffer with placeholder.
- ✅ Responsive layout: Optimized for desktop and mobile (320px-1920px), compact header on small screens, proper button sizing and alignment, setting items aligned consistently.
- ✅ Footer layout: Input display connected to game area with rounded bottom corners, no gap between sections.
- ⏳ Accessibility: high-contrast mode, adjustable font sizes, and screen-reader friendly semantics not yet implemented.

Persistence
- ✅ Settings and high scores stored in `localStorage` under namespace `kana-game:v1`.
- ✅ Implemented in `storage.ts` with loadSettings/saveSettings/getHighScores/addHighScore/isHighScore functions.
- ✅ Current persisted data: gameMode ('practice'|'challenge'), kanaSet ('hiragana'|'katakana'), highScores (array of {score, date} objects).
- ✅ Settings load on page boot, save on user changes (game mode, kana set selection).
- ✅ High score management: Automatically saves top 10 scores with dates, displays on start screen and game over screen.
- ✅ High score highlighting: New high scores are highlighted with pulsing animation and special indicator.

Testing & validation
- Unit tests: matcher logic (romaji ↔ kana), spawn/difficulty calculator, scoring & combo calculations, input buffer behavior.
- Integration tests: simulate sequences of inputs and token lifetimes to validate end-to-end gameplay logic (in Node w/ JSDOM or headless browser).
- Manual QA: cross-browser checks (Chrome, Safari, Firefox), and mobile check for touch + IME behaviors.

Development & build
- Tooling: ✅ Vite for fast dev server and bundling, TypeScript 5.0+ with strict mode enabled
- Scripts: ✅ `dev` (vite), ✅ `build` (vite build), ✅ `preview` (vite preview), ✅ `test:responsive` (Puppeteer automated responsive testing), `test` (unit tests - placeholder), `lint` (placeholder)
- Project layout (current structure):
	- src/
		- ✅ index.html (game structure with settings, game-area, HUD, speed display)
		- ✅ styles.css (responsive layout with media queries, dark theme, GPU transforms, mobile optimizations)
		- ✅ main.ts (boot & app lifecycle, settings wiring, audio integration)
		- game/
			- ✅ engine.ts (game loop, spawn timer, token updates, progressive difficulty with smart change detection)
			- ✅ renderer_dom.ts (DOM-based renderer with translate3d, floating text with 'speed' type)
			- ✅ input.ts (keyboard + IME input capture)
			- ✅ matcher.ts (romaji matching logic)
			- ✅ types.ts (TypeScript interfaces)
			- ✅ storage.ts (localStorage wrapper)
			- ✅ audio.ts (Web Audio API manager with all SFX including playSpeedIncrease)
			- ⏳ renderer_canvas.ts (not implemented - DOM renderer chosen)
			- ⏳ tokens.ts (not needed - token logic in engine.ts)
			- ⏳ scoring.ts (basic scoring in engine.ts, advanced not yet implemented)
			- ⏳ assets.ts (not yet implemented)
			- ⏳ ui.ts (basic UI in index.html, advanced not yet implemented)
		- data/
			- kana/
				- ✅ hiragana.json (71 entries)
				- ✅ katakana.json (71 entries)
	- ✅ package.json
	- ✅ tsconfig.json
	- ✅ vite.config.ts
	- ✅ PLAN.md
	- ✅ README.md
	- ✅ .gitignore
	- ✅ test-responsive.js (Puppeteer automated responsive testing)
	- ⏳ tests/ (unit tests not yet created)

Milestones & roadmap
1) ✅ Write the PLAN.md and curate basic kana JSON sets — COMPLETE
   - Full hiragana set (71 entries: basic 46 + dakuten/handakuten)
   - Full katakana set (71 entries: basic 46 + dakuten/handakuten)
   - Multiple romaji alternatives included (shi/si, chi/ti, tsu/tu, fu/hu, ji/zi, wo/o)

2) ✅ Implement core game loop, DOM renderer, and input capture — COMPLETE
   - GameEngine with requestAnimationFrame loop and delta time
   - DOMRenderer using translate3d transforms (GPU-accelerated)
   - InputManager with keyboard capture and IME support (compositionend)
   - Matcher module with exactMatch and longestRomajiMatch functions
   - Token spawn system with timer-based intervals (0.9s)
   - Token movement at 40 px/sec downward speed
   - Full viewport width (100vw) for spawn area
   - 72px token size for visibility

3) ✅ Add scoring, lives, combo system, and polish — COMPLETE
   - ✅ Advanced scoring with time bonus and combo multiplier
   - ✅ Settings UI (IME toggle checkbox, kana set dropdown with Japanese labels)
   - ✅ localStorage persistence for settings (imeEnabled, kanaSet, highScores)
   - ✅ Settings load/save on page lifecycle
   - ✅ Lives system (3 lives, game over at 0, visual feedback)
   - ✅ Combo/multiplier system (tracks consecutive matches, resets on miss)
   - ✅ High score persistence and display (top 10 scores with dates, highlighting)
   - ✅ Start screen with manual start button
   - ✅ Game over screen with final score and high scores
   - ✅ Pause/resume functionality
   - ✅ Progressive difficulty (speed increases over time)
   - ✅ Visual feedback (floating text, stat animations, token glows)

4) ✅ Add game modes and intelligent spawning — COMPLETE
   - ✅ Practice mode (40 px/sec constant, 5 max tokens, no lives, no speed increase)
   - ✅ Challenge mode (60+ px/sec progressive no cap, 8 max tokens, 3 lives, progressive difficulty)
   - ✅ Weighted kana selection based on recency (distributed practice)
   - ✅ Mode selector in settings with persistence
   - ✅ Lives display hidden in Practice mode
   - ✅ Speed display showing real-time multiplier

5) ✅ Add audio, responsive layout, and polish — COMPLETE
   - ✅ Web Audio API implementation with distinct sounds for all game events
   - ✅ Audio toggle in settings (persisted)
   - ✅ Speed increase sound (upward arpeggio G4→B4→D5→G5)
   - ✅ Prominent visual feedback for speed increases (floating text, screen flash)
   - ✅ Responsive layout optimized for mobile and desktop (320px-1920px)
   - ✅ Compact header on small screens with proper button alignment
   - ✅ Setting items aligned consistently across all resolutions
   - ✅ Footer layout with rounded corners connecting to game area
   - ✅ Automated responsive testing script (Puppeteer)
   - ✅ .gitignore file for project

6) ⏳ Polish and extend features — PENDING
   - ⏳ Voice samples for kana pronunciation (optional)
   - ⏳ Background music (optional)
   - ⏳ Visual feedback for partial matches not yet implemented
   - ⏳ Accessibility features not yet implemented
   - ⏳ Unit tests not yet implemented

7) ⏳ Deployment — PENDING
   - ⏳ Build + host on GitHub Pages
   - ⏳ Add contribution notes

Open questions / decisions to confirm
- Render choice: ✅ DOM+CSS selected (confirmed and implemented with translate3d transforms).
- IME-first flow: ✅ explicit IME toggle selected (confirmed and implemented with checkbox in settings).
- Kana sets to include by default: ✅ Complete 71-entry hiragana and katakana sets implemented (basic 46 + dakuten/handakuten).

## Current Implementation Status

### ✅ Completed Components
- **Project scaffold**: Vite + TypeScript configuration with dev/build/preview/test:responsive scripts, .gitignore file
- **Data layer**: 
  - `hiragana.json` - 71 entries with multiple romaji alternatives
  - `katakana.json` - 71 entries with multiple romaji alternatives
- **Core modules**:
  - `engine.ts` - Game loop with RAF, spawn timer (0.9s), token lifecycle, game mode support, lives system (Challenge mode), combo tracking, progressive speed (10% every 15s, no cap), game time tracking, weighted kana selection based on recency, smart speed change detection
  - `renderer_dom.ts` - DOM-based renderer with translate3d positioning, flashToken effects, showFloatingText for visual feedback including 'speed' type
  - `input.ts` - Keyboard input capture (romaji only), auto-commit on keystroke, backspace support
  - `matcher.ts` - exactMatch, isPrefix, longestRomajiMatch functions with buffer consumption
  - `types.ts` - KanaEntry type definition
  - `storage.ts` - localStorage wrapper with settings persistence (gameMode, kanaSet, audioEnabled), high score management (getHighScores, addHighScore, isHighScore)
  - `audio.ts` - Web Audio API manager with all SFX (playSuccess, playMiss, playCombo, playLifeLost, playSpeedIncrease, playGameOver)
- **UI**:
  - Start screen with high scores display and Start button
  - Settings bar with game mode selector (Practice/Challenge), kana set selector (Japanese labels), audio toggle checkbox, integrated into compact responsive gradient header
  - Game area (900px centered) with token container and danger zone visualization
  - HUD showing score (green), combo (purple, Nx), speed (blue, X.Xx), lives (red, hearts - hidden in Practice mode), pause/resume button (state-aware)
  - Game over screen with final score, "New High Score" indicator, high scores list with highlighting, Play Again button
  - Input echo display (prominent blue box)
  - Footer connected to game area with rounded bottom corners
- **Styling**: 
  - Responsive layout with media queries for 900px, 421-600px, 420px, and landscape orientation
  - Compact header on mobile with optimized padding and font sizes
  - Control buttons properly sized and centered on all resolutions
  - Setting items (select inputs and checkbox) aligned consistently
  - Dark theme (#0f1724 background) with accent colors (blue/green/purple/red)
  - GPU-friendly translate3d transforms for tokens
  - Floating text animations (points, combo, life loss, speed increase) with glow effects
  - Stat display animations (pulse for score/combo/speed, shake for lives)
  - Token success/miss glow animations (green/red box-shadow)
  - Screen flash effect for speed increases (blue inset box-shadow)
  - 80px danger zone with red gradient and dashed border
  - High score list with highlighting and scrolling
- **Game features**:
  - Two game modes: Practice (40 px/sec constant, 5 max tokens, no lives) and Challenge (60+ px/sec progressive no cap, 8 max tokens, 3 lives)
  - Weighted kana selection: unseen kana strongly preferred (weight 10,000), recent (<5s) avoided (weight 1), old (>30s) prioritized (weight 100)
  - Combo/multiplier system (1 + combo * 0.05)
  - Progressive difficulty in Challenge mode (speed +10% every 15s, no cap)
  - Real-time speed display with multiplier (X.Xx format)
  - Score calculation (base + time bonus) * combo multiplier
  - Pause/resume functionality (state-aware button)
  - Manual start screen
  - High score persistence (top 10 with dates)
  - Smart token positioning (collision avoidance, edge detection)
  - Longest-prefix romaji matching with buffer consumption and chaining
  - Recency tracking per kana for intelligent spawning
  - Audio toggle with persistence
  - Comprehensive audio feedback for all game events
  - Prominent speed increase notifications (floating text, screen flash, distinct sound)
- **Testing & tooling**:
  - Automated responsive testing with Puppeteer (test-responsive.js)
  - Screenshots captured at 6 resolutions (desktop/laptop/tablet/mobile-landscape/mobile-portrait/small-mobile)
  - Header size validation across all breakpoints

### 🚧 In Progress / Partially Complete
- None currently

### ⏳ Not Yet Started
- Voice samples for kana pronunciation (optional)
- Background music (optional)
- Mixed kana set (hiragana + katakana combined)
- Candidate token highlighting (visual feedback for partial matches while typing)
- Result/statistics screen (accuracy %, fastest clear time, etc.)
- Accessibility features (high contrast mode, screen reader support, font size adjustment)
- Unit tests (matcher logic, scoring, spawn behavior, weighted selection)
- Deployment configuration (GitHub Pages)

Next steps
- ✅ Confirm rendering choice and input preferences (DONE).
- ✅ Create initial kana JSON files and a minimal `index.html` scaffold (DONE).
- ✅ Implement the skeleton: `engine.ts`, `input.ts`, and a simple `renderer_dom.ts` to show tokens and accept typing (DONE).
- ✅ Implement longest-prefix romaji consumption in handleCommit (DONE)
- ✅ Add visual highlighting for success/failure with danger zone (DONE)
- ✅ Implement pause/resume functionality (DONE)
- ✅ Fix kana set selection to load katakana (DONE)
- ✅ Redesign header and settings (DONE)
- ✅ Improve token positioning with collision avoidance (DONE)
- ✅ Make input display prominent (DONE)
- ✅ Implement lives system and failure conditions (DONE)
- ✅ Add manual start screen (DONE)
- ✅ Implement combo/multiplier scoring (DONE)
- ✅ Add progressive difficulty (DONE)
- ✅ Add visual feedback for score/combo/lives (DONE)
- ✅ Wire high scores to UI with persistence (DONE)
- ✅ Add game modes (Practice/Challenge) with mode-specific settings (DONE)
- ✅ Implement weighted kana selection based on recency (DONE)
- ✅ Remove IME support (simplified to romaji-only input) (DONE)
- ✅ Increase speed and token limits (60 px/sec base, 8 max tokens in Challenge) (DONE)
- ✅ Fix pause button to be state-aware (disabled before game starts) (DONE)
- ✅ Add audio/SFX system with Web Audio API (DONE)
- ✅ Add responsive layout for mobile and desktop (DONE)
- ✅ Add speed display with real-time multiplier (DONE)
- ✅ Add prominent visual and audio feedback for speed increases (DONE)
- ✅ Fix responsive issues (button overflow, audio checkbox visibility, setting alignment) (DONE)
- ✅ Remove gap between game area and footer (DONE)
- ✅ Increase difficulty progression (10% every 15s, no cap) (DONE)
- ✅ Create .gitignore file (DONE)
- 🔜 Add unit tests for core logic
- 🔜 Implement accessibility features
- 🔜 Add voice samples for kana pronunciation (optional)
- 🔜 Deploy to GitHub Pages

Appendix: Matching rules
- Normalize romaji input to lowercase ASCII.
- Allow multiple romaji alternatives for characters (e.g., "shi"/"si", "tsu"/"tu") by including arrays on kana entries.
- Prefer longest-match behavior when consuming input buffer (e.g., if buffer "shi", match "shi" before "si").
- For kana input from IME (actual kana characters), match directly against the `kana` field in kana entries.

Appendix: Example kana JSON entry
{
	"id": "a",
	"kana": "あ",
	"romaji": ["a"],
	"type": "hiragana",
	"audio": "audio/a.ogg",
	"difficulty": 1
}

Appendix: Simple scoring formula
- base = 10
- timeBonus = clamp(Math.round((lifetime - elapsed)/lifetime * 10), 0, 10)
- comboMultiplier = 1 + (combo * 0.05)
- points = Math.round(base + timeBonus) * comboMultiplier

This plan is intended to be a living document. After you review it, we'll iterate on specifics and then begin implementing the TypeScript project.