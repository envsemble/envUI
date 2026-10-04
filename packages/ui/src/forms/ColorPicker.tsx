import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Stack } from '../foundations/Layout.js';
import { Text } from '../foundations/Text.js';
import { classNames } from '../internal/classNames.js';
import { setRef } from '../internal/setRef.js';
import { Input, type InputProps } from './Input.js';
import { subscribeFormReset } from './internal/subscribeFormReset.js';

export interface ColorPickerProps
  extends Omit<
    InputProps,
    | 'label'
    | 'type'
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'children'
    | 'placeholder'
    | 'maxLength'
    | 'pattern'
  > {
  label: string;
  /** An opaque six-digit HEX color, with an optional # prefix. */
  value?: string;
  defaultValue?: string;
  /** Receives valid colors normalized to lowercase #rrggbb. */
  onValueChange?: (value: string) => void;
}

function normalizeHex(value: string) {
  return /^#?[0-9a-f]{6}$/i.test(value) ? `#${value.replace(/^#/, '').toLowerCase()}` : null;
}

const invalidHexMessage = 'Use six hexadecimal digits (0–9, A–F).';

/** A labeled color area, hue slider and native HEX field; the application owns the result. */
export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(function ColorPicker(
  {
    label,
    value,
    defaultValue = '#000000',
    onValueChange,
    disabled = false,
    readOnly = false,
    hint = 'Enter six hexadecimal digits, with an optional #.',
    error,
    id: suppliedId,
    className,
    style,
    onBlur,
    form,
    ...inputProps
  },
  ref,
) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const initialColor = normalizeHex(defaultValue) ?? '#000000';
  const [uncontrolledColor, setUncontrolledColor] = useState(initialColor);
  const color = normalizeHex(value ?? uncontrolledColor) ?? '#000000';
  const [pickerColor, setPickerColor] = useState(color);
  const [draft, setDraft] = useState(color);
  const [status, setStatus] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const valid = normalizeHex(draft) !== null;

  useEffect(() => {
    setDraft(color);
    setStatus('');
  }, [color]);

  // Give the interaction control a real prop transition when a consumer rejects a candidate.
  // Accepted updates keep the same slider instance, focus and active pointer gesture.
  useEffect(() => {
    if (pickerColor !== color) setPickerColor(color);
  }, [color, pickerColor]);

  useEffect(() => {
    inputRef.current?.setCustomValidity(valid ? '' : invalidHexMessage);
  }, [valid]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input?.form) return;
    return subscribeFormReset(input.form, () => {
      const resetColor = value === undefined ? initialColor : color;
      if (value === undefined) setUncontrolledColor(resetColor);
      setDraft(resetColor);
      setStatus('');
      input.value = resetColor;
      input.setCustomValidity('');
    });
  }, [value, color, initialColor, form]);

  function commit(next: string, fromPicker = false) {
    if (disabled || readOnly) return;
    const normalized = normalizeHex(next);
    if (!normalized) return;
    if (fromPicker) setPickerColor(normalized);
    if (value === undefined) setUncontrolledColor(normalized);
    setDraft(value === undefined ? normalized : color);
    setStatus('');
    if (normalized !== color) onValueChange?.(normalized);
  }

  return (
    <Stack
      gap={3}
      role="group"
      aria-labelledby={`${id}-label`}
      aria-disabled={disabled || undefined}
      className={classNames('env-color-picker', className)}
      style={style}
      data-disabled={disabled || undefined}
    >
      <Text as="span" variant="supporting" id={`${id}-label`}>
        {label}
      </Text>
      <div
        className="env-color-picker-area"
        inert={disabled || readOnly || undefined}
        aria-hidden={disabled || readOnly || undefined}
      >
        <HexColorPicker
          key={disabled || readOnly ? 'inactive' : 'active'}
          color={pickerColor}
          onChange={(next) => commit(next, true)}
        />
      </div>
      <Input
        {...inputProps}
        ref={(input) => {
          inputRef.current = input;
          setRef(ref, input);
        }}
        id={id}
        label="HEX"
        aria-label={inputProps['aria-label'] ?? `${label} HEX`}
        value={draft}
        hint={valid ? hint : undefined}
        error={error ?? (!valid ? invalidHexMessage : undefined)}
        type="text"
        maxLength={7}
        pattern="#?[0-9a-fA-F]{6}"
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        readOnly={readOnly}
        form={form}
        onChange={(event) => {
          const next = event.currentTarget.value;
          setDraft(next);
          if (normalizeHex(next)) commit(next);
          else setStatus(invalidHexMessage);
        }}
        onBlur={(event) => {
          if (!valid) {
            setDraft(color);
            setStatus('Invalid color discarded. The previous color has been restored.');
          }
          onBlur?.(event);
        }}
      />
      <span className="env-color-picker-status" role="status">
        {status}
      </span>
    </Stack>
  );
});
