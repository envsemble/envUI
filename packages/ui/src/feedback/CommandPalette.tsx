'use client';

import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import {
  useRef,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { ListRow } from '../internal/ListRow.js';
import { useLocale, useMessages } from '../internal/EnvUIContext.js';
import { commandPalette } from '../foundations/messages/commandPalette.js';
import { Theme, useTheme } from '../foundations/Theme.js';
import { Search } from '../icons/Search.js';
import { Kbd } from '../content/Kbd.js';
import { DialogBackdrop } from './internal/DialogParts.js';

export interface CommandPaletteItem {
  /** Stable identifier; options carry it as data-item-id. */
  id: string;
  /** The option's text; also its accessible name unless textValue is set. */
  label: ReactNode;
  /** Plain text of the label when it is not a string, for the option's accessible name. */
  textValue?: string;
  /** Muted text under the label, such as a folder path. */
  description?: ReactNode;
  /** A decorative icon before the label. */
  icon?: ReactNode;
  /** A heading shows where the group changes between consecutive items. */
  group?: string;
  /** End content, such as a Kbd shortcut or a Badge. */
  end?: ReactNode;
  /** The option shows but can't be chosen, such as a command that doesn't apply here. */
  disabled?: boolean;
}

/** A key hint in the footer: the keys as Kbd, then what they do. */
export interface CommandPaletteHint {
  /** One key or a combination, such as ['Ctrl', 'Enter']. */
  keys: readonly string[];
  /** What the keys do, such as "Open to the side". */
  label: ReactNode;
}

export interface CommandPaletteActionOptions {
  /** Ctrl or Cmd was held, for example to open beside the current document. */
  modifier: boolean;
}

export interface CommandPaletteProps
  extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue' | 'onChange'> {
  /** Whether the palette is open; the application opens it, such as from a shortcut. */
  open: boolean;
  /** Called with false when Esc, a press on the backdrop or a choice closes the palette. */
  onOpenChange: (open: boolean) => void;
  /** Accessible name of the dialog, the search field and the list. */
  'aria-label': string;
  /** The text in the search field. */
  inputValue: string;
  /** Receives the text as people type. */
  onInputValueChange: (inputValue: string) => void;
  /** Filtered and ranked by the application, in display order. */
  items: readonly CommandPaletteItem[];
  /** Enter or a press on an option; Ctrl or Cmd sets modifier. */
  onAction: (item: CommandPaletteItem, options: CommandPaletteActionOptions) => void;
  /**
   * Close after an option is chosen.
   * @default true
   */
  closeOnAction?: boolean;
  /** Shown in the empty search field, such as "Search documents by name or folder". */
  placeholder?: string;
  /**
   * Shown in place of the list when there are no items, and announced.
   * @default 'No results', or EnvUIProvider's messages.commandPalette.empty
   */
  emptyLabel?: ReactNode;
  /** Key hints below the list, such as { keys: ['Enter'], label: 'Open' }. */
  hints?: readonly CommandPaletteHint[];
  /** Other content below the list, after the hints. */
  footer?: ReactNode;
}

interface Section {
  id: string;
  label: string | undefined;
  items: CommandPaletteItem[];
}

/** Consecutive items with the same group share a labelled group. */
function sectionsOf(items: readonly CommandPaletteItem[]) {
  const sections: Section[] = [];
  for (const item of items) {
    const current = sections.at(-1);
    if (current && current.label === item.group) current.items.push(item);
    else sections.push({ id: `section-${sections.length}`, label: item.group, items: [item] });
  }
  return sections;
}

function textOf(item: CommandPaletteItem) {
  return item.textValue ?? (typeof item.label === 'string' ? item.label : item.id);
}

/**
 * A quick-open dialog near the top of the window: a search field over a list of options the
 * application filters and ranks, built on Base UI's Autocomplete inside a dialog. The arrow keys
 * move the highlight while typing continues, and the number of results is announced as it
 * changes. className, style, ref and data attributes go to the dialog's surface.
 */
