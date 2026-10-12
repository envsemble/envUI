import {
  useEffect,
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { Close } from '../icons/Close.js';

export interface DocumentTab {
  /** Stable identifier; the tab carries it as data-tab-id. */
  id: string;
  label: string;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Native tooltip, such as the full path; the label by default. */
  title?: string;
  /** A preview tab shows its label in italics until it is pinned. */
  preview?: boolean;
}

export interface DocumentTabsProps {
  items: readonly DocumentTab[];
  /** The active tab, or null. */
  value: string | null;
  /** Called when a tab is clicked or reached with the arrow keys, Home or End. */
  onValueChange: (id: string) => void;
  /** Called from a tab's close button and from a middle click. */
  onClose: (id: string) => void;
  /** Called when a tab is double-clicked, typically to keep a preview tab open. */
  onPin?: (id: string) => void;
  /** Accessible name of the tab strip. */
  'aria-label': string;
  /** Id of the panel the application renders for the active tab. */
  panelId?: string;
  /** Accessible name of each close button; receives the tab label. */
  closeLabel?: (label: string) => string;
  className?: string;
}

const defaultCloseLabel = (label: string) => `Close ${label}`;

/** Editor-style closable tabs for open documents; the application renders the active document. */
export function DocumentTabs({
  items,
  value,
  onValueChange,
  onClose,
  onPin,
  'aria-label': label,
  panelId,
  closeLabel = defaultCloseLabel,
  className,
}: DocumentTabsProps) {
  const list = useRef<HTMLDivElement>(null);
  // Closing the focused tab moves focus to the tab that becomes active.
  const restoreFocus = useRef(false);
  const focusable = items.some((item) => item.id === value) ? value : (items[0]?.id ?? null);

  function tabElement(id: string | null) {
    if (id === null || !list.current) return null;
    for (const tab of list.current.querySelectorAll<HTMLElement>('[role="tab"]'))
      if (tab.dataset.tabId === id) return tab;
    return null;
  }

  // The active tab scrolls into view within the strip, without scrolling the page.
  useLayoutEffect(() => {
    const strip = list.current;
    const tab = tabElement(value);
    if (!strip || !tab) return;
    const stripBox = strip.getBoundingClientRect();
    const tabBox = tab.getBoundingClientRect();
    if (tabBox.left < stripBox.left) strip.scrollLeft -= stripBox.left - tabBox.left;
    else if (tabBox.right > stripBox.right) strip.scrollLeft += tabBox.right - stripBox.right;
  }, [value, items]);

  useEffect(() => {
    if (!restoreFocus.current) return;
    restoreFocus.current = false;
    tabElement(focusable)?.focus();
  }, [items, focusable]);

  // A vertical wheel scrolls an overflowing strip sideways.
  useEffect(() => {
    const strip = list.current;
    if (!strip) return;
    const onWheel = (event: WheelEvent) => {
      if (event.deltaX !== 0 || event.deltaY === 0 || event.ctrlKey) return;
      const max = strip.scrollWidth - strip.clientWidth;
      if (max <= 0) return;
      const next = Math.min(max, Math.max(0, strip.scrollLeft + event.deltaY));
      if (next === strip.scrollLeft) return;
      event.preventDefault();
      strip.scrollLeft = next;
    };
    strip.addEventListener('wheel', onWheel, { passive: false });
    return () => strip.removeEventListener('wheel', onWheel);
  }, []);

  function close(id: string) {
    const tab = tabElement(id);
    if (tab && tab.contains(document.activeElement)) restoreFocus.current = true;
    onClose(id);
  }

  function select(index: number) {
    const item = items[index];
    if (!item) return;
    onValueChange(item.id);
    tabElement(item.id)?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>, index: number) {
    if (event.target !== event.currentTarget) return;
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft';
    if (event.key === forward) select((index + 1) % items.length);
    else if (event.key === backward) select((index - 1 + items.length) % items.length);
    else if (event.key === 'Home') select(0);
    else if (event.key === 'End') select(items.length - 1);
    else if (event.key === 'Enter' || event.key === ' ') select(index);
    else return;
    event.preventDefault();
  }

  function onCloseClick(event: MouseEvent<HTMLButtonElement>, id: string) {
    event.stopPropagation();
    close(id);
  }

  return (
    <div
      ref={list}
      role="tablist"
      aria-label={label}
      aria-orientation="horizontal"
      className={classNames('env-document-tabs', className)}
    >
      {items.map((item, index) => {
        const active = item.id === value;
        return (
          <div
            key={item.id}
            role="tab"
            aria-selected={active}
            aria-controls={active ? panelId : undefined}
            // The label names the tab; the close button keeps its own name.
            aria-label={item.label}
            title={item.title ?? item.label}
            tabIndex={item.id === focusable ? 0 : -1}
            className="env-document-tab"
            data-tab-id={item.id}
            data-preview={item.preview ? 'true' : 'false'}
            data-active={active ? '' : undefined}
            onClick={() => onValueChange(item.id)}
            onDoubleClick={(event) => {
              if (!(event.target as Element).closest('.env-document-tab-close')) onPin?.(item.id);
            }}
            onMouseDown={(event) => {
              // A middle press would otherwise start autoscrolling.
              if (event.button === 1) event.preventDefault();
            }}
            onAuxClick={(event) => {
              if (event.button !== 1) return;
              event.preventDefault();
              close(item.id);
            }}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {item.icon != null && <DecorativeIcon>{item.icon}</DecorativeIcon>}
            <span className="env-document-tab-label">{item.label}</span>
            <button
              type="button"
              tabIndex={-1}
              className="env-document-tab-close"
              aria-label={closeLabel(item.label)}
              title={closeLabel(item.label)}
              onClick={(event) => onCloseClick(event, item.id)}
            >
              <DecorativeIcon>
                <Close />
              </DecorativeIcon>
            </button>
          </div>
        );
      })}
    </div>
  );
}
