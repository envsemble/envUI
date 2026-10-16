'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import {
  Fragment,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { Theme, useTheme } from '../foundations/Theme.js';
import { Search } from '../icons/Search.js';
import { Kbd } from '../content/Kbd.js';

export interface CommandPaletteItem {
  /** Stable identifier; options carry it as data-item-id. */
  id: string;
  /** The option's text; also its accessible name unless textValue is set. */
  label: ReactNode;
  /** Plain text of the label when it is not a string, for the option's accessible name. */
  textValue?: string;
  /** Muted text after the label, such as a folder path. */
  detail?: ReactNode;
  /** A decorative icon before the label. */
  icon?: ReactNode;
  /** A heading shows where the group changes between consecutive items. */
  group?: string;
  /** End content, such as a Kbd shortcut or a Badge. */
  trailing?: ReactNode;
}

/** A key hint in the footer: the keys as Kbd, then what they do. */
export interface CommandPaletteHint {
  /** One key or a combination, such as ['Ctrl', 'Enter']. */
  keys: readonly string[];
  /** What the keys do, such as "Open to the side". */
  label: ReactNode;
}

export interface CommandPaletteSelectOptions {
  /** Ctrl or Cmd was held, for example to open beside the current document. */
  modifier: boolean;
}

export interface CommandPaletteProps {
  /** Whether the palette is open; the application opens it, such as from a shortcut. */
  open: boolean;
  /** Called with false when Esc, a press on the backdrop or a choice closes the palette. */
  onOpenChange: (open: boolean) => void;
  /** Accessible name of the dialog, the search field and the list. */
  'aria-label': string;
  /** The text in the search field. */
  query: string;
  /** Receives the text as people type. */
  onQueryChange: (query: string) => void;
  /** Filtered and ranked by the application, in display order. */
  items: readonly CommandPaletteItem[];
  /** Enter or click; Ctrl or Cmd sets modifier. */
  onSelect: (item: CommandPaletteItem, options: CommandPaletteSelectOptions) => void;
  /** Close after an item is selected; true by default. */
  closeOnSelect?: boolean;
  /** Shown in the empty search field, such as "Search documents by name or folder". */
  placeholder?: string;
  /** Shown in place of the list when there are no items; No results by default. */
  emptyLabel?: ReactNode;
  /** Key hints below the list, such as { keys: ['Enter'], label: 'Open' }. */
  hints?: readonly CommandPaletteHint[];
  /** Other content below the list, after the hints. */
  footer?: ReactNode;
  /** Classes for the dialog's surface. */
  className?: string;
}

/** Options moved by Page Up and Page Down when the list height is unknown. */
const fallbackPage = 8;

/** Consecutive items with the same group share a labelled group. */
function groupItems(items: readonly CommandPaletteItem[]) {
  const sections: {
    group: string | undefined;
    entries: { item: CommandPaletteItem; itemIndex: number }[];
  }[] = [];
  items.forEach((item, itemIndex) => {
    const current = sections.at(-1);
    if (current && current.group === item.group) current.entries.push({ item, itemIndex });
    else sections.push({ group: item.group, entries: [{ item, itemIndex }] });
  });
  return sections;
}

function optionElementId(listId: string, itemId: string) {
  return `${listId}-option-${itemId.replace(
    /[^A-Za-z0-9-]/g,
    (character) => `_${character.codePointAt(0)!.toString(16)}_`,
  )}`;
}

/**
 * A quick-open dialog near the top of the window: a search field over a list of options the
 * application filters and ranks. The keyboard moves the highlight while typing continues.
 */
