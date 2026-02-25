# Copilot Instructions — Kana Game

## Project Overview

**Kana Game** is a browser-based typing game for learning Japanese Hiragana and Katakana.
Players type romaji to clear falling kana tokens before they reach a danger zone.

- **Language / Runtime:** TypeScript (strict), Node.js ≥ 25
- **Bundler:** Vite 7 (`src/` is the root)
- **Unit tests:** Vitest 4 + happy-dom (coverage threshold: 90 % for lines/functions/branches/statements)
- **E2E tests:** Playwright (Chromium only, dev server on `http://localhost:5173`)
- **Linter:** ESLint 10 + typescript-eslint + Prettier (no standalone Prettier script — formatting is enforced via ESLint)
- **Module system:** ESM (`"type": "module"`)

---

## Repository Layout

```
src/
  main.ts                  # Application entry — wires everything together
  index.html               # Shell HTML
  app/                     # UI orchestration layer (DOM wiring, callbacks, settings)
    dom-elements.ts        # Typed references to every DOM element
    game-callbacks.ts      # Engine event handlers (score, lives, game-over, combo, speed)
    game-controls.ts       # Pause / end-game / restart control flow
    mobile-support.ts      # Mobile keyboard detection, viewport, touch focus
    modal-handlers.ts      # Settings / confirm-end modal open/close
    settings.ts            # Audio + game settings initialisation and persistence
    ui-helpers.ts          # Rendering helpers (high scores list, etc.)
  game/                    # Game logic — core is DOM-free, boundary modules may access browser APIs
    audio/                 # AudioManager + audio helpers (browser API boundary)
    constants/
      constants.ts         # All numeric/string game constants (single source of truth)
      kana-constants.ts    # Arrays of kana IDs grouped by type (basic, dakuten, yōon)
    core/
      engine.ts            # GameEngine class — the main game loop
      game-helpers.ts      # Pure helpers (token matching, key generation)
      matcher.ts           # Romaji matching logic
      types.ts             # Shared TypeScript types (KanaEntry, etc.)
    input/
      input.ts             # InputManager — keyboard event handling (browser API boundary)
    storage/
      storage.ts           # localStorage persistence (settings + high scores)
    ui/
      dom-helpers.ts       # Generic DOM utility functions (browser API boundary)
      renderer_dom.ts      # Renderer implementation (DOM token creation/update)
      templates.ts         # HTML string templates
  assets/
    css/                   # Modular CSS files
    audio/
  data/
    kana/
      hiragana.json        # Hiragana entries { id, kana, romaji[], type, audio? }
      katakana.json        # Katakana entries
e2e/
  *.spec.ts                # Playwright test files
  fixtures/
    selectors.ts           # Centralised CSS selectors (Selectors object)
    helpers.ts             # Reusable page helpers (navigateToGame, startGame, …)
```

---

## Key Concepts

### KanaEntry
```typescript
type KanaEntry = {
  id: string       // e.g. "ha", "ki_dakuten"
  kana: string     // Japanese character
  romaji: string[] // accepted romanisations, e.g. ["shi", "si"]
  type: 'hiragana' | 'katakana'
  audio?: string
}
```

### GameEngine
`GameEngine` (in `src/game/core/engine.ts`) is a class-based game loop driven by `requestAnimationFrame`.
It owns all mutable game state (tokens, score, lives, combo, speed) and communicates outward exclusively through typed callbacks:
- `onScore(score: number)`
- `onLivesChange(lives: number, previousLives?: number)`
- `onGameOver()`
- `onCombo?(combo: number)`
- `onSpeedChange?(multiplier: number)`

It depends on two injected interfaces:
- **`Renderer`** — all DOM rendering (token creation, positioning, flash, floating text, height query)
- **`InputManager`** — keyboard input subscription

### Game Modes
| Constant | Value | Description |
|---|---|---|
| `GAME_MODE_PRACTICE` | `'practice'` | No lives, slower speed, max 5 tokens |
| `GAME_MODE_CHALLENGE` | `'challenge'` | 3 lives, progressive difficulty (every 15 s by 8 % exponential) |

### Kana Sets
`KANA_SET_HIRAGANA`, `KANA_SET_KATAKANA`, `KANA_SET_MIXED` — controlled via settings; the engine filters `kanaSet` accordingly.

### Progressive Difficulty (Challenge only)
Dakuten characters unlock after 10 correct answers; yōon after 20. Speed increases every `SPEED_INCREASE_INTERVAL` seconds by `SPEED_BASE_EXPONENT ^ n`.

---

## Code Conventions

### TypeScript
- **Strict mode** is on — no `any` without explicit justification.
- Prefer `type` over `interface` for simple object shapes; use `interface` for extension-oriented contracts.
- Always use `import type` for type-only imports (`consistent-type-imports` ESLint rule is enforced).
- Unused variables/args are errors unless prefixed with `_`.
- All constants live in `src/game/constants/constants.ts`; never hardcode magic numbers inline.