export function CommandPalette({
  open,
  onOpenChange,
  'aria-label': label,
  inputValue,
  onInputValueChange,
  items,
  onAction,
  closeOnAction = true,
  placeholder,
  emptyLabel,
  hints,
  footer,
  className,
  ...popupProps
}: CommandPaletteProps) {
  const theme = useTheme();
  const locale = useLocale();
  const messages = useMessages('commandPalette', commandPalette);
  const input = useRef<HTMLInputElement>(null);
  const highlighted = useRef<CommandPaletteItem | undefined>(undefined);
  const sections = sectionsOf(items);
  const grouped = sections.some((section) => section.label !== undefined);

  function act(item: CommandPaletteItem, modifier: boolean) {
    if (item.disabled) return;
    onAction(item, { modifier });
    if (closeOnAction) onOpenChange(false);
  }

  // Base UI leaves Enter with a modifier to the application: it chooses the highlighted option.
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    if (!(event.ctrlKey || event.metaKey) || !highlighted.current) return;
    event.preventDefault();
    act(highlighted.current, true);
  }

  const renderItem = (item: CommandPaletteItem) => (
    <ListRow
      key={item.id}
      className="env-command-palette-item"
      icon={item.icon}
      label={item.label}
      description={item.description}
      end={item.end}
      render={
        <BaseAutocomplete.Item
          value={item}
          disabled={item.disabled}
          data-item-id={item.id}
          aria-label={item.textValue}
          onClick={(event: MouseEvent) => act(item, event.ctrlKey || event.metaKey)}
        />
      }
    />
  );

  return (
    <BaseDialog.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
      <BaseDialog.Portal>
        <Theme {...theme}>
          <DialogBackdrop />
          <div className="env-command-palette-positioner">
            <BaseDialog.Popup
              {...popupProps}
              className={classNames('env-command-palette', className)}
              aria-label={label}
              initialFocus={input}
            >
              <BaseAutocomplete.Root
                open
                inline
                items={grouped ? sections : items}
                filter={null}
                autoHighlight="always"
                keepHighlight
                locale={locale}
                itemToStringValue={(item: CommandPaletteItem) => textOf(item)}
                value={inputValue}
                onValueChange={(next, details) => {
                  // Choosing an option acts on it; the search text stays what people typed.
                  if (details.reason === 'item-press') return;
                  onInputValueChange(next);
                }}
                onItemHighlighted={(item: CommandPaletteItem | undefined) => {
                  highlighted.current = item;
                }}
              >
                <div className="env-command-palette-search">
                  <DecorativeIcon>
                    <Search />
                  </DecorativeIcon>
                  <BaseAutocomplete.Input
                    ref={input}
                    className="env-command-palette-input"
                    aria-label={label}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder={placeholder}
                    onKeyDown={onKeyDown}
                  />
                </div>
                <BaseAutocomplete.List
                  className="env-command-palette-list"
                  aria-label={label}
                  hidden={items.length === 0}
                >
                  {grouped
                    ? (section: Section) =>
                        section.label === undefined ? (
                          <BaseAutocomplete.Group key={section.id} items={section.items}>
                            <BaseAutocomplete.Collection>{renderItem}</BaseAutocomplete.Collection>
                          </BaseAutocomplete.Group>
                        ) : (
                          <BaseAutocomplete.Group
                            key={section.id}
                            items={section.items}
                            className="env-command-palette-group"
                          >
                            <BaseAutocomplete.GroupLabel className="env-command-palette-heading">
                              {section.label}
                            </BaseAutocomplete.GroupLabel>
                            <BaseAutocomplete.Collection>{renderItem}</BaseAutocomplete.Collection>
                          </BaseAutocomplete.Group>
                        )
                    : renderItem}
                </BaseAutocomplete.List>
                {/* One polite status: the number of results as they change, read by assistive
                    technology only, or the empty message, shown in place of the list. */}
                <BaseAutocomplete.Status
                  className="env-command-palette-status"
                  data-empty={items.length === 0 || undefined}
                >
                  {items.length === 0
                    ? (emptyLabel ?? messages.empty)
                    : messages.results({ count: items.length })}
                </BaseAutocomplete.Status>
              </BaseAutocomplete.Root>
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
