'use client';

import { type ComponentPropsWithRef, type MouseEvent, type ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { useControllableState } from '../internal/react/useControllableState.js';
import { Column } from '../layout/Layout.js';
import { Slot } from '../internal/layout/Slot.js';
import { IconChevronRight } from '../icons/ChevronRight.js';
import { DecorativeIcon } from '../internal/icon/DecorativeIcon.js';
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
  /**
   * Where the chevron sits in the summary: before its words, or after them, as in a Show more
   * link.
   * @default 'start'
   */
  indicatorPlacement?: 'start' | 'end';
  /**
   * stack lays the details out one under another, a small gap apart; flow places them as given,
   * so they keep their own spacing and flow, such as inline text.
   * @default 'stack'
   */
  panelLayout?: 'stack' | 'flow';
}

const controlsThatTakeTheirOwnClick =
  'a[href], button, input, select, textarea, label, iframe, embed, audio[controls], video[controls], [contenteditable]:not([contenteditable="false"])';

/** A summary that shows and hides the details below it, on the native details element. */
export function Disclosure({
  title,
  open,
  defaultOpen = false,
  onOpenChange,
  indicatorPlacement = 'start',
  panelLayout = 'stack',
  onToggle,
  className,
  children,
  ...props
}: DisclosureProps) {
  const [shown, setShown] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const controlled = open !== undefined;
  const revertUntilParentPassesOpen = (details: HTMLDetailsElement) => {
    details.open = shown;
  };
  const askParentBeforeTogglingControlled = (event: MouseEvent<HTMLElement>) => {
    if (!controlled || event.defaultPrevented) return;
    const target = event.target as Element;
    const ownClickControl = target.closest(controlsThatTakeTheirOwnClick);
    if (
      ownClickControl &&
      ownClickControl !== event.currentTarget &&
      event.currentTarget.contains(ownClickControl)
    )
      return;
    event.preventDefault();
    setShown(!shown);
  };
  const indicator = (
    <DecorativeIcon className="env-disclosure-indicator">
      <IconChevronRight />
    </DecorativeIcon>
  );
  return (
    <details
      {...props}
      open={shown}
      onToggle={(event) => {
        onToggle?.(event);
        const openedByBrowser = event.currentTarget.open;
        const onlyEchoesOpenProp = openedByBrowser === shown;
        if (onlyEchoesOpenProp) return;
        if (controlled) revertUntilParentPassesOpen(event.currentTarget);
        setShown(openedByBrowser);
      }}
      className={classNames('env-disclosure', className)}
      data-indicator={indicatorPlacement === 'end' ? 'end' : undefined}
    >
      <summary onClick={askParentBeforeTogglingControlled}>
        {indicatorPlacement !== 'end' && indicator}
        <Slot className="env-disclosure-title" element="span">
          {title}
        </Slot>
        {indicatorPlacement === 'end' && indicator}
      </summary>
      {panelLayout === 'flow' ? (
        <div className="env-disclosure-panel" data-layout="flow">
          {children}
        </div>
      ) : (
        <Column gap={2} className="env-disclosure-panel">
          {children}
        </Column>
      )}
    </details>
  );
}
