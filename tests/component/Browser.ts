import { commands, type Locator } from 'vitest/browser';
import type { Commands } from './Commands.ts';

/** The commands' signatures in the browser: each without its context, returning a promise. */
type Client<T> = {
  [K in keyof T]: T[K] extends (context: never, ...args: infer A) => unknown
    ? (...args: A) => Promise<void>
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
