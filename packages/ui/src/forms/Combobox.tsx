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
import { classNames } from '../internal/classNames.js';
import { setRef } from '../internal/react/setRef.js';
import { useDirection } from '../internal/provider/useDirection.js';
import { useLocale, useMessages } from '../internal/provider/EnvUIContext.js';
import { IconButton } from '../actions/Button.js';
import { IconChevronRight } from '../icons/ChevronRight.js';
import { IconClose } from '../icons/Close.js';
import { combobox as comboboxMessages } from '../foundations/messages/combobox.js';
import {
  FieldFrame,
  FieldLabelContent,
  type FieldControlBoxProps,
  type FieldProps,
  type FieldSizeProps,
  type TextFieldDecorationProps,
} from '../internal/field/FieldFrame.js';
import { ComboboxPopup } from './internal/ComboboxPopup.js';
import { autoHighlightAlways } from './internal/autoHighlightAlways.js';
import {
  type ComboboxFilter,
  type ComboboxGroup,
  type ComboboxItem,
  type ComboboxItemElementProps,
} from './internal/comboboxItems.js';
import { useComboboxOpen } from './internal/useComboboxOpen.js';
import { useComboboxOptions } from './internal/useComboboxOptions.js';
import { useComboboxSelection, type ComboboxSelection } from './internal/useComboboxSelection.js';
import { useFieldMetadata } from '../internal/field/useFieldMetadata.js';
import { useRowControlNaming } from '../internal/field/RowControl.js';
import type { OverlayOpenChangeReason } from '../internal/popup/overlayOpenChangeReason.js';
import '../styles/Base.css';
import '../styles/Combobox.css';

export type { ComboboxFilter, ComboboxGroup, ComboboxItem, ComboboxItemElementProps };

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
    FieldProps,
    FieldSizeProps,
    Pick<TextFieldDecorationProps, 'visibleLabel'> {
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

const noName = '';

const reasonsPeopleType = new Set(['input-change', 'input-clear', 'clear-press', 'escape-key']);

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
    visibleLabel,
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
  const naming = useRowControlNaming({ label, ...inputProps, 'aria-describedby': describedBy });
  const metadata = useFieldMetadata(
    suppliedId,
    description,
    error,
    naming['aria-describedby'] ?? describedBy,
    invalid,
  );
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
  const [direction, readDirection] = useDirection(inputRef, popupOpen);

  const { value: selection, selectedValues, choose } = useComboboxSelection(props, nativeRef);

  const {
    known,
    labelOf,
    collection,
    filter: baseFilter,
    hasStart,
  } = useComboboxOptions({ items, filter, locale, selectedValues });

  const singleItem = typeof selection === 'string' ? known.get(selection) : undefined;
  const [inputText, setInputText] = useState(singleItem?.label ?? '');
  const lastReportedQuery = useRef('');

  function handleValueChange(
    next: ComboboxSelection,
    details: BaseCombobox.Root.ChangeEventDetails,
  ) {
    if (details.isCanceled) return;
    const escape = details.reason === 'escape-key';
    const textEmptied = details.reason === 'input-clear';
    const clearing = escape || (!isMultiple && textEmptied);
    const nothingToClear = !clearable || selectedValues.length === 0;
    const escapeNeverRemovesChips = isMultiple && escape;
    if (clearing && (nothingToClear || escapeNeverRemovesChips)) {
      details.cancel();
      details.allowPropagation();
      const showEveryOptionToChooseAnother = textEmptied && !popupOpen;
      if (showEveryOptionToChooseAnother) changeOpen(true, details.reason);
      return;
    }
    choose(next, known);
  }

  function reportQuery(query: string) {
    lastReportedQuery.current = query;
    onInputValueChange?.(query);
  }

  function handleInputValueChange(next: string, details: BaseCombobox.Root.ChangeEventDetails) {
    if (details.isCanceled) return;
    const escapeKeepsText = details.reason === 'escape-key' && !clearable;
    if (escapeKeepsText) {
      details.cancel();
      details.allowPropagation();
      return;
    }
    setInputText(next);
    const typedByPerson = reasonsPeopleType.has(details.reason);
    const chosenLabelEndsQuery = !typedByPerson && !isMultiple && lastReportedQuery.current !== '';
    if (typedByPerson) reportQuery(next);
    else if (chosenLabelEndsQuery) reportQuery('');
  }

  const hasChips = isMultiple && selectedValues.length > 0;
  const fieldPlaceholder = hasChips ? undefined : placeholder;
  const describedByIds =
    [hasChips && selectionId, metadata['aria-describedby']].filter(Boolean).join(' ') || undefined;
  const showClear = clearable && !disabled && !readOnly;
  const clearShown = showClear && selectedValues.length > 0;
  const showStart = singleItem?.start != null && inputText === singleItem.label && !isMultiple;
  const ariaLabel = inputProps['aria-label'];
  const fieldLabelId = label != null ? labelId : naming['aria-labelledby'];
  const toolbarName =
    fieldLabelId != null
      ? { 'aria-labelledby': fieldLabelId }
      : ariaLabel
        ? { 'aria-label': ariaLabel }
        : {};

  return (
    <DirectionProvider direction={direction}>
      <BaseCombobox.Root<string, boolean, Item>
        items={collection}
        multiple={isMultiple}
        value={selection}
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
                <FieldLabelContent>{label}</FieldLabelContent>
              </label>
            ) : null
          }
          description={description}
          error={error}
          controlBox
          size={size}
          visibleLabel={visibleLabel}
          className={classNames('env-combobox', className)}
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
              removable={!disabled && !readOnly}
            />
          )}
          <ComboboxInput
            {...inputProps}
            {...naming}
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
          <span className="env-text-field-end env-combobox-end">
            <ComboboxActions
              clearName={clearName}
              showClear={showClear}
              fieldLabelId={fieldLabelId}
              fieldAriaLabel={ariaLabel}
            />
          </span>
        </FieldFrame>
        {hasChips && (
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
          startSlot={hasStart}
        />
      </BaseCombobox.Root>
    </DirectionProvider>
  );
}

