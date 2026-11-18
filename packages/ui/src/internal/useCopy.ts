'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLatest } from './useLatest.js';

/** What to copy: the text, or a function that returns it, also as a promise, when copying. */
export type CopyValue = string | (() => string | Promise<string>);

interface WriteOptions {
  onWait?: () => void;
  fieldClassName?: string;
  write?: (text: string) => Promise<void>;
}

export interface CopyOptions {
  /**
   * Writes the text instead of the Clipboard API, such as a desktop app's clipboard bridge; a
   * rejected promise reports failed.
   */
  write?: (text: string) => Promise<void>;
  /** How long copied or failed stays before the status returns to idle, in ms; 2000 by default. */
  resetAfter?: number;
  /** Runs once the text is on the clipboard, with that text. */
  onCopied?: (text: string) => void;
  /** The class of the hidden field the selection fallback copies from; inline styles without it. */
  fieldClassName?: string;
}

/** What a copy came to: idle before any and once resetAfter has passed, else copied or failed. */
export type CopyStatus = 'idle' | 'copied' | 'failed';

/**
 * Copies text to the clipboard, with the Clipboard API, or a custom writer, and where the API is
 * unavailable, such as on an insecure connection, by copying a selection of a hidden field beside
 * `anchor`. A promised text is written as it arrives, within the press where the browser asks for
 * it. status is copied or failed for resetAfter ms after each copy, and round counts the copies,
 * so the same result twice in a row can show again; copying is true from the call until the
 * result, and waiting while a promised text is on its way. reset returns the status to idle.
 *
 *   const { copy, status } = useCopy();
 *   <button onClick={(event) => copy(value, event.currentTarget)}>…</button>
 */
export function useCopy({ write, resetAfter = 2000, onCopied, fieldClassName }: CopyOptions = {}) {
  const [result, setResult] = useState<{ status: Exclude<CopyStatus, 'idle'>; round: number }>();
  const [phase, setPhase] = useState<'idle' | 'copying' | 'waiting'>('idle');
  const latest = useLatest({ write, onCopied, fieldClassName });
  useEffect(() => {
    if (!result) return;
    const timer = setTimeout(() => setResult(undefined), resetAfter);
    return () => clearTimeout(timer);
  }, [result, resetAfter]);
  const copy = useCallback(
    async (value: CopyValue, anchor: HTMLElement | null = null) => {
      setPhase('copying');
      let copied = true;
      let text = '';
      try {
        text = await writeToClipboard(value, anchor, {
          write: latest.current.write,
          fieldClassName: latest.current.fieldClassName,
          onWait: () => setPhase('waiting'),
        });
      } catch {
        copied = false;
      }
      setPhase('idle');
      setResult((current) => ({
        status: copied ? 'copied' : 'failed',
        round: (current?.round ?? 0) + 1,
      }));
      if (copied) latest.current.onCopied?.(text);
      return copied;
    },
    [latest],
  );
  const reset = useCallback(() => setResult(undefined), []);
  return {
    copy,
    status: (result?.status ?? 'idle') as CopyStatus,
    round: result?.round ?? 0,
    copying: phase !== 'idle',
    waiting: phase === 'waiting',
    reset,
  };
}

async function writeToClipboard(
  value: CopyValue,
  anchor: HTMLElement | null,
  { onWait, fieldClassName, write }: WriteOptions = {},
) {
  const resolved = typeof value === 'function' ? value() : value;
  if (typeof resolved === 'string') {
    await writeText(resolved, anchor, fieldClassName, write);
    return resolved;
  }
  onWait?.();
  const clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard;
  if (!write && typeof ClipboardItem !== 'undefined' && clipboard?.write) {
    const handedOver = await handOverItemWhileHandlingPress(clipboard, resolved);
    if (handedOver) return await resolved;
  }
  const text = await resolved;
  await writeText(text, anchor, fieldClassName, write);
  return text;
}

async function handOverItemWhileHandlingPress(clipboard: Clipboard, text: Promise<string>) {
  try {
    const blob = text.then((value) => new Blob([value], { type: 'text/plain' }));
    blob.catch(leaveRejectionToCaller);
    await clipboard.write([new ClipboardItem({ 'text/plain': blob })]);
    return true;
  } catch {
    return false;
  }
}

const leaveRejectionToCaller = () => undefined;

async function writeText(
  text: string,
  anchor: HTMLElement | null,
  fieldClassName: string | undefined,
  write: ((text: string) => Promise<void>) | undefined,
) {
  if (write) {
    await write(text);
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    if (!anchor || !copyWithSelection(text, anchor, fieldClassName))
      throw new Error('The clipboard is unavailable.');
  }
}

const outOfSightAndOutOfTheWay = {
  position: 'fixed',
  insetBlockStart: '0',
  insetInlineStart: '0',
  inlineSize: '1px',
  blockSize: '1px',
  opacity: '0',
  pointerEvents: 'none',
};

function copyWithSelection(text: string, anchor: HTMLElement, fieldClassName?: string) {
  const document = anchor.ownerDocument;
  const field = document.createElement('textarea');
  field.value = text;
  field.readOnly = true;
  field.tabIndex = -1;
  field.setAttribute('aria-hidden', 'true');
  if (fieldClassName) field.className = fieldClassName;
  else Object.assign(field.style, outOfSightAndOutOfTheWay);
  const besideAnchorInsideAnyFocusTrap = anchor.parentElement ?? document.body;
  besideAnchorInsideAnyFocusTrap.append(field);
  const focused = document.activeElement;
  const selection = document.getSelection();
  const ranges = selection
    ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index))
    : [];
  field.focus({ preventScroll: true });
  field.select();
  let copied: boolean;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  field.remove();
  (focused as HTMLElement | null)?.focus({ preventScroll: true });
  if (selection) {
    selection.removeAllRanges();
    for (const range of ranges) selection.addRange(range);
  }
  return copied;
}
