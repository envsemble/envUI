'use client';

import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import {
  useId,
  useRef,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { Column, Grid, Row } from '../foundations/Layout.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { ListRow } from '../internal/ListRow.js';
import { FieldFrame } from '../forms/internal/FieldFrame.js';
import { useLocale, useMessages } from '../internal/EnvUIContext.js';
import { useFormatters } from '../internal/useFormatters.js';
import { commandPalette } from '../foundations/messages/commandPalette.js';
import { useTheme } from '../foundations/Theme.js';
import { IconSearch } from '../icons/Search.js';
import { IconSearchOff } from '../icons/SearchOff.js';
import { IconClose } from '../icons/Close.js';
import { IconButton } from '../actions/Button.js';
import { dialog } from '../foundations/messages/dialog.js';
import { Kbd } from '../content/Kbd.js';
import { Spinner } from './Spinner.js';
import { DialogBackdrop, OverlayTheme } from './internal/DialogParts.js';
import type { DialogOpenChangeReason } from './Dialog.js';
import { ResetControlDefaults } from '../internal/ControlDefaults.js';
import {
  containedModal,
  keepsOpen,
  usePortalContainer,
} from '../internal/PortalContainerContext.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
import '../styles/CommandPalette.css';

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

export interface CommandPaletteActionDetails {
  /** Ctrl or Cmd was held, for example to open beside the current document. */
  modifier: boolean;
}

/** What CommandPalette's onOpenChange receives beside the requested state. */
export interface CommandPaletteOpenChangeDetails {
  /**
   * Why the palette asks to close: a dialog's reasons, such as escape-key or outside-press, or
   * item-press when a chosen option closes it under closeOnAction.
   */
  reason: DialogOpenChangeReason | 'item-press';
}

export interface CommandPaletteProps
  extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue' | 'onChange'> {
  /** Whether the palette is open; the application opens it, such as from a shortcut. */
  open: boolean;
  /** Called with false, and why, when Esc, a press on the backdrop or a choice closes the palette. */
  onOpenChange: (open: boolean, details: CommandPaletteOpenChangeDetails) => void;
  /** Accessible name of the dialog, the search field and the list. */
  'aria-label': string;
  /** The text in the search field. */
  inputValue: string;
  /** Receives the text as people type. */
  onInputValueChange: (inputValue: string) => void;
  /** Filtered and ranked by the application, in display order. */
  items: readonly CommandPaletteItem[];
  /**
   * Shown in place of items while the search field is empty, such as recent documents or
   * suggested pages under a group heading; options like any other.
   */
  suggestedItems?: readonly CommandPaletteItem[];
  /** Enter or a press on an option; Ctrl or Cmd sets modifier. */
  onAction: (item: CommandPaletteItem, details: CommandPaletteActionDetails) => void;
  /**
   * Close after an option is chosen.
   * @default true
   */
  closeOnAction?: boolean;
  /** Shown in the empty search field, such as "Search documents by name or folder". */
  placeholder?: string;
  /**
   * The results are on their way, such as from a server. With none to show yet, the empty state
   * says loadingLabel beside a spinner; results already shown stay, marked busy, and the search
   * field's icon turns into a spinner.
   * @default false
   */
  loading?: boolean;
  /**
   * Shown and announced while loading.
   * @default 'Searching…', or EnvUIProvider's messages.commandPalette.loading
   */
  loadingLabel?: ReactNode;
  /**
   * The empty state's title, shown in place of the list when there are no options, and announced.
   * @default 'Type to search' while the search field is empty and 'No results' when its text
   * finds nothing, or EnvUIProvider's messages.commandPalette.emptyQuery and empty
   */
  emptyLabel?: ReactNode;
  /**
   * Quieter text under the empty state's title, such as what the palette searches; null or false
   * shows none.
   * @default None while the search field is empty; when its text finds nothing, 'Nothing matches
   * “…”. Check the spelling or try other words.', or messages.commandPalette.emptyHint
   */
  emptyDescription?: ReactNode;
  /**
   * The empty state's decorative icon, above its title; null or false shows none.
   * @default Search while the search field is empty, SearchOff when its text finds nothing
   */
  emptyIcon?: ReactNode;
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
  items: results,
  suggestedItems,
  onAction,
  closeOnAction = true,
  placeholder,
  loading = false,
  loadingLabel,
  emptyLabel,
  emptyDescription,
  emptyIcon,
  hints,
  footer,
  className,
  ...popupProps
}: CommandPaletteProps) {
  const theme = useTheme();
  const portal = usePortalContainer();
  const locale = useLocale();
  const messages = useMessages('commandPalette', commandPalette);
  const dialogMessages = useMessages('dialog', dialog);
  const number = useFormatters().number();
  const input = useRef<HTMLInputElement>(null);
  const searchId = useId();
  const highlighted = useRef<{ item?: CommandPaletteItem; index: number }>({ index: -1 });
  const list = useRef<HTMLDivElement>(null);
  const query = inputValue.trim();
  // Until people type, the default items, where there are any, show in place of the results.
  const items = query === '' && suggestedItems ? suggestedItems : results;
  const sections = sectionsOf(items);
  const grouped = sections.some((section) => section.label !== undefined);
  // With no options, the empty state invites a search before people type, and says what to try
  // when the text finds nothing.
  const empty = items.length === 0;
  const typed = query !== '';
  // While loading, the empty state says so instead, with a spinner in its icon's place.
  const icon = loading ? (
    <Spinner />
  ) : emptyIcon === undefined ? (
    typed ? (
      <IconSearchOff />
    ) : (
      <IconSearch />
    )
  ) : (
    emptyIcon
  );
  const title = loading
    ? (loadingLabel ?? messages.loading)
    : (emptyLabel ?? (typed ? messages.empty : messages.emptyQuery));
  const description = loading
    ? null
    : emptyDescription === undefined
      ? typed
        ? messages.emptyHint({ query })
        : null
      : emptyDescription;

  function act(item: CommandPaletteItem, modifier: boolean) {
    if (item.disabled) return;
    onAction(item, { modifier });
    if (closeOnAction) onOpenChange(false, { reason: 'item-press' });
  }

  /** Options that fit in the list's height, for Page Up and Page Down. */
  function pageSize() {
    const container = list.current;
    const option = container?.querySelector<HTMLElement>('[role="option"]');
    return container && option
      ? Math.max(1, Math.floor(container.clientHeight / option.offsetHeight) - 1)
      : 8;
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    const { item, index } = highlighted.current;
    // Base UI leaves Enter with a modifier to the application: it chooses the highlighted option.
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && item) {
      event.preventDefault();
      act(item, true);
      return;
    }
    // Page Up and Page Down move the highlight a list's height, stopping at the ends, as that many
    // presses of the arrow keys would, so Base UI keeps the highlight and its scrolling.
    if ((event.key === 'PageDown' || event.key === 'PageUp') && items.length > 0) {
      event.preventDefault();
      const down = event.key === 'PageDown';
      const steps = Math.min(pageSize(), down ? items.length - 1 - index : index);
      for (let step = 0; step < steps; step += 1)
        event.currentTarget.dispatchEvent(
          new KeyboardEvent('keydown', { key: down ? 'ArrowDown' : 'ArrowUp', bubbles: true }),
        );
    }
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
    <BaseDialog.Root
      open={open}
      onOpenChange={(next, eventDetails) => {
        if (keepsOpen(portal, next, eventDetails)) {
          eventDetails.cancel();
          return;
        }
        onOpenChange(next, { reason: eventDetails.reason as DialogOpenChangeReason });
      }}
      modal={containedModal(portal, true)}
    >
      <BaseDialog.Portal container={portal.container}>
        <OverlayTheme {...theme}>
          <ResetControlDefaults>
            <DialogBackdrop />
            <div className="env-command-palette-positioner">
              <BaseDialog.Popup
                {...popupProps}
                render={<Column padding={2} />}
                className={classNames('env-command-palette', className)}
                aria-label={label}
                initialFocus={portal.contained ? false : input}
                {...(portal.contained && { finalFocus: false })}
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
                  onItemHighlighted={(item: CommandPaletteItem | undefined, details) => {
                    highlighted.current = { item, index: item ? details.index : -1 };
                  }}
                >
                  {/* The search is a ghost TextField's frame around Autocomplete's input, kept
                    solid on the frosted palette (CommandPalette.css). Under a coarse pointer, where
                    there is no Esc, a close button follows it; elsewhere it doesn't show. */}
                  <Row align="center" gap={2} className="env-command-palette-header">
                    <FieldFrame
                      id={searchId}
                      floatingLabel
                      variant="ghost"
                      size="lg"
                      startIcon={loading && !empty ? <Spinner size="sm" /> : <IconSearch />}
                      className="env-command-palette-search"
                    >
                      <BaseAutocomplete.Input
                        ref={input}
                        id={searchId}
                        className="env-text-field-input env-command-palette-input"
                        aria-label={label}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        placeholder={placeholder}
                        onKeyDown={onKeyDown}
                      />
                    </FieldFrame>
                    <BaseDialog.Close
                      render={
                        <IconButton
                          variant="ghost"
                          icon={<IconClose />}
                          aria-label={dialogMessages.close}
                          className="env-command-palette-close"
                        />
                      }
                    />
                  </Row>
                  <BaseAutocomplete.List
                    ref={list}
                    render={<Grid />}
                    className="env-command-palette-list"
                    aria-label={label}
                    aria-busy={loading || undefined}
                    hidden={empty}
                  >
                    {grouped
                      ? (section: Section) =>
                          section.label === undefined ? (
                            <BaseAutocomplete.Group key={section.id} items={section.items}>
                              <BaseAutocomplete.Collection>
                                {renderItem}
                              </BaseAutocomplete.Collection>
                            </BaseAutocomplete.Group>
                          ) : (
                            <BaseAutocomplete.Group
                              key={section.id}
                              items={section.items}
                              render={<Grid />}
                              className="env-command-palette-group"
                            >
                              <BaseAutocomplete.GroupLabel className="env-command-palette-group-label">
                                {section.label}
                              </BaseAutocomplete.GroupLabel>
                              <BaseAutocomplete.Collection>
                                {renderItem}
                              </BaseAutocomplete.Collection>
                            </BaseAutocomplete.Group>
                          )
                      : renderItem}
                  </BaseAutocomplete.List>
                  {/* One polite status: the number of results as they change, or the loading label
                    while they load, read by assistive technology only, or the empty state, shown in
                    place of the list: its title and description are announced, and its icon is
                    decorative. */}
                  <BaseAutocomplete.Status
                    className="env-command-palette-status"
                    data-empty={flag(empty)}
                  >
                    {empty ? (
                      <>
                        {icon != null && icon !== false && (
                          <span className="env-command-palette-empty-icon">
                            {loading ? icon : <DecorativeIcon>{icon}</DecorativeIcon>}
                          </span>
                        )}
                        <span className="env-command-palette-empty-title">{title}</span>
                        {description != null && description !== false && (
                          <>
                            {/* A space between the lines, so they are read as two. */}{' '}
                            <span className="env-command-palette-empty-description">
                              {description}
                            </span>
                          </>
                        )}
                      </>
                    ) : loading ? (
                      (loadingLabel ?? messages.loading)
                    ) : (
                      messages.results({
                        count: items.length,
                        countText: number.format(items.length),
                      })
                    )}
                  </BaseAutocomplete.Status>
                </BaseAutocomplete.Root>
                {(Boolean(hints?.length) || footer != null) && (
                  <Row wrap align="center" className="env-command-palette-footer">
                    {hints?.map((hint, hintIndex) => (
                      <Row
                        key={hintIndex}
                        render={<span />}
                        align="center"
                        gap={2}
                        className="env-command-palette-hint"
                      >
                        <Kbd keys={hint.keys} />
                        <span>{hint.label}</span>
                      </Row>
                    ))}
                    {footer != null && (
                      <span className="env-command-palette-footer-content">{footer}</span>
                    )}
                  </Row>
                )}
              </BaseDialog.Popup>
            </div>
          </ResetControlDefaults>
        </OverlayTheme>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
