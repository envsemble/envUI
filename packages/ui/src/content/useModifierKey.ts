'use client';

import { useHydrated } from '../internal/useHydrated.js';

/** The platform's modifier for shortcuts such as ⌘K or Ctrl+K. */
export interface ModifierKey {
  /**
   * The key's name in `aria-keyshortcuts` and `KeyboardEvent.getModifierState()`: `'Meta'` on
   * Apple platforms, `'Control'` elsewhere.
   */
  key: 'Meta' | 'Control';
  /** The key cap's text for Kbd: `'⌘'` or `'Ctrl'`. */
  label: '⌘' | 'Ctrl';
}

/** Whether the browser runs on an Apple platform, where the modifier is ⌘; false outside a browser. */
function isApplePlatform() {
  if (typeof navigator === 'undefined') return false;
  const { userAgentData } = navigator as Navigator & { userAgentData?: { platform?: string } };
  return /mac|iphone|ipad|ipod/i.test(userAgentData?.platform || navigator.platform || '');
}

const control: ModifierKey = { key: 'Control', label: 'Ctrl' };
const meta: ModifierKey = { key: 'Meta', label: '⌘' };

/**
 * The platform's modifier for shortcuts: ⌘ on Apple platforms, Ctrl elsewhere. The server and the
 * first render in the browser give Ctrl, so the markup hydrates; an Apple browser then renders ⌘.
 */
export function useModifierKey(): ModifierKey {
  return useHydrated() && isApplePlatform() ? meta : control;
}