function ComboboxInput({
  ref,
  inputRef,
  chosenLabel,
  ...inputProps
}: ComponentPropsWithoutRef<typeof BaseCombobox.Input> & {
  ref: Ref<HTMLInputElement> | undefined;
  inputRef: RefObject<HTMLInputElement | null>;
  chosenLabel: string | undefined;
}) {
  const pressIsFocusingInput = useRef(false);
  const showsChosenLabel = (input: HTMLInputElement) =>
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
        pressIsFocusingInput.current =
          event.currentTarget.ownerDocument.activeElement !== event.currentTarget;
      }}
      onFocus={(event) => {
        inputProps.onFocus?.(event);
        if (showsChosenLabel(event.currentTarget)) event.currentTarget.select();
      }}
      onMouseUp={(event) => {
        inputProps.onMouseUp?.(event);
        const keepLabelSelectedOverCaret =
          pressIsFocusingInput.current && showsChosenLabel(event.currentTarget);
        if (keepLabelSelectedOverCaret) event.preventDefault();
        pressIsFocusingInput.current = false;
      }}
      className="env-text-field-input env-combobox-input"
    />
  );
}

function controlBox({
  multiple,
  clearShown,
  toolbarName,
}: {
  multiple: boolean;
  clearShown: boolean;
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

function ComboboxChips({
  values,
  known,
  labelOf,
  removeName,
  removable,
}: {
  values: readonly string[];
  known: ReadonlyMap<string, ComboboxItem>;
  labelOf: (value: string) => string;
  removeName: (label: string) => string;
  removable: boolean;
}) {
  return values.map((selected) => {
    const item = known.get(selected);
    const text = labelOf(selected);
    return (
      <BaseCombobox.Chip
        key={selected}
        className="env-combobox-chip"
        render={({ 'aria-readonly': _readOnlyBelongsToInput, ...chipProps }) => (
          <div {...chipProps} />
        )}
      >
        {item?.start != null && (
          <span className="env-combobox-start" aria-hidden="true">
            {item.start}
          </span>
        )}
        <span className="env-combobox-chip-label">{text}</span>
        {removable && (
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

function ComboboxActions({
  clearName,
  showClear,
  fieldLabelId,
  fieldAriaLabel,
}: {
  clearName: string;
  showClear: boolean;
  fieldLabelId: string | undefined;
  fieldAriaLabel: string | undefined;
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
        {...(fieldLabelId !== undefined ? { 'aria-labelledby': fieldLabelId } : {})}
        render={({
          'aria-describedby': _describedByAnnouncedOnInput,
          'aria-invalid': _invalidAnnouncedOnInput,
          ...triggerProps
        }) => (
          <IconButton
            {...triggerProps}
            variant="ghost"
            icon={<IconChevronRight />}
            {...(fieldLabelId !== undefined
              ? { 'aria-labelledby': fieldLabelId }
              : { 'aria-label': fieldAriaLabel ?? noName })}
          />
        )}
      />
    </>
  );
}
