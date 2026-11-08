'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import {
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { setRef } from '../internal/setRef.js';
import { useDirection } from '../internal/useDirection.js';
import { useLocale, useMessages } from '../internal/EnvUIContext.js';
import { type ControlSize } from '../foundations/Theme.js';
import { IconButton } from '../actions/Button.js';
import { IconChevronRight } from '../icons/ChevronRight.js';
import { IconClose } from '../icons/Close.js';
import { combobox as comboboxMessages } from '../foundations/messages/combobox.js';
import {
  FieldFrame,
  isLabelShown,
  type FieldControlBoxProps,
  type FieldProps,
} from './internal/FieldFrame.js';
import { ComboboxPopup } from './internal/ComboboxPopup.js';
import { autoHighlightAlways } from './internal/autoHighlightAlways.js';
import {
  type ComboboxFilter,
  type ComboboxGroup,
  type ComboboxItem,
} from './internal/comboboxItems.js';
import { useComboboxOpen } from './internal/useComboboxOpen.js';
import { useComboboxOptions } from './internal/useComboboxOptions.js';
import { useFieldMetadata } from './internal/useFieldMetadata.js';
import { useFormReset } from './internal/useFormReset.js';
import type { OverlayOpenChangeReason } from '../internal/overlayOpenChangeReason.js';
import '../styles/Base.css';
import '../styles/Combobox.css';

export type { ComboboxFilter, ComboboxGroup, ComboboxItem };

/** What a combobox's onOpenChange receives beside the requested state. */
export interface ComboboxOpenChangeDetails {
  /** Why it asks to open or close, such as trigger-press, input-change, item-press or escape-key. */
  reason: Extract<
    OverlayOpenChangeReason,
    | 'trigger-press'
    | 'input-press'
    | 'input-change'
    | 'input-clear'
    | 'outside-press'
    | 'escape-key'
    | 'close-press'
    | 'focus-out'
    | 'item-press'
    | 'list-navigation'
    | 'clear-press'
    | 'chip-remove-press'
    | 'cancel-open'
    | 'imperative-action'
    | 'none'
  >;
}

interface ComboboxSharedProps<Item extends ComboboxItem>
  extends
    Omit<
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
  /**
   * The options are loading: the popup shows loadingLabel instead of emptyLabel.
   * @default false
   */
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
   * The control height, sm, md or lg; without it, the container's, and else md. sm is for a
   * field with its label hidden.
   */
  size?: ControlSize;
  /**
   * Show the label inside the field, where it floats into the outline while the field has focus or
   * a value. Set false for a field whose purpose is clear without it; a placeholder then gives the
   * visible guidance.
   * @default true
   */
  showLabel?: boolean;
  /**
   * A clear button removes the value while there is one; Esc on the closed field clears it too.
   * @default false
   */
  clearable?: boolean;
  /**
   * Accessible name of the clear button.
   * @default 'Clear', or EnvUIProvider's messages.combobox.clear
   */
  clearLabel?: string;
  /**
   * Accessible name of a chip's remove button, from the chip's label.
   * @default Remove followed by the label, or EnvUIProvider's messages.combobox.remove
   */
  removeLabel?: (label: string) => string;
  /** Whether the list is open; with `onOpenChange` it controls the popup. */
  open?: boolean;
  /**
   * Whether an uncontrolled list starts open; closed by default.
   * @default false
   */
  defaultOpen?: boolean;
  /** Called as the popup opens and closes, and why, such as to load the options as it opens. */
  onOpenChange?: (open: boolean, details: ComboboxOpenChangeDetails) => void;
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
  /**
   * Receives the chosen values and their options. A value none of the options has had, such as one
   * given before a server search finds it, comes as a ComboboxItem of its own, with the value as
   * its label, as its chip shows it.
   */
  onValueChange?: (value: string[], items: (Item | ComboboxItem)[]) => void;
}

export type ComboboxProps<Item extends ComboboxItem = ComboboxItem> = ComboboxSharedProps<Item> &
  (ComboboxSingleProps<Item> | ComboboxMultipleProps<Item>);

