'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type Ref } from 'react';
import { Stack } from '../foundations/Layout.js';
import { Text } from '../foundations/Text.js';
import { colorPicker as colorPickerMessages } from '../foundations/messages/colorPicker.js';
import { classNames } from '../internal/classNames.js';
import { setRef } from '../internal/setRef.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { useFormatters } from '../internal/useFormatters.js';
import { TextField, type TextFieldProps } from './TextField.js';
import { ColorPlane, hexToHsv, hsvToHex, type Hsv } from './internal/ColorPlane.js';
import { subscribeFormReset } from './internal/subscribeFormReset.js';

export interface ColorPickerProps
  extends Omit<
    TextFieldProps,
    | 'label'
    | 'type'
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'onValueChange'
    | 'children'
    | 'placeholder'
    | 'maxLength'
    | 'pattern'
    | 'ref'
  > {
  /** The HEX field, so that a form library can register it and focus it. */
  ref?: Ref<HTMLInputElement>;
  /** The picker's class, on its root element. */
  className?: string;
  /** Styles of the picker's root element. */
  style?: CSSProperties;
  /** The color's name above the picker; it names the group and, with "HEX", the field. */
  label: string;
  /** An opaque six-digit HEX color, with an optional # prefix. */
  value?: string;
  /** The color an uncontrolled picker starts at, and that a form reset restores; #000000 by default. */
  defaultValue?: string;
  /** Receives valid colors normalized to lowercase #rrggbb. */
  onValueChange?: (value: string) => void;
}

function normalizeHex(value: string) {
  return /^#?[0-9a-f]{6}$/i.test(value) ? `#${value.replace(/^#/, '').toLowerCase()}` : null;
}

/**
 * A labelled color area, hue slider and native HEX field; the application owns the result. The
 * area and the hue are sliders for the keyboard and assistive technology, named in the
 * EnvUIProvider's language.
 */
export function ColorPicker({
  ref,
  label,
  value,
  defaultValue = '#000000',
  onValueChange,
  disabled = false,
  readOnly = false,
  description,
  error,
  id: suppliedId,
  className,
  style,
  onBlur,
  form,
  ...inputProps
}: ColorPickerProps) {
  const messages = useMessages('colorPicker', colorPickerMessages);
  const format = useFormatters();
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const initialColor = normalizeHex(defaultValue) ?? '#000000';
  const [uncontrolledColor, setUncontrolledColor] = useState(initialColor);
  const color = normalizeHex(value ?? uncontrolledColor) ?? '#000000';
  // The area and the hue keep their own hue and saturation where the color alone loses them, as on
  // a gray; they follow the color whenever it is another.
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(color));
  const [draft, setDraft] = useState(color);
  const [status, setStatus] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const valid = normalizeHex(draft) !== null;

  useEffect(() => {
    setDraft(color);
    setStatus('');
  }, [color]);

  // A color the application rejects or replaces takes the area and the hue back with it.
  useEffect(() => {
    if (hsvToHex(hsv) === color) return;
    const next = hexToHsv(color);
    if (next.h !== hsv.h || next.s !== hsv.s || next.v !== hsv.v) setHsv(next);
  }, [color, hsv]);

  useEffect(() => {
    inputRef.current?.setCustomValidity(valid ? '' : messages.invalid);
  }, [valid, messages.invalid]);

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

  function commit(next: string) {
    if (disabled || readOnly) return;
    const normalized = normalizeHex(next);
    if (!normalized) return;
    if (value === undefined) setUncontrolledColor(normalized);
    setDraft(value === undefined ? normalized : color);
    setStatus('');
    if (normalized !== color) onValueChange?.(normalized);
  }

  const percent = format.number({ style: 'percent', maximumFractionDigits: 0 });
  const inactive = disabled || readOnly;

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
      <Text render={<span />} variant="body-sm" id={`${id}-label`}>
        {label}
      </Text>
      <div
        className="env-color-picker-area"
        inert={inactive || undefined}
        aria-hidden={inactive || undefined}
      >
        <ColorPlane
          hsv={hsv}
          locale={format.locale}
          onChange={(next) => {
            if (inactive) return;
            setHsv(next);
            commit(hsvToHex(next));
          }}
          areaLabel={messages.area}
          areaValueText={({ s, v }) =>
            messages.areaValue({
              saturation: percent.format(s / 100),
              brightness: percent.format(v / 100),
            })
          }
          hueLabel={messages.hue}
        />
      </div>
      <TextField
        {...inputProps}
        ref={(input) => {
          inputRef.current = input;
          setRef(ref, input);
        }}
        id={id}
        label={messages.hex}
        aria-label={inputProps['aria-label'] ?? messages.hexLabel({ label })}
        value={draft}
        description={valid ? (description ?? messages.description) : undefined}
        error={error ?? (!valid ? messages.invalid : undefined)}
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
          else setStatus(messages.invalid);
        }}
        onBlur={(event) => {
          if (!valid) {
            setDraft(color);
            setStatus(messages.restored);
          }
          onBlur?.(event);
        }}
      />
      <span className="env-color-picker-status" role="status">
        {status}
      </span>
    </Stack>
  );
}
