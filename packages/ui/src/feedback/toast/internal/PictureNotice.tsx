'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { flag } from '../../../internal/flag.js';
import type { ToastEntry } from './toastEntry.js';
import type { ToastController } from './useToastController.js';
import '../../../styles/Base.css';
import '../../../styles/Toast.css';

/**
 * A notice of a contained region's picture: it arrives and leaves with a live notice's motion, from
 * the toast's starting and ending styles, and its time stops while the pointer rests on it. Once it
 * has left, `onGone` takes it out of the picture.
 */
export function PictureNotice({
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
  // A notice closed before it was ever shown, such as one an effect shows and takes back at once,
  // never arrives.
  const [arrives] = useState(!ending);
  // It comes in from its starting style, which its first style holds, as Base UI's notices do.
  useLayoutEffect(() => {
    const item = element.current;
    if (!item) return;
    void getComputedStyle(item).opacity;
    item.removeAttribute('data-starting-style');
  }, []);
  // Leaving, it fades to its ending style, and is gone once that ends; at once without motion.
  useEffect(() => {
    if (!ending) return;
    const item = element.current;
    const seconds = item
      ? Math.max(...getComputedStyle(item).transitionDuration.split(',').map(Number.parseFloat))
      : 0;
    const timer = setTimeout(() => onGone(id), (seconds || 0) * 1000);
    return () => clearTimeout(timer);
  }, [ending, id, onGone]);
  if (!arrives) return null;
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
