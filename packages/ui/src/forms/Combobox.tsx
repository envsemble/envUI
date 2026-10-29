'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import { setRef } from '../internal/setRef.js';
import { useDirection } from '../internal/useDirection.js';
import { useLocale, useMessages } from '../internal/EnvUIContext.js';
import {
  keepsOpen,
  useKeepPageVisible,
  usePortalContainer,
} from '../internal/PortalContainerContext.js';
import { type ControlSize } from '../foundations/Theme.js';
import { combobox as comboboxMessages } from '../foundations/messages/combobox.js';
import { common as commonMessages } from '../foundations/messages/common.js';
import { IconButton } from '../actions/Button.js';
import { ChevronRight } from '../icons/ChevronRight.js';
import { Close } from '../icons/Close.js';
import {
  FieldFrame,
  isLabelShown,
  type FieldControlBoxProps,
  type FieldProps,
} from './internal/FieldFrame.js';
import { subscribeFormReset } from './internal/subscribeFormReset.js';
import { flattenItems, isGroup, standIn } from './internal/comboboxItems.js';
import { ComboboxPopup } from './internal/ComboboxPopup.js';
import { useFieldMetadata } from './internal/useFieldMetadata.js';
import '../styles/Base.css';
import '../styles/Combobox.css';

/** One option of a Combobox. */
export interface ComboboxItem {
  /** Stable identifier: the value the field reports and submits. */
  value: string;
  /** Names the option; the field shows it once chosen, and the default filter matches it. */
  label: string;
  /** A muted second line, such as an e-mail address; the default filter matches it too. */
  description?: string;
  /** Content before the label, such as an Avatar or an icon; it takes the size of its slot. */
  start?: ReactNode;
  /** The option shows but can't be chosen. */
  disabled?: boolean;
}

/** Options under a heading, which also names the group for assistive technology. */
export interface ComboboxGroup<Item extends ComboboxItem = ComboboxItem> {
  /** The group's heading. */
  label: string;
  /** The options under the heading, in display order. */
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
  /** The text input, so that a form library can register it and focus it. */
  ref?: Ref<HTMLInputElement>;
  /** The field's class, on its root element, beside env-field and env-combobox. */
  className?: string;
  /** Styles of the field's root element. */
  style?: CSSProperties;
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
  /**
   * Shown in the popup while loading.
   * @default 'Loading…', or EnvUIProvider's messages.combobox.loading
   */
  loadingLabel?: ReactNode;
  /**
   * Shown in the popup when no option matches.
   * @default 'No matches', or EnvUIProvider's messages.combobox.empty
   */
  emptyLabel?: ReactNode;
  /**
   * The field's look, as TextField's: outline, at the control height, or floating, 3.5 rem tall
   * with room for its label, for long forms on a page.
   * @default 'outline'
   */
  variant?: 'outline' | 'floating';
  /**
   * The field's height, as on every control: sm, md or lg in the current scale. Without it, the
   * field takes the control height of its container, md unless the container sets another. The
   * popup's rows take the row height of the scale.
   */
  size?: ControlSize;
  /**
   * Show the label inside the field, where it floats into the outline while the field has focus or
   * a value. Set false for a field whose purpose is clear without it; a placeholder then gives the
   * visible guidance.
   * @default true
   */
  showLabel?: boolean;
  /** A clear button removes the value while there is one; Esc on the closed field clears it too. */
  clearable?: boolean;
  /**
   * Accessible name of the clear button.
   * @default 'Clear', or EnvUIProvider's messages.common.clear
   */
  clearLabel?: string;
  /**
   * Accessible name of a chip's remove button, from the chip's label.
   * @default Remove followed by the label, or EnvUIProvider's messages.combobox.remove
   */
  removeLabel?: (label: string) => string;
  /** Whether the list is open; with `onOpenChange` it controls the popup. */
  open?: boolean;
  /** Whether an uncontrolled list starts open; closed by default. */
  defaultOpen?: boolean;
  /** Called as the popup opens and closes, such as to load the options as it opens. */
  onOpenChange?: (open: boolean) => void;
  /** The locale of the default filter's matching: EnvUIProvider's, else the browser's. */
  locale?: string;
}

