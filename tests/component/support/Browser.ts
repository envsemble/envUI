import { onTestFinished, vi } from 'vitest';
import { commands, type Locator } from 'vitest/browser';
import type { Commands } from './Commands.ts';

/**
 * The commands' signatures in the browser: each without its context, returning a promise of what
 * it returns, or of nothing where it declares no return value (any).
 */
type Client<T> = {
  [K in keyof T]: T[K] extends (context: never, ...args: infer A) => infer R
    ? (...args: A) => Promise<0 extends 1 & R ? void : Awaited<R>>
    : never;
};

declare module 'vitest/browser' {
  // The commands Commands.ts defines, as the tests call them.
  interface BrowserCommands extends Client<Commands> {}
}

type Target = Element | Locator;

const elementOf = (target: Target) => (target instanceof Element ? target : target.element());

/** An element's box in the frame's CSS pixels, as Playwright's boundingBox() gives it. */
export function box(target: Target) {
  const { x, y, width, height } = elementOf(target).getBoundingClientRect();
  return { x, y, width, height };
}

/** A computed style property of an element, or of one of its pseudo-elements. */
export function css(target: Target, property: string, pseudo?: string) {
  return getComputedStyle(elementOf(target), pseudo).getPropertyValue(property).trim();
}

/** The mouse, at points in the frame's CSS pixels, as a person moves it. */
export const mouse = {
  move: (x: number, y: number, options?: { steps?: number }) =>
    commands.mouseMove(x, y, options?.steps),
  down: (options?: { button?: 'left' | 'right' | 'middle' }) => commands.mouseDown(options?.button),
  up: (options?: { button?: 'left' | 'right' | 'middle' }) => commands.mouseUp(options?.button),
  click: (
    x: number,
    y: number,
    options?: { button?: 'left' | 'right' | 'middle'; clickCount?: number },
  ) => commands.mouseClick(x, y, options),
  dblclick: (x: number, y: number) => commands.mouseClick(x, y, { clickCount: 2 }),
  wheel: (deltaX: number, deltaY: number) => commands.mouseWheel(deltaX, deltaY),
};

/** The keyboard, its keys named as Playwright's keyboard names them, such as `Shift+Tab`. */
export const keyboard = {
  press: (key: string) => commands.keyPress(key),
  down: (key: string) => commands.keyDown(key),
  up: (key: string) => commands.keyUp(key),
  type: (text: string) => commands.keyType(text),
};

/** Waits two animation frames, past the one in which a component reacts to what just happened. */
export function nextFrames() {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

/**
 * Stops the page's timers until the test ends or `vi.useRealTimers()`, so a component's delay
 * passes only as far as `passTime` moves it, however slow the machine. Frames, transitions and the
 * times events carry run as they do. `performance` and `Date` stop performance.now() and the date
 * too, for a component that times by them.
 */
export function stopTimers(...more: ('performance' | 'Date')[]) {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', ...more] });
  onTestFinished(() => void vi.useRealTimers());
}

/**
 * Waits real time, only for what the browser times itself and no stopped clock moves: the times
 * events carry, the performance.now() a component reads as it opens, the frames of a motion.
 * Anything a component times with setTimeout takes stopTimers and passTime instead.
 */
export function waitOnRealTime(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/** Moves the stopped timers on, then waits the frames in which React renders what they changed. */
export async function passTime(milliseconds: number) {
  await vi.advanceTimersByTimeAsync(milliseconds);
  await nextFrames();
}

/** Waits until an element's animations, and its descendants' with `subtree`, have finished. */
export async function animationsDone(target: Target, subtree = false) {
  await Promise.allSettled(
    elementOf(target)
      .getAnimations({ subtree })
      .map((a) => a.finished),
  );
}

/**
 * Whether a locator's element is in the page and shows, as Playwright's toBeVisible reads it: a
 * box of some size, not visibility: hidden. Absent, it doesn't show.
 */
export function shown(locator: Locator) {
  const element = locator.query();
  if (!element) return false;
  const { width, height } = element.getBoundingClientRect();
  return width > 0 && height > 0 && getComputedStyle(element).visibility !== 'hidden';
}

let collected: string[] | undefined;
const consoleError = console.error;

/**
 * The errors the page reports from now on, as a list that fills while the test runs: console
 * errors, such as React's. Uncaught exceptions fail any test already.
 */
export function collectErrors() {
  const errors: string[] = [];
  collected = errors;
  console.error = (...args: unknown[]) => {
    errors.push(args.map(String).join(' '));
    consoleError(...args);
  };
  return errors;
}

/** Stops collecting errors, as each test ends (Setup.ts). */
export function stopCollectingErrors() {
  if (!collected) return;
  console.error = consoleError;
  collected = undefined;
}

/** Adds a style sheet to the page for the rest of the test. */
export function addStyle(content: string) {
  const style = document.createElement('style');
  style.dataset.testStyle = '';
  style.textContent = content;
  document.head.append(style);
}

/**
 * Stands in for the clipboard until the test ends, and returns the texts written to it, in order,
 * with the rejections no one handled. `available`: the Clipboard API writes; `selection`: copying a
 * selection works, as the fallback where the API is missing; `neither`: nothing can be copied;
 * `refused`: the Clipboard API refuses every write at once.
 */
export function recordClipboard(mode: 'available' | 'selection' | 'neither' | 'refused') {
  const writes: string[] = [];
  const unhandled: string[] = [];
  const onUnhandled = (event: PromiseRejectionEvent) => unhandled.push(String(event.reason));
  addEventListener('unhandledrejection', onUnhandled);
  const refuse = () => Promise.reject(new DOMException('Write refused', 'NotAllowedError'));
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value:
      mode === 'available'
        ? {
            writeText: async (text: string) => void writes.push(text),
            write: async (items: ClipboardItem[]) => {
              for (const item of items)
                writes.push(await (await item.getType('text/plain')).text());
            },
          }
        : mode === 'refused'
          ? { writeText: refuse, write: refuse }
          : undefined,
  });
  document.execCommand = (command: string) => {
    if (command !== 'copy' || mode !== 'selection') return false;
    const field = document.activeElement as HTMLTextAreaElement;
    writes.push(field.value.slice(field.selectionStart, field.selectionEnd));
    return true;
  };
  onTestFinished(() => {
    removeEventListener('unhandledrejection', onUnhandled);
    // The own properties go, and the browser's own clipboard and execCommand show through again.
    delete (navigator as { clipboard?: unknown }).clipboard;
    delete (document as { execCommand?: unknown }).execCommand;
  });
  return { writes, unhandled };
}

/**
 * How much of an element shows in the viewport, from 0 to 1, clipped by the ancestors that scroll
 * it, as Playwright's toBeInViewport reads it.
 */
export function viewportRatio(target: Target) {
  return new Promise<number>((resolve) => {
    const observer = new IntersectionObserver(([entry]) => {
      observer.disconnect();
      resolve(entry!.intersectionRatio);
    });
    observer.observe(elementOf(target));
  });
}
