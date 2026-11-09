'use client';

import { useEffect } from 'react';
import type { createScrollKeys, ScrollKey } from './scrollKeys.js';

/** The code that scrolls the region, which only a Scaffold with scroll="body" loads. */
let loading: Promise<{ createScrollKeys: typeof createScrollKeys }> | undefined;
const loadScrollKeys = () => (loading ??= import('./scrollKeys.js'));

/**
 * Where a region below a title bar scrolls instead of the document, the keyboard scrolls it as a
 * browser scrolls a page: Page Up and Page Down, Space and Shift+Space, Home, End and the up and
 * down arrows. With focus in the region the browser scrolls it; these keys come from the document
 * and from controls outside the region that leave the key alone. Fields, widgets that use the keys,
 * media controls, elements that hold focus out of sight (web components, or any element with a
 * closed shadow root), anything that scrolls that way itself and keys that the page handled first
 * keep them; with focus on the document, so does an
 * area that scrolls where the pointer last pressed, as browsers scroll that area. As in the
 * browser, quick presses add up and a held key repeats at once.
 *
 * The keys are heard on the window, after the page's elements and its document: a handler there
 * that calls preventDefault keeps its key, as does a window listener added before the region
 * mounts. A window listener added later hears the key after this one.
 *
 * The code that scrolls starts loading as the region mounts, and the window hears the keys from
 * then on, so the listeners keep that order. Until it has loaded, the keys and where the pointer
 * presses are kept for it, and it scrolls for them as it arrives: the region would take them, so
 * their default scrolls nothing meanwhile.
 */
export function useScrollKeys(root: HTMLElement | null, scroller: HTMLElement | null) {
  useEffect(() => {
    const view = root?.ownerDocument.defaultView;
    if (!root || !scroller || !view) return;
    let keys: ReturnType<typeof createScrollKeys> | null = null;
    let pressed: EventTarget | null = null;
    let waiting: ScrollKey[] = [];
    let mounted = true;
    const onKeyDown = (event: KeyboardEvent) => {
      if (keys) keys.keyDown(event);
      else {
        // An event's path and whether the page took it are gone once it has been dispatched.
        const { key, shiftKey, altKey, ctrlKey, metaKey, repeat, isComposing } = event;
        const path = event.composedPath();
        waiting.push({
          key,
          shiftKey,
          altKey,
          ctrlKey,
          metaKey,
          repeat,
          isComposing,
          defaultPrevented: event.defaultPrevented,
          composedPath: () => path,
          preventDefault() {},
        });
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (keys) keys.pointerDown(event);
      else pressed = event.composedPath()[0] ?? null;
    };
    // Presses are noted before the page handles them, without delaying them.
    const early = { capture: true, passive: true };
    view.addEventListener('keydown', onKeyDown);
    view.addEventListener('pointerdown', onPointerDown, early);
    void loadScrollKeys().then((module) => {
      if (!mounted) return;
      keys = module.createScrollKeys(root, scroller, view, pressed);
      for (const key of waiting) keys.keyDown(key);
      waiting = [];
    });
    return () => {
      mounted = false;
      view.removeEventListener('keydown', onKeyDown);
      view.removeEventListener('pointerdown', onPointerDown, early);
      keys?.stop();
    };
  }, [root, scroller]);
}
