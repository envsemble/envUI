'use client';

import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import {
  useId,
  useRef,
  type ComponentPropsWithoutRef,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { Column, Row } from '../layout/Layout.js';
import { FieldFrame } from '../internal/field/FieldFrame.js';
import { Slot } from '../internal/layout/Slot.js';
import { useLocale, useMessages } from '../internal/provider/EnvUIContext.js';
import { IconSearch } from '../icons/Search.js';
import { IconClose } from '../icons/Close.js';
import { IconButton } from './Button.js';
import { dialog } from '../foundations/messages/dialog.js';
import { Spinner } from '../feedback/Spinner.js';
import { ModalLayer } from '../internal/dialog/ModalLayer.js';
import type { DialogOpenChangeReason } from '../overlays/Dialog.js';
import {
  containedFocus,
  containedModal,
  containedOpenChange,
  usePortalContainer,
} from '../internal/popup/PortalContainerContext.js';
import { CommandPaletteFooter } from './internal/CommandPaletteFooter.js';
import {
  CommandPaletteOptions,
  sectionsOf,
  textOf,
  type SectionsBaseUiTakesAsItsGroups,
} from './internal/CommandPaletteOptions.js';
import { CommandPaletteStatus } from './internal/CommandPaletteStatus.js';
import { useCommandPaletteKeys } from './internal/useCommandPaletteKeys.js';
import '../styles/Base.css';
import '../styles/CommandPalette.css';

export interface CommandPaletteItem {
  /** Stable identifier; options carry it as data-item-id. */
  id: string;
  /** The option's text; also its accessible name unless textValue is set. */
  label: ReactNode;
  /**
   * The label as plain text, where the label is content rather than text.
   * @default the label when it is a string, else the label's rendered text
   */
  textValue?: string;
  /** Muted text under the label, such as a folder path. */
  description?: ReactNode;
  /**
   * Content before the label, such as an icon or a person's Avatar among the results: an envUI icon
   * takes the icon size and other content keeps its own. It is hidden from assistive technology.
   */
  start?: ReactNode;
  /** End content, such as a Kbd shortcut or a Badge. */
  end?: ReactNode;
  /** The option shows but can't be chosen, such as a command that doesn't apply here. */
  disabled?: boolean;
  /**
   * More props for the option's element, such as a title or data attributes for tests. Its class
   * joins the option's; the option's role, id and ARIA attributes stay its own.
   */
  itemProps?: CommandPaletteItemElementProps;
  /** Reserved: an entry with an `items` array is a group, so an item has none. */
  items?: never;
}

/** What a CommandPalette item's itemProps can set on its option element. */
export type CommandPaletteItemElementProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'id' | 'role' | 'tabIndex' | 'dangerouslySetInnerHTML' | `aria-${string}`
> & { [attribute: `data-${string}`]: string | number | boolean | undefined };

/** Items of a CommandPalette under a heading, which also names the group for assistive technology. */
export interface CommandPaletteGroup {
  /** The group's heading: text, or content such as an icon or a count beside the group's name. */
  label: ReactNode;
  /** The items under the heading, in display order; a group with none shows no heading. */
  items: readonly CommandPaletteItem[];
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

export interface CommandPaletteProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'defaultValue' | 'onChange'
> {
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
  /**
   * Filtered and ranked by the application, in display order; or groups of items, each under a
   * heading.
   */
  items: readonly CommandPaletteItem[] | readonly CommandPaletteGroup[];
  /**
   * Shown in place of items while the search field is empty, such as recent documents or
   * suggested pages under a group heading; options like any other.
   */
  suggestedItems?: readonly CommandPaletteItem[] | readonly CommandPaletteGroup[];
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
   * The results are on their way, such as from a server. A spinner shows at the search field's end;
   * with no results to show yet, the empty state's line says loadingLabel, and results already
   * shown stay, marked busy.
   * @default false
   */
  loading?: boolean;
  /**
   * Shown and announced while loading.
   * @default 'Searching…', or EnvUIProvider's messages.commandPalette.loading
   */
  loadingLabel?: ReactNode;
  /**
   * The title of the EmptyState shown in place of the list when there are no options, and
   * announced.
   * @default 'Type to search' while the search field is empty and 'No results' when its text
   * finds nothing, or EnvUIProvider's messages.commandPalette.emptyQuery and empty
   */
  emptyLabel?: ReactNode;
  /**
   * The empty state's description below its title, such as what the palette searches; null or
   * false shows none.
   * @default None while the search field is empty; when its text finds nothing, 'Nothing matches
   * “…”. Check the spelling or try other words.', or messages.commandPalette.emptyHint
   */
  emptyDescription?: ReactNode;
  /**
   * A decorative icon above the empty state's title, such as an error icon when the search
   * failed; none by default.
   */
  emptyIcon?: ReactNode;
  /**
   * Key hints below the list, such as { keys: ['Enter'], label: 'Open' }. A hint with Enter in its
   * keys hides while there is no option to choose.
   */
  hints?: readonly CommandPaletteHint[];
  /** Other content below the list, after the hints. */
  footer?: ReactNode;
  /** Content before the search field in its row, such as a scope chip, In: Projects. */
  searchStart?: ReactNode;
  /** Content after the search field in its row, before the close button, such as a mode switch. */
  searchEnd?: ReactNode;
}

/**
 * A quick-open dialog near the top of the window: a search field over a list of options the
 * application filters and ranks. The arrow keys move the highlight while typing continues, and the
 * number of results is announced as it changes. className, style, ref and data attributes go to
 * the dialog's surface.
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
  searchStart,
  searchEnd,
  className,
  ...popupProps
}: CommandPaletteProps) {
  const portal = usePortalContainer();
  const locale = useLocale();
  const dialogMessages = useMessages('dialog', dialog);
  const input = useRef<HTMLInputElement>(null);
  const searchId = useId();
  const list = useRef<HTMLDivElement>(null);
  const query = inputValue.trim();
  const showSuggestions = query === '' && suggestedItems !== undefined;
  const sections = sectionsOf(showSuggestions ? suggestedItems : results);
  const items = sections.flatMap((section) => section.items);
  const grouped = sections.some((section) => section.heading != null);
  const empty = items.length === 0;

  function act(item: CommandPaletteItem, modifier: boolean) {
    if (item.disabled) return;
    onAction(item, { modifier });
    if (closeOnAction) onOpenChange(false, { reason: 'item-press' });
  }
  const keys = useCommandPaletteKeys({ list, count: items.length, onAct: act });

  return (
    <BaseDialog.Root
      open={open}
      onOpenChange={containedOpenChange(portal, null, (next, eventDetails) =>
        onOpenChange(next, { reason: eventDetails.reason }),
      )}
      modal={containedModal(portal, true)}
    >
      <BaseDialog.Portal container={portal.container}>
        <ModalLayer backdrop={{}}>
          <div className="env-command-palette-positioner">
            <BaseDialog.Popup
              {...popupProps}
              render={<Column padding={2} />}
              className={classNames('env-command-palette', className)}
              aria-label={label}
              initialFocus={containedFocus(portal, input)}
              {...(portal.contained && { finalFocus: false })}
            >
              <BaseAutocomplete.Root
                open
                inline
                items={grouped ? (sections as unknown as SectionsBaseUiTakesAsItsGroups) : items}
                filter={null}
                autoHighlight="always"
                keepHighlight
                locale={locale}
                itemToStringValue={(item: CommandPaletteItem) => textOf(item, list.current)}
                value={inputValue}
                onValueChange={(next, details) => {
                  const optionChosen = details.reason === 'item-press';
                  if (optionChosen) return;
                  onInputValueChange(next);
                }}
                onItemHighlighted={(item: CommandPaletteItem | undefined, details) =>
                  keys.onHighlight(item, details.index)
                }
              >
                <Row align="center" gap={2} className="env-command-palette-header">
                  {searchStart != null && (
                    <Slot className="env-command-palette-search-start" layout="row" shrink="never">
                      {searchStart}
                    </Slot>
                  )}
                  <FieldFrame
                    id={searchId}
                    controlBox
                    variant="ghost"
                    size="lg"
                    startIcon={<IconSearch />}
                    endAction={loading ? <Spinner size="sm" /> : undefined}
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
                      onKeyDown={keys.onKeyDown}
                    />
                  </FieldFrame>
                  {searchEnd != null && (
                    <Slot className="env-command-palette-search-end" layout="row" shrink="never">
                      {searchEnd}
                    </Slot>
                  )}
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
                <CommandPaletteOptions
                  grouped={grouped}
                  label={label}
                  loading={loading}
                  empty={empty}
                  listRef={list}
                  onAct={act}
                />
                <CommandPaletteStatus
                  count={items.length}
                  query={query}
                  loading={loading}
                  loadingLabel={loadingLabel}
                  emptyLabel={emptyLabel}
                  emptyDescription={emptyDescription}
                  emptyIcon={emptyIcon}
                />
              </BaseAutocomplete.Root>
              <CommandPaletteFooter hints={hints} footer={footer} empty={empty} />
            </BaseDialog.Popup>
          </div>
        </ModalLayer>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
