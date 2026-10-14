import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
  type Ref,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { setRef } from '../internal/setRef.js';
import { Theme, useTheme } from '../foundations/Theme.js';
import { Surface } from '../foundations/Surface.js';
import { Spinner } from '../feedback/Spinner.js';
import { Check } from '../icons/Check.js';
import { ChevronRight } from '../icons/ChevronRight.js';
import { Close } from '../icons/Close.js';
import {
  FieldFrame,
  isLabelShown,
  type FieldProps,
  type FieldWellProps,
} from './internal/FieldFrame.js';
import { subscribeFormReset } from './internal/subscribeFormReset.js';
import { useFieldMetadata } from './internal/useFieldMetadata.js';
import { useTextDirection } from './internal/useTextDirection.js';

/** One option of a Combobox. */
export interface ComboboxItem {
  /** Stable identifier: the value the field reports and submits. */
  value: string;
  /** Names the option; the field shows it once chosen, and the default filter matches it. */
  label: string;
  /** A muted second line, such as an e-mail address; the default filter matches it too. */
  description?: string;
  /** Content before the label, such as an Avatar or an icon; it takes the size of its slot. */
  leading?: ReactNode;
  disabled?: boolean;
}

/** Options under a heading, which also names the group for assistive technology. */
export interface ComboboxGroup<Item extends ComboboxItem = ComboboxItem> {
  label: string;
  items: readonly Item[];
}

/** Whether an option matches the text typed into the field. */
export type ComboboxFilter<Item extends ComboboxItem = ComboboxItem> = (
  item: Item,
  query: string,
) => boolean;

interface ComboboxSharedProps<Item extends ComboboxItem>
  extends Omit<
      ComponentPropsWithoutRef<'input'>,
      'value' | 'defaultValue' | 'onChange' | 'type' | 'children' | 'multiple' | 'list' | 'size'
    >,
    FieldProps {
  ref?: Ref<HTMLInputElement>;
  /** The options, or groups of options under headings, in display order. */
  items: readonly Item[] | readonly ComboboxGroup<Item>[];
  /**
   * Which options match the typed text: by default those whose label or description contains it,
   * ignoring case and accents. null shows the items as given, for searching on the server.
   */
  filter?: ComboboxFilter<Item> | null;
  /** Receives the typed text, and an empty string once it is cleared, such as to search a server. */
  onInputValueChange?: (query: string) => void;
  /** The options are loading: the popup shows loadingLabel instead of emptyLabel. */
  loading?: boolean;
  /** Shown in the popup while loading; Loading… by default. */
  loadingLabel?: ReactNode;
  /** Shown in the popup when no option matches; No matches by default. */
  emptyLabel?: ReactNode;
  /**
   * standard (default) is the text field of forms; compact takes the compact control height, like
   * a compact Select, and the compact menu's popup.
   */
  density?: 'standard' | 'compact';
  /**
   * Show the label inside the field, where it floats into the outline while the field has focus or
   * a value. Defaults to true, and to false for compact fields, which can use a placeholder instead.
   */
  showLabel?: boolean;
  /** A clear button removes the value while there is one; Esc on the closed field clears it too. */
  clearable?: boolean;
  /** Accessible name of the clear button; Clear by default. */
  clearLabel?: string;
  /** Accessible name of a chip's remove button; Remove followed by the label by default. */
  removeLabel?: (label: string) => string;
  open?: boolean;
  defaultOpen?: boolean;
  /** Called as the popup opens and closes, such as to load the options as it opens. */
  onOpenChange?: (open: boolean) => void;
  /** The locale of the default filter's matching; the browser's by default. */
  locale?: string;
}

interface ComboboxSingleProps<Item extends ComboboxItem> {
  multiple?: false;
  /** The chosen option's value, or null for none. */
  value?: string | null;
  defaultValue?: string | null;
  /** Receives the chosen value and its option, or null twice once the field is cleared. */
  onValueChange?: (value: string | null, item: Item | null) => void;
}

interface ComboboxMultipleProps<Item extends ComboboxItem> {
  /** Several options can be chosen; they show as chips in the field. */
  multiple: true;
  /** The chosen values, in the order they were chosen. */
  value?: readonly string[];
  defaultValue?: readonly string[];
  /** Receives the chosen values and their options. */
  onValueChange?: (value: string[], items: Item[]) => void;
}

