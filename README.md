# Kana Game

A fast-paced browser game for learning Japanese Hiragana and Katakana characters. Type the correct romaji to clear falling kana tokens before they reach the danger zone!

## 🎮 Features

### Game Modes
- **Practice Mode** - Relaxed learning environment with slower speed and no lives system. Perfect for beginners getting familiar with kana characters.
- **Challenge Mode** - Challenge yourself with progressive difficulty, limited lives, and increasing speed. Test your skills and compete for high scores!

### Core Gameplay
- **Falling Tokens** - Kana characters descend down the screen. Type their romaji equivalents to clear them.
- **Smart Spawning** - Intelligent weighted selection ensures you see characters you haven't practiced recently more often.
- **Combo System** - Chain correct answers together for bonus score multipliers.
- **Progressive Difficulty** - In Challenge mode, speed gradually increases to keep you challenged.
- **Real-time Feedback** - Visual and audio cues for successes, misses, combos, and speed changes.

### Learning Features
- **Two Character Sets** - Practice Hiragana or Katakana independently
- **Multiple Romaji** - Accepts alternative romanizations (e.g., "shi"/"si", "tsu"/"tu")
- **Distributed Practice** - Weighted selection algorithm prioritizes characters you need to review

### Polish & Accessibility
- **High Score Tracking** - Compete with yourself across sessions with persistent top 10 scores
- **Responsive Design** - Optimized for desktop and mobile devices (320px-1920px)
- **Audio Feedback** - Distinct sounds for different game events (can be toggled on/off)
- **Smooth Animations** - GPU-accelerated rendering for 60fps gameplay

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser to `http://localhost:5173` (or the port shown in terminal)

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Testing

The project has comprehensive unit test coverage using Vitest.

Run unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage report:

```bash
npm run test:coverage
```

Open interactive test UI:

```bash
npm run test:ui
```

Run automated responsive testing across multiple screen sizes:

```bash
npm run test:responsive
```

## 🎯 How to Play

1. **Choose Your Settings** - Select your preferred kana set (Hiragana/Katakana) and game mode (Practice/Challenge)
2. **Start the Game** - Click the Start button when ready
3. **Type Romaji** - As kana tokens fall, type their romaji equivalents to clear them
4. **Build Combos** - Chain correct answers for score multipliers
5. **Survive** - In Challenge mode, don't let tokens reach the danger zone or you'll lose lives!

### Controls
- **Keyboard** - Type romaji characters (a-z)
- **Backspace** - Delete the last character in your input buffer
- **Pause Button** - Pause/resume the game at any time
- **End Game Button** - Stop the current game and return to the start screen

## 📊 Scoring System

- **Base Points** - Awarded for each correct match
- **Time Bonus** - Clear tokens faster for more points
- **Combo Multiplier** - Consecutive matches increase your score multiplier
- **High Scores** - Top 10 scores are saved locally with dates

## 🛠️ Technology Stack

- **TypeScript** - Type-safe game logic
- **Vite** - Fast dev server and optimized builds
- **Vanilla JS/DOM** - No framework dependencies, just native web APIs
- **Web Audio API** - Low-latency sound effects
- **CSS Transforms** - GPU-accelerated animations
- **LocalStorage** - Settings and high score persistence

## 🎨 Design Philosophy

- **Minimal & Fast** - Lightweight with no heavy dependencies
- **Accessible** - Keyboard-first design that works on all devices
- **Responsive** - Optimized layouts for mobile, tablet, and desktop
- **Maintainable** - Clean TypeScript with clear separation of concerns
- **Testable** - Modular architecture ready for unit tests

## 🔄 Development Status

This is an active project with core gameplay features complete. Current focus areas:
- Unit test coverage
- Additional accessibility features
- Optional voice samples for pronunciation

See [PLAN.md](./PLAN.md) for detailed development roadmap and implementation status.

## 📝 License

This project is open source and available under the MIT License.

---

Made with ❤️ for Japanese language learners
