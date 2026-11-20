'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { useRef, type ComponentPropsWithoutRef, type Ref, type RefObject } from 'react';
import { mergeRefs } from '../../internal/react/setRef.js';
import { IconButton } from '../../actions/Button.js';
import { IconChevronRight } from '../../icons/ChevronRight.js';
import { IconClose } from '../../icons/Close.js';
import type { FieldControlBoxProps } from '../../internal/field/FieldFrame.js';
import type { ComboboxItem } from './comboboxItems.js';
import '../../styles/Base.css';
import '../../styles/ListRow.css';
import '../../styles/Combobox.css';

const noName = '';

export function ComboboxInput({
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
      ref={mergeRefs(inputRef, ref)}
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

export function controlBox({
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

export function ComboboxChips({
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

export function ComboboxActions({
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