### Naming
- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Test files: co-located with source files, same name with `.test.ts` suffix (e.g. `engine.ts` → `engine.test.ts`)

### Module Boundaries
- `src/game/core/**` and `src/game/constants/**` must remain **DOM-free** — no `document`, `window`, or `HTMLElement` references.
- `src/game/ui/`, `src/game/input/`, and `src/game/audio/` are **browser API boundary modules** — they may access `document`, `window`, `HTMLElement`, and Web Audio APIs as needed.
- All DOM interaction from the engine is delegated via the `Renderer` interface or `InputManager`.
- `src/app/` is the orchestration layer; it may import from `src/game/` but not vice-versa.

### CSS
- All CSS variables are defined in `src/assets/css/variables.css`.
- CSS is modular — each concern has its own file (`buttons.css`, `modals.css`, etc.).
- Imported via `src/assets/css/styles.css`.

---

## Testing Guidelines

### Unit Tests (Vitest)
- **Co-located** alongside source files (`*.test.ts`).
- Use `describe` blocks matching the module name.
- Use `vi.fn()` for mocks; use `vi.useFakeTimers()` / `vi.useRealTimers()` for timing-sensitive tests.
- GameEngine tests construct a full `mockRenderer` object and `InputManager` to exercise the engine without any real DOM.
- Coverage threshold is **90 %** across all metrics; do not reduce it.
- Test files are excluded from coverage: `main.ts`, `globals.d.ts`, `test-setup.ts`, `data/kana/**`, `**/types.ts`, `**/test-utils.ts`.

### E2E Tests (Playwright)
- Located in `e2e/*.spec.ts`.
- Always import selectors from `e2e/fixtures/selectors.ts` (`Selectors` object) — never hardcode selector strings in test files.
- Reuse page helpers from `e2e/fixtures/helpers.ts` (`navigateToGame`, `startGame`, `setGameMode`, `answerFirstToken`, `getFirstTokenId`, etc.).
- Tests run against the Vite dev server (`http://localhost:5173`); the server is started automatically by Playwright.
- Only Chromium is tested.
- When adding new selectors add them to `Selectors` first; when adding reusable page flows add them to `helpers.ts`.

---

## npm Scripts Reference

| Script | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server (`http://localhost:5173`) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run typecheck` | TypeScript check (no emit) |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run test` | All tests (unit + E2E) |
| `npm run test:unit` | Unit tests (single run) |
| `npm run test:unit:watch` | Unit tests (watch mode) |
| `npm run test:unit:coverage` | Unit tests with coverage report |
| `npm run test:unit:ui` | Unit tests with interactive UI |
| `npm run test:e2e` | E2E tests (headless) |
| `npm run test:e2e:ui` | E2E with Playwright UI mode |
| `npm run test:e2e:headed` | E2E tests (visible browser) |
| `npm run test:e2e:debug` | E2E with Playwright inspector |
| `npm run test:e2e:report` | View last E2E test report |

---

## Common Patterns

### Adding a new constant
1. Add it to `src/game/constants/constants.ts` with an explanatory comment.
2. Import it by name everywhere it is used — never reference the literal value.

### Adding a new kana character group
1. Add IDs to `src/game/constants/kana-constants.ts`.
2. Add entries to the relevant JSON file in `src/data/kana/`.
3. Add unlock logic to `GameEngine` if a threshold applies.

### Adding a new DOM element
1. Query it in `src/app/dom-elements.ts` and export a typed reference.
2. Add its CSS selector to `e2e/fixtures/selectors.ts`.

### Adding a new setting
1. Extend the settings type and default values in `src/game/storage/storage.ts`.
2. Wire the UI control in `src/app/settings.ts`.
3. Persist on change via `updateSetting(...)`.

### Adding a new engine callback
1. Declare the optional callback property on `GameEngine`.
2. Invoke it inside the engine at the right lifecycle point.
3. Wire the callback in `src/main.ts` and handle it in `src/app/game-callbacks.ts`.

---

## Constraints & Things to Avoid

- Do **not** access `document`/`window` from `src/game/core/**` or `src/game/constants/**` — inject via `Renderer` or `InputManager`. Browser API access is allowed in boundary modules (`src/game/ui/`, `src/game/input/`, `src/game/audio/`).
- Do **not** lower the 90 % coverage thresholds.
- Do **not** hardcode selector strings in E2E tests — always use `Selectors`.
- Do **not** add runtime dependencies (the project has zero `dependencies` in `package.json`).
- Do **not** use `console.log` — `console.warn` and `console.error` are allowed.
- Do **not** use `interface` for plain data shapes; prefer `type`.
- Do **not** use `var`; always `const` (or `let` when reassignment is required).
