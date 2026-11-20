'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { flag } from '../../../internal/flag.js';
import type { ToastEntry } from './toastEntry.js';
import type { ToastController } from './useToastController.js';
import '../../../styles/Base.css';
import '../../../styles/Toast.css';

function enterFromStartingStyleAsBaseUINoticesDo(item: HTMLElement) {
  const flushStartingStyle = () => void getComputedStyle(item).opacity;
  flushStartingStyle();
  item.removeAttribute('data-starting-style');
}

function longestTransitionSeconds(item: HTMLElement | null) {
  return item
    ? Math.max(...getComputedStyle(item).transitionDuration.split(',').map(Number.parseFloat))
    : 0;
}

export function ContainedToastRoot({
  id,
  tone,
  limited,
  ending,
  controller,
  onGone,
  children,
}: {
  id: string;
  tone: ToastEntry['tone'];
  limited: boolean;
  ending: boolean;
  controller: ToastController;
  onGone: (id: string) => void;
  children: ReactNode;
}) {
  const element = useRef<HTMLDivElement>(null);
  const [closedBeforeEverShown] = useState(ending);
  useLayoutEffect(() => {
    const item = element.current;
    if (item) enterFromStartingStyleAsBaseUINoticesDo(item);
  }, []);
  useEffect(() => {
    if (!ending) return;
    const endingStyleSeconds = longestTransitionSeconds(element.current);
    const timer = setTimeout(() => onGone(id), (endingStyleSeconds || 0) * 1000);
    return () => clearTimeout(timer);
  }, [ending, id, onGone]);
  if (closedBeforeEverShown) return null;
  return (
    <div
      ref={element}
      data-toast-id={id}
      className="env-toast"
      data-tone={tone}
      data-limited={flag(limited)}
      data-starting-style=""
      data-ending-style={flag(ending)}
      role={tone === 'danger' ? 'alert' : 'status'}
      onMouseEnter={() => controller.pause(id, 'hover')}
      onMouseLeave={() => controller.resume(id, 'hover')}
    >
      {children}
    </div>
  );
}
