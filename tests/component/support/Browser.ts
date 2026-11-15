import { onTestFinished, vi } from 'vitest';
import { commands, type Locator } from 'vitest/browser';
import type { Commands } from './Commands.ts';

type Client<T> = {
  [K in keyof T]: T[K] extends (context: never, ...args: infer A) => infer R
    ? (...args: A) => Promise<0 extends 1 & R ? void : Awaited<R>>
    : never;
};

declare module 'vitest/browser' {
  interface BrowserCommands extends Client<Commands> {}
}

type Target = Element | Locator;

const elementOf = (target: Target) => (target instanceof Element ? target : target.element());

export function box(target: Target) {
  const { x, y, width, height } = elementOf(target).getBoundingClientRect();
  return { x, y, width, height };
}

export function css(target: Target, property: string, pseudo?: string) {
  return getComputedStyle(elementOf(target), pseudo).getPropertyValue(property).trim();
}

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

export const keyboard = {
  press: (key: string) => commands.keyPress(key),
  down: (key: string) => commands.keyDown(key),
  up: (key: string) => commands.keyUp(key),
  type: (text: string) => commands.keyType(text),
};

export function nextFrames() {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

export function stopTimers(...more: ('performance' | 'Date')[]) {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', ...more] });
  onTestFinished(() => void vi.useRealTimers());
}

export function waitOnRealTime(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function passTime(milliseconds: number) {
  await vi.advanceTimersByTimeAsync(milliseconds);
  await nextFrames();
}

export async function animationsDone(target: Target, subtree = false) {
  await Promise.allSettled(
    elementOf(target)
      .getAnimations({ subtree })
      .map((a) => a.finished),
  );
}

export function shown(locator: Locator) {
  const element = locator.query();
  if (!element) return false;
  const { width, height } = element.getBoundingClientRect();
  return width > 0 && height > 0 && getComputedStyle(element).visibility !== 'hidden';
}

let collected: string[] | undefined;
const consoleError = console.error;

export function collectErrors() {
  const errors: string[] = [];
  collected = errors;
  console.error = (...args: unknown[]) => {
    errors.push(args.map(String).join(' '));
    consoleError(...args);
  };
  return errors;
}

export function stopCollectingErrors() {
  if (!collected) return;
  console.error = consoleError;
  collected = undefined;
}

export function addStyle(content: string) {
  const style = document.createElement('style');
  style.dataset.testStyle = '';
  style.textContent = content;
  document.head.append(style);
}

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
    delete (navigator as { clipboard?: unknown }).clipboard;
    delete (document as { execCommand?: unknown }).execCommand;
  });
  return { writes, unhandled };
}

export function viewportRatio(target: Target) {
  return new Promise<number>((resolve) => {
    const observer = new IntersectionObserver(([entry]) => {
      observer.disconnect();
      resolve(entry!.intersectionRatio);
    });
    observer.observe(elementOf(target));
  });
}
