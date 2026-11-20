'use client';

import { useEffect } from 'react';
import { optionModule } from '../../../internal/react/useOptionModule.js';
import type { createScrollKeys, ScrollKey } from './scrollKeys.js';

const scrollKeysModule = optionModule(() => import('./scrollKeys.js'));

function keepBeyondDispatch(event: KeyboardEvent): ScrollKey {
  const { key, shiftKey, altKey, ctrlKey, metaKey, repeat, isComposing } = event;
  const path = event.composedPath();
  return {
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
  };
}

/**
 * Where a region below a title bar scrolls instead of the document, the keyboard scrolls it as a
 * browser scrolls a page: Page Up and Page Down, Space and Shift+Space, Home, End and the up and
 * down arrows, from the document and from controls outside the region that leave the key alone.
 * The keys are heard on the window, after the page's own handlers. Until the code that scrolls has
 * loaded, the keys and the pointer's presses are kept, and it scrolls for them in order as it
 * arrives; where it fails to load, the keys stay with the browser.
 */
export function useScrollKeys(root: HTMLElement | null, scroller: HTMLElement | null) {
  useEffect(() => {
    const view = root?.ownerDocument.defaultView;
    if (!root || !scroller || !view) return;
    let keys: ReturnType<typeof createScrollKeys> | null = null;
    let keptUntilCodeLoads: ({ key: ScrollKey } | { press: EventTarget | null })[] = [];
    let mounted = true;
    const onKeyDown = (event: KeyboardEvent) => {
      if (keys) keys.keyDown(event);
      else keptUntilCodeLoads.push({ key: keepBeyondDispatch(event) });
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.composedPath()[0] ?? null;
      if (keys) keys.press(target);
      else keptUntilCodeLoads.push({ press: target });
    };
    const beforePageHandlesItWithoutDelay = { capture: true, passive: true };
    const stopListening = () => {
      view.removeEventListener('keydown', onKeyDown);
      view.removeEventListener('pointerdown', onPointerDown, beforePageHandlesItWithoutDelay);
    };
    view.addEventListener('keydown', onKeyDown);
    view.addEventListener('pointerdown', onPointerDown, beforePageHandlesItWithoutDelay);
    scrollKeysModule.load().then(
      (module) => {
        if (!mounted) return;
        keys = module.createScrollKeys(root, scroller, view);
        for (const each of keptUntilCodeLoads) {
          if ('key' in each) keys.keyDown(each.key);
          else keys.press(each.press);
        }
        keptUntilCodeLoads = [];
      },
      () => {
        stopListening();
        keptUntilCodeLoads = [];
      },
    );
    return () => {
      mounted = false;
      stopListening();
      keys?.stop();
    };
  }, [root, scroller]);
}