interface ComboboxSingleProps<Item extends ComboboxItem> {
  multiple?: false;
  /** The chosen option's value, or null for none. */
  value?: string | null;
  /** The value an uncontrolled field starts with, and that a form reset restores; none by default. */
  defaultValue?: string | null;
  /** Receives the chosen value and its option, or null twice once the field is cleared. */
  onValueChange?: (value: string | null, item: Item | null) => void;
}

interface ComboboxMultipleProps<Item extends ComboboxItem> {
  /** Several options can be chosen; they show as chips in the field. */
  multiple: true;
  /** The chosen values, in the order they were chosen. */
  value?: readonly string[];
  /** The values an uncontrolled field starts with, and that a form reset restores; none by default. */
  defaultValue?: readonly string[];
  /** Receives the chosen values and their options. */
  onValueChange?: (value: string[], items: Item[]) => void;
}

export type ComboboxProps<Item extends ComboboxItem = ComboboxItem> = ComboboxSharedProps<Item> &
  (ComboboxSingleProps<Item> | ComboboxMultipleProps<Item>);

type ChangeDetails = BaseCombobox.Root.ChangeEventDetails;

/** Changes of the typed text that people make, rather than the field filling in a chosen label. */
const typedChanges = new Set(['input-change', 'input-clear', 'clear-press', 'escape-key']);

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
    loadingLabel,
    emptyLabel,
    variant = 'outline',
    size,
    showLabel,
    clearable = false,
    clearLabel,
    removeLabel,
    open,
    defaultOpen,
    onOpenChange,
    locale: ownLocale,
    label,
    description,
    error,
    name,
    form,
    required,
    disabled = false,
    readOnly = false,
    placeholder,
    id: suppliedId,
    className,
    style,
    'aria-describedby': describedBy,
    'aria-invalid': invalid,
    multiple,
    value,
    defaultValue,
    onValueChange,
    ...inputProps
  } = props;
  const isMultiple = multiple === true;
  const messages = useMessages('combobox', comboboxMessages);
  const common = useMessages('common', commonMessages);
  const providedLocale = useLocale();
  const locale = ownLocale ?? providedLocale;
  const clearName = clearLabel ?? common.clear;
  const removeName = removeLabel ?? ((text: string) => messages.remove({ label: text }));
  const metadata = useFieldMetadata(suppliedId, description, error, describedBy, invalid);
  const { id } = metadata;
  const labelId = `${id}-label`;
  const selectionId = `${id}-selection`;
  const inputRef = useRef<HTMLInputElement>(null);
  const nativeRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const pressFocus = useRef(false);
  // The query onInputValueChange reported last.
  const reportedQuery = useRef('');

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
  const hasStart = flatItems.some((item) => item.start != null);
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

  // The typed text, to show the chosen option's start content only while the field shows its label.
  const singleItem = isMultiple || selection == null ? undefined : known.get(selection as string);
  const [inputText, setInputText] = useState(() => singleItem?.label ?? '');
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
  const popupOpen = open ?? uncontrolledOpen;
  const portal = usePortalContainer();
  // Base UI hides the rest of the page while the list is open; a contained one leaves it in reach.
  useKeepPageVisible(
    portal,
    popupOpen,
    useCallback(() => [popupRef.current, inputRef.current], []),
  );
  // The chips' arrow keys and the popup follow the text direction, read as the popup opens or
  // closes and as the field takes focus.
  const [direction, readDirection] = useDirection(inputRef, popupOpen);

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

  const hasChips = isMultiple && selectedValues.length > 0;
  const labelShown = label != null && isLabelShown({ showLabel });
  // A floating label needs a blank placeholder to detect the empty state; chips fill the field.
  const fieldPlaceholder = hasChips ? undefined : labelShown ? placeholder || ' ' : placeholder;
  const describedByIds =
    [hasChips && selectionId, metadata['aria-describedby']].filter(Boolean).join(' ') || undefined;
  const showClear = clearable && !disabled && !readOnly;
  // The clear button shows while there is a value to clear; the well keeps room for it only then.
  const clearShown = showClear && selectedValues.length > 0;
  const showStart = singleItem?.start != null && inputText === singleItem.label && !isMultiple;
  const ariaLabel = inputProps['aria-label'];
  const toolbarName =
    label != null ? { 'aria-labelledby': labelId } : ariaLabel ? { 'aria-label': ariaLabel } : {};

  function renderControlBox(boxProps: FieldControlBoxProps) {
    const props = {
      ...boxProps,
      className: `${boxProps.className} env-combobox-control`,
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
        onOpenChange={(next, details) => {
          if (keepsOpen(portal, next, details)) details.cancel();
          else changeOpen(next);
        }}
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
              <label htmlFor={id} id={labelId} className="env-combobox-label">
                {label}
              </label>
            ) : null
          }
          description={description}
          error={error}
          floatingLabel
          variant={variant}
          size={size}
          showLabel={showLabel}
          className={className ? `env-combobox ${className}` : 'env-combobox'}
          style={style}
          renderControlBox={renderControlBox}
        >
          {showStart && (
            <span className="env-combobox-start env-combobox-value-icon" aria-hidden="true">
              {singleItem.start}
            </span>
          )}
          {isMultiple &&
            selectedValues.map((selected) => {
              const item = known.get(selected);
              const text = labelOf(selected);
              return (
                <BaseCombobox.Chip
                  key={selected}
                  className="env-combobox-chip"
                  // A chip is no widget, so the field's read-only state is the input's alone.
                  render={({ 'aria-readonly': _readOnly, ...chipProps }) => <div {...chipProps} />}
                >
                  {item?.start != null && (
                    <span className="env-combobox-start" aria-hidden="true">
                      {item.start}
                    </span>
                  )}
                  <span className="env-combobox-chip-label">{text}</span>
                  {!disabled && !readOnly && (
                    <BaseCombobox.ChipRemove
                      className="env-combobox-chip-remove"
                      render={
                        <IconButton
                          variant="ghost"
                          icon={<Close />}
                          aria-label={removeName(text)}
                        />
                      }
                    />
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
              readDirection();
              if (selectsLabel(event.currentTarget)) event.currentTarget.select();
            }}
            onMouseUp={(event) => {
              inputProps.onMouseUp?.(event);
              if (pressFocus.current && selectsLabel(event.currentTarget)) event.preventDefault();
              pressFocus.current = false;
            }}
            aria-invalid={metadata['aria-invalid']}
            aria-describedby={describedByIds}
            placeholder={fieldPlaceholder}
            className="env-text-field-input env-combobox-input"
          />
          {/* The well reserves room for its actions, which stay at its end. */}
          <span className="env-text-field-end env-combobox-end">
            {showClear && (
              <BaseCombobox.Clear
                className="env-combobox-clear"
                render={
                  <IconButton
                    variant="ghost"
                    icon={<Close />}
                    aria-label={clearName}
                    title={clearName}
                  />
                }
              />
            )}
            <BaseCombobox.Trigger
              className="env-combobox-trigger"
              // The field's label names the trigger; without one, the field's aria-label does.
              {...(label != null ? { 'aria-labelledby': labelId } : {})}
              // Base UI's Field gives it the field's description and error, which the input
              // already announces; the chevron leaves them out.
              render={({
                'aria-describedby': _describedBy,
                'aria-invalid': _invalid,
                ...triggerProps
              }) => (
                <IconButton
                  {...triggerProps}
                  variant="ghost"
                  icon={<ChevronRight />}
                  {...({ 'aria-label': label != null ? undefined : ariaLabel } as {
                    'aria-label': string;
                  })}
                />
              )}
            />
          </span>
        </FieldFrame>
        {hasChips && (
          // Read with the field, so the chosen options are known before the hint.
          <span id={selectionId} hidden>
            {selectedValues.map(labelOf).join(', ')}
          </span>
        )}
        <ComboboxPopup
          popupRef={popupRef}
          direction={direction}
          loading={loading}
          loadingLabel={loadingLabel ?? messages.loading}
          emptyLabel={emptyLabel ?? messages.empty}
          grouped={grouped}
          startSlot={hasStart}
        />
      </BaseCombobox.Root>
    </DirectionProvider>
  );
}