export type ComboboxProps<Item extends ComboboxItem = ComboboxItem> = ComboboxSharedProps<Item> &
  (ComboboxSingleProps<Item> | ComboboxMultipleProps<Item>);

type ChangeDetails = BaseCombobox.Root.ChangeEventDetails;

/** Changes of the typed text that people make, rather than the field filling in a chosen label. */
const typedChanges = new Set(['input-change', 'input-clear', 'clear-press', 'escape-key']);

function defaultRemoveLabel(label: string) {
  return `Remove ${label}`;
}

/** A chosen value the field never saw among the options stands for itself, as its chip shows. */
function standIn<Item extends ComboboxItem>(value: string) {
  return { value, label: value } as Item;
}

function isGroup<Item extends ComboboxItem>(
  entry: Item | ComboboxGroup<Item>,
): entry is ComboboxGroup<Item> {
  return Array.isArray((entry as ComboboxGroup<Item>).items);
}

function flattenItems<Item extends ComboboxItem>(
  items: readonly Item[] | readonly ComboboxGroup<Item>[],
) {
  return (items as readonly (Item | ComboboxGroup<Item>)[]).flatMap((entry) =>
    isGroup(entry) ? entry.items : [entry],
  );
}

/** Field geometry in rem follows the reader's text size; Base UI positions in pixels. */
function remPixels(element: Element | null) {
  if (!element) return 16;
  return Number.parseFloat(getComputedStyle(element.ownerDocument.documentElement).fontSize) || 16;
}

/**
 * A text field that filters a list of options as people type, for choosing one option or several.
 * Chosen options show as removable chips; keyboard, focus and announcements follow the WAI-ARIA
 * combobox pattern.
 */
