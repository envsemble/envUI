'use client';

import { useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { Stack } from '../foundations/Layout.js';

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
        if (!controlled) setOwnOpen(next);
        onOpenChange?.(next);
      }}
      className={classNames('env-disclosure', className)}
    >
      <summary>{title}</summary>
      <Stack gap={2} className="env-disclosure-panel">
        {children}
      </Stack>
    </details>
  );
}
