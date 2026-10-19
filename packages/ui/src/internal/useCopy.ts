'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** What to copy: the text, or a function that returns it, also as a promise, when copying. */
export type CopyValue = string | (() => string | Promise<string>);

interface WriteOptions {
  /** Runs when the text is a promise, before it settles, such as to show a pending state. */
  onWait?: () => void;
  /** The class of the hidden field the selection fallback copies from. */
  fieldClassName?: string;
  /** Writes the text instead of the Clipboard API, such as an app's own clipboard bridge. */
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
  onCopy?: (text: string) => void;
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
export function useCopy({ write, resetAfter = 2000, onCopy, fieldClassName }: CopyOptions = {}) {
  const [result, setResult] = useState<{ status: Exclude<CopyStatus, 'idle'>; round: number }>();
  const [phase, setPhase] = useState<'idle' | 'copying' | 'waiting'>('idle');
  const latest = useRef({ write, onCopy, fieldClassName });
  useEffect(() => {
    latest.current = { write, onCopy, fieldClassName };
  });
  useEffect(() => {
    if (!result) return;
    const timer = setTimeout(() => setResult(undefined), resetAfter);
    return () => clearTimeout(timer);
  }, [result, resetAfter]);
  const copy = useCallback(async (value: CopyValue, anchor: HTMLElement | null = null) => {
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
    // Each copy shows its result again, also the same result twice in a row.
    setResult((current) => ({
      status: copied ? 'copied' : 'failed',
      round: (current?.round ?? 0) + 1,
    }));
    if (copied) latest.current.onCopy?.(text);
    return copied;
  }, []);
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

/** Writes the text with the asynchronous Clipboard API, or by copying a selection where it fails. */
export async function writeToClipboard(
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
    // Some browsers allow writing only while handling the press: hand over an item at once and
    // let its text follow.
    try {
      const blob = resolved.then((text) => new Blob([text], { type: 'text/plain' }));
      // A clipboard that refuses at once leaves the item behind; a text that then fails is
      // reported once, below, not again as an unhandled rejection of the item's blob.
      blob.catch(() => undefined);
      await clipboard.write([new ClipboardItem({ 'text/plain': blob })]);
      return await resolved;
    } catch {
      // Write the text itself once it is ready.
    }
  }
  const text = await resolved;
  await writeText(text, anchor, fieldClassName, write);
  return text;
}

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

/** The fallback for pages without clipboard access: select the text in a hidden field and copy it. */
function copyWithSelection(text: string, anchor: HTMLElement, fieldClassName?: string) {
  const document = anchor.ownerDocument;
  const field = document.createElement('textarea');
  field.value = text;
  field.readOnly = true;
  field.tabIndex = -1;
  field.setAttribute('aria-hidden', 'true');
  // Out of sight and out of the way: the caller's class, or the same rules inline.
  if (fieldClassName) field.className = fieldClassName;
  else
    Object.assign(field.style, {
      position: 'fixed',
      insetBlockStart: '0',
      insetInlineStart: '0',
      inlineSize: '1px',
      blockSize: '1px',
      opacity: '0',
      pointerEvents: 'none',
    });
  // Beside the button, so a dialog that keeps focus inside itself lets the field take it.
  (anchor.parentElement ?? document.body).append(field);
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
