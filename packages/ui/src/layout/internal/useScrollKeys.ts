'use client';

import { useEffect } from 'react';
import { optionModule } from '../../internal/react/useOptionModule.js';
import type { createScrollKeys, ScrollKey } from './scrollKeys.js';

/** The code that scrolls the region, which only a Scaffold with scroll="body" loads. */
const scrollKeysModule = optionModule(() => import('./scrollKeys.js'));

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
 * then on, so the listeners keep that order. Until it has loaded, the keys and the pointer's
 * presses are kept for it, in order, and it scrolls for the keys as it arrives, each where the
 * pointer had last pressed before it: the region would take them, so their default scrolls nothing
 * meanwhile. Where it fails to load, the keys stay with the browser.
 */
export function useScrollKeys(root: HTMLElement | null, scroller: HTMLElement | null) {
  useEffect(() => {
    const view = root?.ownerDocument.defaultView;
    if (!root || !scroller || !view) return;
    let keys: ReturnType<typeof createScrollKeys> | null = null;
    /** The keys and the presses' targets that wait for the code, in order. */
    let waiting: ({ key: ScrollKey } | { press: EventTarget | null })[] = [];
    let mounted = true;
    const onKeyDown = (event: KeyboardEvent) => {
      if (keys) keys.keyDown(event);
      else {
        // An event's path and whether the page took it are gone once it has been dispatched.
        const { key, shiftKey, altKey, ctrlKey, metaKey, repeat, isComposing } = event;
        const path = event.composedPath();
        waiting.push({
          key: {
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
          },
        });
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.composedPath()[0] ?? null;
      if (keys) keys.press(target);
      else waiting.push({ press: target });
    };
    // Presses are noted before the page handles them, without delaying them.
    const early = { capture: true, passive: true };
    const stopListening = () => {
      view.removeEventListener('keydown', onKeyDown);
      view.removeEventListener('pointerdown', onPointerDown, early);
    };
    view.addEventListener('keydown', onKeyDown);
    view.addEventListener('pointerdown', onPointerDown, early);
    scrollKeysModule.load().then(
      (module) => {
        if (!mounted) return;
        keys = module.createScrollKeys(root, scroller, view);
        for (const each of waiting) {
          if ('key' in each) keys.keyDown(each.key);
          else keys.press(each.press);
        }
        waiting = [];
      },
      () => {
        stopListening();
        waiting = [];
      },
    );
    return () => {
      mounted = false;
      stopListening();
      keys?.stop();
    };
  }, [root, scroller]);
}