export function CommandPalette({
  open,
  onOpenChange,
  'aria-label': label,
  query,
  onQueryChange,
  items,
  onSelect,
  closeOnSelect = true,
  placeholder,
  emptyLabel = 'No results',
  hints,
  footer,
  className,
}: CommandPaletteProps) {
  const theme = useTheme();
  const listId = `${useId().replace(/[^A-Za-z0-9-]/g, '')}-list`;
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const [highlighted, setHighlighted] = useState(0);
  const index = items.length === 0 ? -1 : Math.min(highlighted, items.length - 1);
  const active = index === -1 ? undefined : items[index];

  // A new query starts again from the best match.
  useEffect(() => setHighlighted(0), [query, open]);

  useLayoutEffect(() => {
    const container = list.current;
    if (!open || !container || !active) return;
    const option = container.ownerDocument.getElementById(optionElementId(listId, active.id));
    if (!option) return;
    // Layout offsets within the list, which is the options' offset parent: unlike client
    // rectangles, they ignore the dialog's scale while it opens.
    const top = option.offsetTop;
    const bottom = top + option.offsetHeight;
    if (top < container.scrollTop) container.scrollTop = top;
    else if (bottom > container.scrollTop + container.clientHeight)
      container.scrollTop = bottom - container.clientHeight;
  }, [open, active, listId]);

  function select(item: CommandPaletteItem, modifier: boolean) {
    onSelect(item, { modifier });
    if (closeOnSelect) onOpenChange(false);
  }

  function pageSize() {
    const container = list.current;
    const option = container?.querySelector<HTMLElement>('[role="option"]');
    return container && option
      ? Math.max(1, Math.floor(container.clientHeight / option.offsetHeight) - 1)
      : fallbackPage;
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    const last = items.length - 1;
    let next: number | undefined;
    if (event.key === 'ArrowDown') next = index >= last ? 0 : index + 1;
    else if (event.key === 'ArrowUp') next = index <= 0 ? last : index - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    else if (event.key === 'PageDown') next = Math.min(last, index + pageSize());
    else if (event.key === 'PageUp') next = Math.max(0, index - pageSize());
    else if (event.key === 'Enter') {
      event.preventDefault();
      if (active) select(active, event.ctrlKey || event.metaKey);
      return;
    } else return;
    event.preventDefault();
    if (items.length > 0) setHighlighted(next);
  }

  return (
    <BaseDialog.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
      <BaseDialog.Portal>
        <Theme {...theme}>
          <BaseDialog.Backdrop className="env-dialog-backdrop env-command-palette-backdrop" />
          <div className="env-command-palette-positioner">
            <BaseDialog.Popup
              className={classNames('env-command-palette', className)}
              aria-label={label}
              initialFocus={input}
            >
              <div className="env-command-palette-search">
                <DecorativeIcon>
                  <Search />
                </DecorativeIcon>
                <input
                  ref={input}
                  className="env-command-palette-input"
                  role="combobox"
                  aria-label={label}
                  aria-expanded={items.length > 0}
                  aria-controls={listId}
                  aria-autocomplete="list"
                  aria-activedescendant={active ? optionElementId(listId, active.id) : undefined}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder={placeholder}
                  value={query}
                  onChange={(event) => onQueryChange(event.currentTarget.value)}
                  onKeyDown={onKeyDown}
                />
              </div>
              <div
                ref={list}
                id={listId}
                role="listbox"
                aria-label={label}
                className="env-command-palette-list"
                hidden={items.length === 0}
              >
                {groupItems(items).map((section, sectionIndex) => {
                  const options = section.entries.map(({ item, itemIndex }) => (
                    <div
                      key={item.id}
                      id={optionElementId(listId, item.id)}
                      role="option"
                      aria-selected={itemIndex === index}
                      aria-label={item.textValue}
                      className="env-command-palette-option"
                      data-item-id={item.id}
                      data-highlighted={itemIndex === index ? '' : undefined}
                      onPointerMove={() => {
                        if (itemIndex !== index) setHighlighted(itemIndex);
                      }}
                      // The field keeps focus while an option is pressed.
                      onPointerDown={(event) => event.preventDefault()}
                      onClick={(event) => select(item, event.ctrlKey || event.metaKey)}
                    >
                      {item.icon != null && <DecorativeIcon>{item.icon}</DecorativeIcon>}
                      <span className="env-command-palette-label">{item.label}</span>
                      {item.detail != null && (
                        <>
                          {' '}
                          <span className="env-command-palette-detail">{item.detail}</span>
                        </>
                      )}
                      {item.trailing != null && (
                        <span className="env-command-palette-trailing">{item.trailing}</span>
                      )}
                    </div>
                  ));
                  if (section.group === undefined)
                    return <Fragment key={`options-${sectionIndex}`}>{options}</Fragment>;
                  const headingId = `${listId}-group-${sectionIndex}`;
                  return (
                    <div
                      key={`group-${sectionIndex}`}
                      role="group"
                      aria-labelledby={headingId}
                      className="env-command-palette-group"
                    >
                      <div
                        id={headingId}
                        role="presentation"
                        className="env-command-palette-heading"
                      >
                        {section.group}
                      </div>
                      {options}
                    </div>
                  );
                })}
              </div>
              {items.length === 0 && (
                <div className="env-command-palette-empty" role="status">
                  {emptyLabel}
                </div>
              )}
              {(Boolean(hints?.length) || footer != null) && (
                <div className="env-command-palette-footer">
                  {hints?.map((hint, hintIndex) => (
                    <span key={hintIndex} className="env-command-palette-hint">
                      <Kbd keys={hint.keys} />
                      <span>{hint.label}</span>
                    </span>
                  ))}
                  {footer != null && (
                    <span className="env-command-palette-footer-content">{footer}</span>
                  )}
                </div>
              )}
            </BaseDialog.Popup>
          </div>
        </Theme>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
