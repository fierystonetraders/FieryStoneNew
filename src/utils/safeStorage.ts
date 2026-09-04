/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// localStorage can throw synchronously — not just return null — when a browser
// blocks all site data/cookies (Safari "Block All Cookies", strict private
// browsing, some in-app browsers). An unguarded call inside a useState
// initializer then crashes the whole render before anything mounts, and with
// no ErrorBoundary to catch it that's a permanently blank white page. Every
// localStorage access in the app should go through here instead.

export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage blocked, full, or unavailable — no-op
  }
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage blocked or unavailable — no-op
  }
}
