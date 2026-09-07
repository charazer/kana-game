// Setup file for vitest tests
//
// NOTE: happy-dom's own `localStorage` is a Proxy whose traps break `vi.spyOn`
// (restoring a spied method silently leaves the mock in place, leaking across
// tests). Replacing it with a plain class instance keeps spying/restoring
// predictable.

class LocalStorageMock implements Storage {
  private store: Record<string, string> = {}

  get length(): number {
    return Object.keys(this.store).length
  }

  clear(): void {
    this.store = {}
  }

  getItem(key: string): string | null {
    return this.store[key] || null
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store)
    return keys[index] || null
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  setItem(key: string, value: string): void {
    this.store[key] = value
  }
}

// `globalThis` is happy-dom's GlobalWindow, where `localStorage` is an
// accessor with no setter, so plain assignment throws — redefine it instead.
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  writable: true,
  value: new LocalStorageMock()
})

import '@testing-library/jest-dom/vitest'
