// Setup file for vitest tests
// 
// NOTE: This file provides a localStorage mock that may be needed in certain environments.
// In Node.js v25+, neither happy-dom nor jsdom properly expose localStorage, causing
// "localStorage.clear is not a function" errors. This mock ensures consistent behavior
// across all Node.js versions.
//
// On older Node versions (v18, v20, v22), the test environments typically provide
// localStorage automatically, so this setup may not be strictly necessary but doesn't hurt.

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

// Set up localStorage mock
globalThis.localStorage = new LocalStorageMock()