export function Combobox<Item extends ComboboxItem = ComboboxItem>(props: ComboboxProps<Item>) {
  const {
    ref,
    items,
    filter,
    onInputValueChange,
    loading = false,
    loadingLabel = 'Loading…',
    emptyLabel = 'No matches',
    density = 'standard',
    showLabel,
    clearable = false,
    clearLabel = 'Clear',
    removeLabel = defaultRemoveLabel,
    open,
    defaultOpen,
    onOpenChange,
    locale,
    label,
    hint,
    error,
    name,
    form,
    required,
    disabled = false,
    readOnly = false,
    placeholder,
    id: suppliedId,
    className,
    'aria-describedby': describedBy,
    'aria-invalid': invalid,
    multiple,
    value,
    defaultValue,
    onValueChange,
    ...inputProps
  } = props;
  const isMultiple = multiple === true;
  const compact = density === 'compact';
  const metadata = useFieldMetadata(suppliedId, hint, error, describedBy, invalid);
  const { id } = metadata;
  const labelId = `${id}-label`;
  const selectionId = `${id}-selection`;
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const nativeRef = useRef<HTMLInputElement>(null);
  const pressFocus = useRef(false);
  // The query onInputValueChange reported last.
  const reportedQuery = useRef('');
  const direction = useTextDirection(inputRef);

  // The field keeps an uncontrolled value itself, so a native form reset can restore it.
  const defaultSelection = isMultiple
    ? [...((defaultValue as readonly string[] | undefined) ?? [])]
    : ((defaultValue as string | null | undefined) ?? null);
  const defaultKey = JSON.stringify(defaultSelection);
  const [uncontrolledValue, setUncontrolledValue] = useState<readonly string[] | string | null>(
    defaultSelection,
  );
  const selection = value === undefined ? uncontrolledValue : isMultiple ? value : (value ?? null);
  const selectedValues: readonly string[] = Array.isArray(selection)
    ? selection
    : selection == null
      ? []
      : [selection as string];
  const selectedKey = selectedValues.join('\u0000');

  // Chosen options stay labelled while the options change, such as with each server search.
  const flatItems = useMemo(() => flattenItems(items), [items]);
  const knownRef = useRef(new Map<string, Item>());
  const known = useMemo(() => {
    const map = new Map(flatItems.map((item) => [item.value, item] as const));
    for (const selected of selectedKey ? selectedKey.split('\u0000') : []) {
      const previous = knownRef.current.get(selected);
      if (!map.has(selected) && previous) map.set(selected, previous);
    }
    return map;
  }, [flatItems, selectedKey]);
  useLayoutEffect(() => {
    knownRef.current = known;
  });
  const labelOf = (selected: string) => known.get(selected)?.label ?? selected;
  const collection = useMemo(
    () =>
      BaseCombobox.createItems<Item, string>(items as never, {
        getValue: (item: Item) => item.value,
        getLabel: (item: Item) => item.label,
      }),
    [items],
  );
  const hasLeading = flatItems.some((item) => item.leading != null);
  const grouped = flatItems.length > 0 && isGroup((items as readonly unknown[])[0] as Item);

  const matcher = BaseCombobox.useFilter({ locale, multiple: true });
  const baseFilter = useMemo(
    () =>
      filter === null
        ? null
        : (filter ??
          ((item: Item, query: string) =>
            matcher.contains(item.label, query) ||
            (item.description != null && matcher.contains(item.description, query)))),
    [filter, matcher],
  );

  // The typed text, to show the chosen option's leading content only while the field shows its label.
  const singleItem = isMultiple || selection == null ? undefined : known.get(selection as string);
  const [inputText, setInputText] = useState(() => singleItem?.label ?? '');
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
  const popupOpen = open ?? uncontrolledOpen;

  function changeOpen(next: boolean) {
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  useEffect(
    function subscribeToFormReset() {
      const input = nativeRef.current;
      const ownerForm = input?.form;
      if (!input || !ownerForm) return;
      return subscribeFormReset(ownerForm, function applyReset() {
        if (value === undefined) setUncontrolledValue(JSON.parse(defaultKey));
      });
    },
    [value, defaultKey, form],
  );

  function handleValueChange(next: string[] | string | null, details: ChangeDetails) {
    if (details.isCanceled) return;
    // Esc and emptying the text clear only a clearable single field that has a value. They keep
    // the value otherwise, and Esc never removes chips, which go one at a time or with the clear
    // button; Esc then goes on, such as to close a dialog.
    const escape = details.reason === 'escape-key';
    const clearing = escape || (!isMultiple && details.reason === 'input-clear');
    if (clearing && (!clearable || selectedValues.length === 0 || (isMultiple && escape))) {
      details.cancel();
      details.allowPropagation();
      // Emptied text shows every option to choose another; closing the popup restores the label.
      if (details.reason === 'input-clear' && !popupOpen) changeOpen(true);
      return;
    }
    if (value === undefined) setUncontrolledValue(next);
    if (isMultiple) {
      const values = [...((next as readonly string[] | null) ?? [])];
      (onValueChange as ComboboxMultipleProps<Item>['onValueChange'])?.(
        values,
        values.map((selected) => known.get(selected) ?? standIn<Item>(selected)),
      );
    } else {
      const single = (next as string | null) ?? null;
      (onValueChange as ComboboxSingleProps<Item>['onValueChange'])?.(
        single,
        single == null ? null : (known.get(single) ?? null),
      );
    }
  }

  function handleInputValueChange(next: string, details: ChangeDetails) {
    if (details.isCanceled) return;
    if (details.reason === 'escape-key' && !clearable) {
      details.cancel();
      details.allowPropagation();
      return;
    }
    setInputText(next);
    if (typedChanges.has(details.reason)) {
      reportedQuery.current = next;
      onInputValueChange?.(next);
    } else if (!isMultiple && reportedQuery.current !== '') {
      // The field shows the chosen label again, after a choice or when people leave a query:
      // the query is over, so options found for it, such as on a server, go with it.
      reportedQuery.current = '';
      onInputValueChange?.('');
    }
  }

  function popupOffset() {
    return remPixels(inputRef.current) * (compact ? 0.25 : 0.5);
  }

  const hasChips = isMultiple && selectedValues.length > 0;
  const labelShown = label != null && isLabelShown({ compact, showLabel });
  // A floating label needs a blank placeholder to detect the empty state; chips fill the field.
  const fieldPlaceholder = hasChips ? undefined : labelShown ? placeholder || ' ' : placeholder;
  const description =
    [hasChips && selectionId, metadata['aria-describedby']].filter(Boolean).join(' ') || undefined;
  const showClear = clearable && !disabled && !readOnly;
  // The clear button shows while there is a value to clear; the well keeps room for it only then.
  const clearShown = showClear && selectedValues.length > 0;
  const showLeading = singleItem?.leading != null && inputText === singleItem.label && !isMultiple;
  const ariaLabel = inputProps['aria-label'];
  const toolbarName =
    label != null ? { 'aria-labelledby': labelId } : ariaLabel ? { 'aria-label': ariaLabel } : {};

  function renderWell(wellProps: FieldWellProps) {
    const props = {
      ...wellProps,
      className: classNames(wellProps.className, 'env-combobox-well'),
      'data-actions': clearShown ? '2' : '1',
    };
    if (!isMultiple) return <BaseCombobox.InputGroup {...props} />;
    // Chips and the text input share the well, so Backspace and the arrow keys reach the chips.
    return (
      <BaseCombobox.InputGroup
        {...props}
        {...(hasChips ? { role: 'toolbar', ...toolbarName } : {})}
        render={<BaseCombobox.Chips />}
      />
    );
  }

  // Focusing a single field that shows its chosen label selects the label, so typing replaces it
  // with a query. A press keeps that selection rather than placing the caret.
  const selectsLabel = (input: HTMLInputElement) =>
    !isMultiple && !readOnly && singleItem !== undefined && input.value === singleItem.label;

  return (
    <DirectionProvider direction={direction}>
      <BaseCombobox.Root<string, boolean, Item>
        items={collection}
        multiple={isMultiple}
        value={selection as string[] | string | null}
        onValueChange={handleValueChange}
        onInputValueChange={handleInputValueChange}
        itemToStringLabel={labelOf}
        filter={baseFilter}
        locale={locale}
        // The first match is highlighted, also when options arrive after typing, such as from a
        // server, so Enter chooses it. Base UI documents 'always' for Autocomplete, which shares
        // the Combobox's implementation.
        autoHighlight={'always' as never}
        open={popupOpen}
        onOpenChange={changeOpen}
        name={name}
        form={form}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        id={id}
        inputRef={nativeRef}
      >
        <FieldFrame
          id={id}
          label={
            label != null ? (
              <label htmlFor={id} id={labelId}>
                {label}
              </label>
            ) : null
          }
          hint={hint}
          error={error}
          floatingLabel
          compact={compact}
          showLabel={showLabel}
          className="env-combobox"
          renderWell={renderWell}
        >
          {showLeading && (
            <span className="env-combobox-leading env-combobox-value-leading" aria-hidden="true">
              {singleItem.leading}
            </span>
          )}
          {isMultiple &&
            selectedValues.map((selected) => {
              const item = known.get(selected);
              const text = labelOf(selected);
              return (
                <BaseCombobox.Chip key={selected} className="env-combobox-chip">
                  {item?.leading != null && (
                    <span className="env-combobox-leading" aria-hidden="true">
                      {item.leading}
                    </span>
                  )}
                  <span className="env-combobox-chip-label">{text}</span>
                  {!disabled && !readOnly && (
                    <BaseCombobox.ChipRemove
                      className="env-combobox-chip-remove"
                      aria-label={removeLabel(text)}
                    >
                      <Close />
                    </BaseCombobox.ChipRemove>
                  )}
                </BaseCombobox.Chip>
              );
            })}
          <BaseCombobox.Input
            {...inputProps}
            ref={(node: HTMLInputElement | null) => {
              inputRef.current = node;
              setRef(ref, node);
            }}
            id={id}
            onPointerDown={(event) => {
              inputProps.onPointerDown?.(event);
              pressFocus.current =
                event.currentTarget.ownerDocument.activeElement !== event.currentTarget;
            }}
            onFocus={(event) => {
              inputProps.onFocus?.(event);
              if (selectsLabel(event.currentTarget)) event.currentTarget.select();
            }}
            onMouseUp={(event) => {
              inputProps.onMouseUp?.(event);
              if (pressFocus.current && selectsLabel(event.currentTarget)) event.preventDefault();
              pressFocus.current = false;
            }}
            aria-invalid={metadata['aria-invalid']}
            aria-describedby={description}
            placeholder={fieldPlaceholder}
            className={classNames('env-text-input', 'env-combobox-input', className)}
          />
          {/* The well reserves room for its actions, which stay at its end. */}
          <span className="env-text-field-end env-combobox-end">
            {showClear && (
              <BaseCombobox.Clear
                className="env-button env-button-text env-icon-button env-combobox-clear"
                aria-label={clearLabel}
                title={clearLabel}
              >
                <DecorativeIcon>
                  <Close />
                </DecorativeIcon>
              </BaseCombobox.Clear>
            )}
            <BaseCombobox.Trigger
              className="env-button env-button-text env-icon-button env-combobox-trigger"
              {...(label != null ? { 'aria-labelledby': labelId } : { 'aria-label': ariaLabel })}
            >
              <DecorativeIcon>
                <ChevronRight />
              </DecorativeIcon>
            </BaseCombobox.Trigger>
          </span>
        </FieldFrame>
        {hasChips && (
          // Read with the field, so the chosen options are known before the hint.
          <span id={selectionId} hidden>
            {selectedValues.map(labelOf).join(', ')}
          </span>
        )}
        <BaseCombobox.Portal>
          <Theme theme={theme}>
            <BaseCombobox.Positioner
              className="env-select-positioner"
              side="bottom"
              align="start"
              sideOffset={popupOffset}
              collisionPadding={8}
            >
              <BaseCombobox.Popup
                className="env-dropdown-options env-combobox-popup"
                render={<Surface padding={compact ? 1 : 2} density={density} />}
                aria-busy={loading || undefined}
              >
                <BaseCombobox.Status className="env-combobox-status">
                  {loading ? (
                    <>
                      <Spinner size="small" />
                      {loadingLabel}
                    </>
                  ) : null}
                </BaseCombobox.Status>
                <BaseCombobox.Empty className="env-combobox-empty">
                  {loading ? null : emptyLabel}
                </BaseCombobox.Empty>
                <BaseCombobox.List className="env-dropdown-list env-combobox-list">
                  {(entry: Item | ComboboxGroup<Item>) =>
                    grouped && isGroup(entry) ? (
                      <BaseCombobox.Group
                        key={entry.label}
                        items={entry.items as Item[]}
                        className="env-combobox-group"
                      >
                        <BaseCombobox.GroupLabel className="env-combobox-group-label">
                          {entry.label}
                        </BaseCombobox.GroupLabel>
                        <BaseCombobox.Collection>
                          {(item: Item) => (
                            <ComboboxOption key={item.value} item={item} leadingSlot={hasLeading} />
                          )}
                        </BaseCombobox.Collection>
                      </BaseCombobox.Group>
                    ) : (
                      <ComboboxOption
                        key={(entry as Item).value}
                        item={entry as Item}
                        leadingSlot={hasLeading}
                      />
                    )
                  }
                </BaseCombobox.List>
              </BaseCombobox.Popup>
            </BaseCombobox.Positioner>
          </Theme>
        </BaseCombobox.Portal>
      </BaseCombobox.Root>
    </DirectionProvider>
  );
}

/** An option row: a check mark slot, optional leading content, the label and its description. */
function ComboboxOption<Item extends ComboboxItem>({
  item,
  leadingSlot,
}: {
  item: Item;
  leadingSlot: boolean;
}) {
  const descriptionId = useId();
  return (
    <BaseCombobox.Item
      value={item.value}
      disabled={item.disabled}
      className="env-combobox-option"
      aria-describedby={item.description ? descriptionId : undefined}
    >
      <span className="env-combobox-check" aria-hidden="true">
        <BaseCombobox.ItemIndicator className="env-symbol">
          <Check />
        </BaseCombobox.ItemIndicator>
      </span>
      {leadingSlot && (
        <span className="env-combobox-leading" aria-hidden="true">
          {item.leading}
        </span>
      )}
      <span className="env-combobox-option-text">
        <span className="env-combobox-option-label">{item.label}</span>
        {item.description ? (
          // Announced through aria-describedby rather than as part of the option's name.
          <span className="env-combobox-option-description" id={descriptionId} aria-hidden="true">
            {item.description}
          </span>
        ) : null}
      </span>
    </BaseCombobox.Item>
  );
}