/** The chosen value as Base UI takes it: a list of values, one value, or none. */
type Selection = readonly string[] | string | null;

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
  const providedLocale = useLocale();
  const locale = ownLocale ?? providedLocale;
  const clearName = clearLabel ?? messages.clear;
  const removeName = removeLabel ?? ((text: string) => messages.remove({ label: text }));
  const metadata = useFieldMetadata(suppliedId, description, error, describedBy, invalid);
  const { id } = metadata;
  const labelId = `${id}-label`;
  const selectionId = `${id}-selection`;
  const inputRef = useRef<HTMLInputElement>(null);
  const nativeRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const { popupOpen, changeOpen, handleOpenChange } = useComboboxOpen({
    open,
    defaultOpen,
    onOpenChange,
    popupRef,
    inputRef,
  });
  // The chips' arrow keys and the popup follow the text direction, read as the popup opens or
  // closes and as the field takes focus.
  const [direction, readDirection] = useDirection(inputRef, popupOpen);

  // The chosen value: the one it is given, or one the field keeps itself, which a native form reset
  // restores to the default; as Base UI takes it, a list of values for a field that takes several.
  const defaultSelection: Selection = isMultiple
    ? [...((defaultValue as readonly string[] | undefined) ?? [])]
    : ((defaultValue as string | null | undefined) ?? null);
  const [uncontrolledValue, setUncontrolledValue] = useState<Selection>(defaultSelection);
  const controlled = value !== undefined;
  const selection = controlled ? (isMultiple ? value : (value ?? null)) : uncontrolledValue;
  useFormReset(
    nativeRef,
    function applyReset() {
      if (!controlled) setUncontrolledValue(defaultSelection);
    },
    form,
  );
  const selectedValues = (
    Array.isArray(selection) ? selection : selection == null ? [] : [selection]
  ) as readonly string[];

  const {
    known,
    labelOf,
    collection,
    filter: baseFilter,
    hasStart,
    grouped,
  } = useComboboxOptions({ items, filter, locale, selectedValues });

  const singleItem = isMultiple || selection == null ? undefined : known.get(selection as string);
  // The text the input shows, which starts as the chosen option's label, and the query
  // onInputValueChange reported last.
  const [inputText, setInputText] = useState(singleItem?.label ?? '');
  const reportedQuery = useRef('');

  /** Keeps a value people chose, where the field keeps its own, and reports it with its options. */
  function choose(next: Selection) {
    if (!controlled) setUncontrolledValue(next);
    // Base UI's selection is a list of values for a field that takes several, else one or none.
    if (props.multiple) {
      const values = [...((next as readonly string[] | null) ?? [])];
      props.onValueChange?.(
        values,
        values.map((selected) => known.get(selected) ?? { value: selected, label: selected }),
      );
    } else {
      const single = (next as string | null) ?? null;
      props.onValueChange?.(single, single == null ? null : (known.get(single) ?? null));
    }
  }

  function handleValueChange(next: Selection, details: BaseCombobox.Root.ChangeEventDetails) {
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
      if (details.reason === 'input-clear' && !popupOpen) changeOpen(true, details.reason);
      return;
    }
    choose(next);
  }

  /**
   * Keeps the text, and reports the query as people type. Esc keeps the text of a field that isn't
   * clearable, and goes on, such as to close a dialog. Once a single field shows its chosen label
   * again, the query is over and an empty one is reported, so options found for it, such as on a
   * server, go with it.
   */
  function handleInputValueChange(next: string, details: BaseCombobox.Root.ChangeEventDetails) {
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
        autoHighlight={autoHighlightAlways}
        open={popupOpen}
        onOpenChange={handleOpenChange}
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
          size={size}
          showLabel={showLabel}
          className={className ? `env-combobox ${className}` : 'env-combobox'}
          style={style}
          renderControlBox={controlBox({
            multiple: isMultiple,
            clearShown,
            toolbarName: hasChips ? toolbarName : undefined,
          })}
        >
          {showStart && (
            <span className="env-combobox-start env-combobox-value-icon" aria-hidden="true">
              {singleItem.start}
            </span>
          )}
          {isMultiple && (
            <ComboboxChips
              values={selectedValues}
              known={known}
              labelOf={labelOf}
              removeName={removeName}
              editable={!disabled && !readOnly}
            />
          )}
          <ComboboxInput
            {...inputProps}
            ref={ref}
            inputRef={inputRef}
            chosenLabel={isMultiple || readOnly ? undefined : singleItem?.label}
            id={id}
            onFocus={(event) => {
              inputProps.onFocus?.(event);
              readDirection();
            }}
            aria-invalid={metadata['aria-invalid']}
            aria-describedby={describedByIds}
            placeholder={fieldPlaceholder}
          />
          {/* The well reserves room for its actions, which stay at its end. */}
          <span className="env-text-field-end env-combobox-end">
            <ComboboxActions
              clearName={clearName}
              showClear={showClear}
              // The field's label names the trigger; without one, the field's aria-label does.
              labelId={label != null ? labelId : undefined}
              ariaLabel={ariaLabel}
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

/**
 * A Combobox's text input. Focusing it while it shows the chosen option's label selects the label,
 * so typing replaces it with a query; a press keeps that selection rather than placing the caret.
 */
function ComboboxInput({
  ref,
  inputRef,
  chosenLabel,
  ...inputProps
}: ComponentPropsWithoutRef<typeof BaseCombobox.Input> & {
  /** The application's ref to the input. */
  ref: Ref<HTMLInputElement> | undefined;
  /** The field's own ref to the input. */
  inputRef: RefObject<HTMLInputElement | null>;
  /** The label that focus selects: a single, editable field's chosen option's, else undefined. */
  chosenLabel: string | undefined;
}) {
  // Whether the press now under way focused the input, rather than finding it focused.
  const pressFocus = useRef(false);
  const showsLabel = (input: HTMLInputElement) =>
    chosenLabel !== undefined && input.value === chosenLabel;

  return (
    <BaseCombobox.Input
      {...inputProps}
      ref={(node: HTMLInputElement | null) => {
        inputRef.current = node;
        setRef(ref, node);
      }}
      onPointerDown={(event) => {
        inputProps.onPointerDown?.(event);
        pressFocus.current =
          event.currentTarget.ownerDocument.activeElement !== event.currentTarget;
      }}
      onFocus={(event) => {
        inputProps.onFocus?.(event);
        if (showsLabel(event.currentTarget)) event.currentTarget.select();
      }}
      onMouseUp={(event) => {
        inputProps.onMouseUp?.(event);
        if (pressFocus.current && showsLabel(event.currentTarget)) event.preventDefault();
        pressFocus.current = false;
      }}
      className="env-text-field-input env-combobox-input"
    />
  );
}

/**
 * The field's well as Base UI's input group, with room for its actions. For several options it is
 * the chips' well, which the text input shares, so Backspace and the arrow keys reach the chips; a
 * toolbar, named as the field is, while it holds chips.
 */
function controlBox({
  multiple,
  clearShown,
  toolbarName,
}: {
  multiple: boolean;
  /** The clear button shows beside the trigger. */
  clearShown: boolean;
  /** The toolbar's name while the well holds chips, else undefined. */
  toolbarName: { 'aria-labelledby'?: string; 'aria-label'?: string } | undefined;
}) {
  return function renderControlBox(boxProps: FieldControlBoxProps) {
    const props = {
      ...boxProps,
      className: `${boxProps.className} env-combobox-control`,
      'data-action-count': clearShown ? '2' : '1',
    };
    if (!multiple) return <BaseCombobox.InputGroup {...props} />;
    return (
      <BaseCombobox.InputGroup
        {...props}
        {...(toolbarName ? { role: 'toolbar', ...toolbarName } : {})}
        render={<BaseCombobox.Chips />}
      />
    );
  };
}

/** The chosen options of a combobox that takes several, as chips in its field. */
function ComboboxChips({
  values,
  known,
  labelOf,
  removeName,
  editable,
}: {
  values: readonly string[];
  known: ReadonlyMap<string, ComboboxItem>;
  labelOf: (value: string) => string;
  removeName: (label: string) => string;
  /** Whether each chip has a remove button. */
  editable: boolean;
}) {
  return values.map((selected) => {
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
        {editable && (
          <BaseCombobox.ChipRemove
            className="env-combobox-chip-remove"
            render={
              <IconButton variant="ghost" icon={<IconClose />} aria-label={removeName(text)} />
            }
          />
        )}
      </BaseCombobox.Chip>
    );
  });
}

