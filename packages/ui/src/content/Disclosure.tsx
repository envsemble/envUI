'use client';

import { useState, type ComponentPropsWithRef, type MouseEvent, type ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { Column } from '../layout/Layout.js';
import { IconChevronRight } from '../icons/ChevronRight.js';
import '../styles/Base.css';
import '../styles/Disclosure.css';

export interface DisclosureProps extends Omit<ComponentPropsWithRef<'details'>, 'title'> {
  /** The summary: one line that says what the details hold and opens or closes them. */
  title: ReactNode;
  /** The details, shown below the summary while the disclosure is open. */
  children?: ReactNode;
  /**
   * Whether the details show, for a controlled disclosure: update it from onOpenChange. Use
   * defaultOpen instead to leave it to the disclosure.
   */
  open?: boolean;
  /**
   * Whether the details show at first, for a disclosure that keeps its own state.
   * @default false
   */
  defaultOpen?: boolean;
  /** Receives whether the details show, each time the disclosure opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

// Content inside a summary that takes a click for itself, so the summary does not toggle.
const interactive =
  'a[href], button, input, select, textarea, label, iframe, embed, audio[controls], video[controls], [contenteditable]:not([contenteditable="false"])';

/** A summary that shows and hides the details below it, on the native details element. */
export function Disclosure({
  title,
  open,
  defaultOpen = false,
  onOpenChange,
  onToggle,
  className,
  children,
  ...props
}: DisclosureProps) {
  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const controlled = open !== undefined;
  const shown = controlled ? open : ownOpen;
  return (
    <details
      {...props}
      open={shown}
      onToggle={(event) => {
        onToggle?.(event);
        // The browser opens and closes the element itself, also from find in page; the state
        // follows it, and a toggle that only echoes the open prop reports nothing.
        const next = event.currentTarget.open;
        if (next === shown) return;
        // A controlled disclosure shows what open says: a click asks through the summary, and a
        // change the browser makes itself, such as find in page, goes back until the parent
        // passes the open that onOpenChange asks for.
        if (controlled) event.currentTarget.open = shown;
        else setOwnOpen(next);
        onOpenChange?.(next);
      }}
      className={classNames('env-disclosure', className)}
    >
      <summary
        onClick={(event: MouseEvent<HTMLElement>) => {
          // A controlled disclosure asks before it moves: the element would otherwise open for a
          // frame before a parent that refuses the change puts it back.
          if (!controlled || event.defaultPrevented) return;
          const target = event.target as Element;
          const inner = target.closest(interactive);
          if (inner && inner !== event.currentTarget && event.currentTarget.contains(inner)) return;
          event.preventDefault();
          onOpenChange?.(!shown);
        }}
      >
        <span className="env-icon env-disclosure-indicator" aria-hidden="true">
          <IconChevronRight />
        </span>
        {title}
      </summary>
      <Column gap={2} className="env-disclosure-panel">
        {children}
      </Column>
    </details>
  );
}
