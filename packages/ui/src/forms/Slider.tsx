'use client';

import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Slider as BaseSlider } from '@base-ui/react/slider';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { Row } from '../foundations/Layout.js';
import { setRef } from '../internal/setRef.js';
import { useLocale } from '../internal/EnvUIContext.js';
import { useDirectionScope } from '../internal/useDirection.js';
import { FieldFrame } from './internal/FieldFrame.js';
import { fieldMessageIds } from './internal/useFieldMetadata.js';
import { subscribeFormReset } from './internal/subscribeFormReset.js';

export interface SliderProps
  extends Omit<ComponentPropsWithRef<'div'>, 'defaultValue' | 'onChange' | 'children'> {
  /**
   * The value's name, inside the slider at its start, such as Opacity. It names the slider.
   */
  label: ReactNode;
  /**
   * Lasting guidance under the slider, such as what the value applies to, linked to the slider as
   * its description.
   */
  description?: ReactNode;
  /** The value of a controlled slider; update it from onValueChange. */
  value?: number;
  /**
   * The value an uncontrolled slider starts with; a native form reset returns to it.
   * @default min
   */
  defaultValue?: number;
  /**
   * Receives the value while it changes, by dragging, pressing the track or with the keyboard, as
   * often as the thumb moves.
   */
  onValueChange?: (value: number) => void;
  /**
   * Receives the value once a change is complete: when the thumb is released or the track pressed,
   * and after each key. Use it for work that runs once per change, such as saving.
   */
  onValueCommitted?: (value: number) => void;
  /** The lowest value, at the start of the track. */
  min?: number;
  /** The highest value, at the end of the track. */
  max?: number;
  /**
   * The distance between the values the slider can take, counted from min; an arrow key moves by
   * it.
   */
  step?: number;
  /**
   * The change of Page Up, Page Down and an arrow key with Shift.
   * @default a tenth of the range in whole steps, at least one step
   */
  largeStep?: number;
  /**
   * The value as people read it at the slider's end and assistive technology announces it, such as
   * (value) => `${value}%`. Without it, the number shows in the locale.
   */
  formatValue?: (value: number) => string;
  /** The locale of the shown number: EnvUIProvider's, else the browser's. */
  locale?: string;
  /** Dim the slider; it can't be focused or moved, and forms leave it out. */
  disabled?: boolean;
  /** Submits the value with a form under this name. */
  name?: string;
  /** The id of a form the slider belongs to when it sits outside of it. */
  form?: string;
  /** The native range input, for example to focus it. */
  inputRef?: Ref<HTMLInputElement>;
}

/**
 * A value in a range, as a field: as tall as the fields and with their corners, so it sits in a form
 * among them, with its label inside at the start, its value at the end and a fill from the start
 * that shows it. Pressing or dragging anywhere in it chooses a value, and so do the arrow keys; a
 * thin handle and faint ticks at its steps appear under the pointer and while it has focus. An
 * optional description sits below it.
 */
export function Slider({
  label,
  description,
  value,
  defaultValue,
  onValueChange,
  onValueCommitted,
  min = 0,
  max = 100,
  step = 1,
  largeStep = Math.max(step, Math.round((max - min) / 10 / step) * step),
  formatValue,
  locale,
  disabled = false,
  name,
  form,
  inputRef,
  className,
  ref,
  onFocus,
  'aria-describedby': describedBy,
  style,
  ...props
}: SliderProps) {
  // The arrow keys follow the text direction: Base UI reads it from its DirectionProvider.
  const scope = useDirectionScope(ref);
  const id = useId();
  const providedLocale = useLocale();
  const input = useRef<HTMLInputElement>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? min);
  const current = value ?? uncontrolledValue;
  useEffect(
    function subscribeToFormReset() {
      const element = input.current;
      const owner = element?.form;
      if (!element || !owner) return;
      return subscribeFormReset(owner, function applyReset() {
        const reset = value ?? defaultValue ?? min;
        if (value === undefined) setUncontrolledValue(reset);
        element.value = String(reset);
      });
    },
    [value, defaultValue, min, form],
  );
  // Faint ticks mark the steps, or, where they are many, the large steps, so they never crowd.
  const ticks = tickCount(min, max, step, largeStep);
  const describedByIds =
    [describedBy, description != null ? fieldMessageIds(id).description : undefined]
      .filter(Boolean)
      .join(' ') || undefined;
  return (
    <DirectionProvider direction={scope.direction}>
      <BaseSlider.Root
        // The group, which the label names, is disabled with its range input, so its label and value
        // read as part of an inactive control, which WCAG exempts from contrast, as they fade with it.
        aria-disabled={disabled || undefined}
        {...props}
        ref={scope.ref}
        onFocus={(event) => {
          scope.onFocus();
          onFocus?.(event);
        }}
        className={classNames('env-slider', className)}
        style={{ '--env-slider-ticks': ticks, ...style } as CSSProperties}
        data-ticks={ticks > 1 ? '' : undefined}
        value={current}
        onValueChange={(next) => {
          if (value === undefined) setUncontrolledValue(next);
          onValueChange?.(next);
        }}
        onValueCommitted={(next) => onValueCommitted?.(next)}
        locale={locale ?? providedLocale}
        min={min}
        max={max}
        step={step}
        largeStep={largeStep}
        disabled={disabled}
        name={name}
        form={form}
      >
        <FieldFrame id={id} description={description}>
          <BaseSlider.Control className="env-slider-control">
            <BaseSlider.Track className="env-slider-track">
              <BaseSlider.Indicator className="env-slider-indicator" />
              {/* The handle: a thin line at the value, which shows under the pointer and on focus. */}
              <BaseSlider.Thumb
                className="env-slider-thumb"
                inputRef={(node: HTMLInputElement | null) => {
                  input.current = node;
                  setRef(inputRef, node);
                }}
                aria-describedby={describedByIds}
                getAriaValueText={(formatted, number) =>
                  formatValue ? formatValue(number) : formatted
                }
              />
            </BaseSlider.Track>
            {/* The label and the value sit over the track, inside the slider. */}
            <Row align="center" justify="between" gap={3} className="env-slider-heading">
              <BaseSlider.Label className="env-slider-label">{label}</BaseSlider.Label>
              {/* The output names the range input it shows, and stays quiet while the value moves. */}
              <BaseSlider.Value className="env-slider-value">
                {(formatted, values) => (formatValue ? formatValue(values[0]!) : formatted[0])}
              </BaseSlider.Value>
            </Row>
          </BaseSlider.Control>
        </FieldFrame>
      </BaseSlider.Root>
    </DirectionProvider>
  );
}

/**
 * How many equal parts the ticks cut the range into: the steps where there are at most 20, else
 * the large steps where they cut it evenly into at most 20. Otherwise none, as ticks between the
 * values the slider takes would mislead; one part draws none either.
 */
function tickCount(min: number, max: number, step: number, largeStep: number): number {
  const range = max - min;
  if (!(range > 0)) return 0;
  for (const size of [step, largeStep]) {
    const parts = range / size;
    if (size > 0 && Math.abs(parts - Math.round(parts)) < 1e-9 && parts <= 20)
      return Math.round(parts);
  }
  return 0;
}