/** The actions at the end of a combobox's well: the clear button and the trigger that opens the list. */
function ComboboxActions({
  clearName,
  showClear,
  labelId,
  ariaLabel,
}: {
  clearName: string;
  showClear: boolean;
  /** The id of the field's label, which names the trigger; undefined for a field without one. */
  labelId: string | undefined;
  /** The field's aria-label, which names the trigger where the field has no label. */
  ariaLabel: string | undefined;
}) {
  return (
    <>
      {showClear && (
        <BaseCombobox.Clear
          className="env-combobox-clear"
          render={
            <IconButton
              variant="ghost"
              icon={<IconClose />}
              aria-label={clearName}
              title={clearName}
            />
          }
        />
      )}
      <BaseCombobox.Trigger
        className="env-combobox-trigger"
        {...(labelId !== undefined ? { 'aria-labelledby': labelId } : {})}
        // Base UI's Field gives it the field's description and error, which the input already
        // announces; the chevron leaves them out.
        render={({
          'aria-describedby': _describedBy,
          'aria-invalid': _invalid,
          ...triggerProps
        }) => (
          <IconButton
            {...triggerProps}
            variant="ghost"
            icon={<IconChevronRight />}
            // IconButton requires a name; aria-labelledby gives it one where the label is undefined.
            {...({ 'aria-label': labelId !== undefined ? undefined : ariaLabel } as {
              'aria-label': string;
            })}
          />
        )}
      />
    </>
  );
}
