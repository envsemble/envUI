'use client';

import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Slider as BaseSlider } from '@base-ui/react/slider';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type ComponentPropsWithRef,
  type ReactNode,
  type Ref,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { Row } from '../layout/Layout.js';
import { Text } from '../foundations/Text.js';
import { setRef } from '../internal/react/setRef.js';
import { useControllableState } from '../internal/react/useControllableState.js';
import { useLocale } from '../internal/provider/EnvUIContext.js';
import { useDirectionScope } from '../internal/provider/useDirection.js';
import { FieldFrame } from '../internal/field/FieldFrame.js';
import { fieldMessageIds } from '../internal/field/useFieldMetadata.js';
import { useFormReset } from '../internal/field/useFormReset.js';
import { useRowControlNaming } from '../internal/field/RowControl.js';
import { followDrag, followOverdrag } from './internal/sliderDrag.js';
import { useSliderReveal } from './internal/useSliderReveal.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
import '../styles/Slider.css';

export interface SliderProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'defaultValue' | 'onChange' | 'children' | 'ref'
> {
  /**
   * The value's name, inside the slider at its start, such as Opacity: text, or any content, such
   * as a volume icon beside the text. It names the slider, and ends in an ellipsis where the slider
   * is too narrow for it. Without it, a List.Item whose control it is names the slider, or name it
   * with aria-label or aria-labelledby.
   */
  label?: ReactNode;
  /**
   * Lasting guidance under the slider, such as what the value applies to, linked to the slider as
   * its description.
   */
  description?: ReactNode;
  /**
   * A message under the slider that says how to correct the value; it joins the slider's
   * description, after the description.
   */
  error?: ReactNode;
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
  /**
   * What the slider's end shows for the value in place of formatValue's text, such as the number
   * with its unit styled apart, or a swatch; formatValue, or the number in the locale, stays what
   * assistive technology announces.
   */
  renderValue?: (value: number) => ReactNode;
  /** The locale of the shown number: EnvUIProvider's, else the browser's. */
  locale?: string;
  /** Dim the slider; it can't be focused or moved, and forms leave it out. */
  disabled?: boolean;
  /** Submits the value with a form under this name. */
  name?: string;
  /** The id of a form the slider belongs to when it sits outside of it. */
  form?: string;
  /**
   * The native range input, which holds the value and takes focus, as a field's ref reaches its
   * input: for example to focus it, or for a form library to register it. className, style and
   * the other native props go to the root.
   */
  ref?: Ref<HTMLInputElement>;
}

/**
 * A value in a range, as a field: as tall as the fields and with their corners, so it sits in a form
 * among them, with its label inside at the start, its value at the end and a fill from the start
 * that shows it. Pressing or dragging anywhere in it chooses a value, and so do the arrow keys. At
 * rest it shows only its text and fill; a thin handle at the value and faint ticks at its steps
 * appear under the pointer and while it is pressed, and go once it is released, and the handle
 * alone shows with keyboard focus. An optional description sits below it.
 */
export function Slider({
  label,
  description,
  error,
  value,
  defaultValue,
  onValueChange,
  onValueCommitted,
  min = 0,
  max = 100,
  step = 1,
  largeStep = Math.max(step, Math.round((max - min) / 10 / step) * step),
  formatValue,
  renderValue,
  locale,
  disabled = false,
  name,
  form,
  className,
  ref,
  onFocus,
  'aria-describedby': describedBy,
  style,
  ...ownProps
}: SliderProps) {
  const {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...propsWithoutName
  } = ownProps;
  const props = label != null ? ownProps : propsWithoutName;
  const naming = useRowControlNaming({ label, ...ownProps, 'aria-describedby': describedBy });
  const thumbName =
    label != null
      ? {}
      : { 'aria-label': ariaLabel, 'aria-labelledby': naming['aria-labelledby'] ?? ariaLabelledBy };
  const directionScope = useDirectionScope<HTMLDivElement>();
  const id = useId();
  const providedLocale = useLocale();
  const input = useRef<HTMLInputElement>(null);
  const control = useRef<HTMLDivElement>(null);
  const [current, change, keepOwn] = useControllableState({
    value,
    defaultValue: defaultValue ?? min,
    onChange: onValueChange,
  });
  const { reveal, pressed, handlers } = useSliderReveal(control, disabled);
  useFormReset(
    input,
    function applyReset() {
      const reset = keepOwn(defaultValue ?? min);
      if (input.current) input.current.value = String(reset);
    },
    form,
  );
  useLayoutEffect(
    function veilAtCurrentValue() {
      if (control.current) veilIndicatorUnderText(control.current);
    },
    [current],
  );
  useEffect(function veilOnResize() {
    const element = control.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => veilIndicatorUnderText(element));
    observer.observe(element);
    for (const text of element.querySelectorAll('.env-slider-label, .env-slider-value'))
      observer.observe(text);
    const veilWhereHandleComesToRest = (event: TransitionEvent) => {
      if (
        event.propertyName !== 'opacity' &&
        (event.target as Element).matches('.env-slider-thumb')
      )
        veilIndicatorUnderText(element);
    };
    element.addEventListener('transitionend', veilWhereHandleComesToRest);
    return () => {
      observer.disconnect();
      element.removeEventListener('transitionend', veilWhereHandleComesToRest);
    };
  }, []);
  useEffect(
    function stretchPastTheEnds() {
      const element = control.current;
      if (!element || disabled) return;
      return followOverdrag(element);
    },
    [disabled],
  );
  useEffect(function followDragging() {
    const element = control.current;
    if (!element) return;
    return followDrag(element, element.closest<HTMLElement>('.env-slider') ?? element);
  }, []);
  const ticks = tickCount(min, max, step, largeStep);
  const describedByIds =
    [
      naming['aria-describedby'] ?? describedBy,
      description != null ? fieldMessageIds(id).description : undefined,
      error != null ? fieldMessageIds(id).error : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;
  const inactiveGroupExemptFromContrast = disabled || undefined;
  return (
    <DirectionProvider direction={directionScope.direction}>
      <BaseSlider.Root
        aria-disabled={inactiveGroupExemptFromContrast}
        {...props}
        ref={directionScope.ref}
        onFocus={(event) => {
          directionScope.onFocus();
          onFocus?.(event);
        }}
        className={classNames('env-slider', className)}
        style={{
          '--_slider-ticks': ticks,
          '--_slider-fraction': fractionOf(current, min, max),
          ...style,
        }}
        data-ticks={flag(ticks > 1)}
        value={current}
        onValueChange={(next) => change(next)}
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
        <FieldFrame id={id} description={description} error={error}>
          <BaseSlider.Control
            ref={control}
            className="env-slider-control"
            data-dragging={flag(pressed && !disabled)}
            data-handle={flag(reveal.handle)}
            data-ruler={flag(reveal.ruler)}
            {...handlers}
          >
            <BaseSlider.Track className="env-slider-track">
              <BaseSlider.Indicator className="env-slider-indicator" />
              <BaseSlider.Thumb
                className="env-slider-thumb"
                inputRef={(node: HTMLInputElement | null) => {
                  input.current = node;
                  setRef(ref, node);
                }}
                {...thumbName}
                aria-describedby={describedByIds}
                getAriaValueText={(formatted, number) =>
                  formatValue ? formatValue(number) : formatted
                }
              />
            </BaseSlider.Track>
            <Row align="center" justify="between" gap={3} className="env-slider-header">
              <BaseSlider.Label className="env-slider-label" render={<Text render={<div />} />}>
                {label}
              </BaseSlider.Label>
              <BaseSlider.Value className="env-slider-value" render={<Text render={<output />} />}>
                {(formatted, values) =>
                  renderValue
                    ? renderValue(values[0])
                    : formatValue
                      ? formatValue(values[0])
                      : formatted[0]
                }
              </BaseSlider.Value>
            </Row>
          </BaseSlider.Control>
        </FieldFrame>
      </BaseSlider.Root>
    </DirectionProvider>
  );
}

function veilIndicatorUnderText(control: HTMLElement) {
  const thumb = control.querySelector('.env-slider-thumb');
  const track = control.querySelector('.env-slider-track');
  if (!thumb || !track) return;
  const handle = thumb.getBoundingClientRect();
  const span = track.getBoundingClientRect();
  const at = handle.left + handle.width / 2;
  let veiled = false;
  let clearStart = 0;
  let clearEnd = span.width;
  for (const text of control.querySelectorAll<HTMLElement>(
    '.env-slider-label, .env-slider-value',
  )) {
    const box = text.getBoundingClientRect();
    if (box.width === 0) continue;
    const halfLine = Number.parseFloat(getComputedStyle(text).fontSize) / 2 || 0;
    if (at >= box.left - halfLine && at <= box.right + halfLine) veiled = true;
    const textInLeftHalf = box.left + box.width / 2 < span.left + span.width / 2;
    if (textInLeftHalf) clearStart = Math.max(clearStart, box.right + halfLine - span.left);
    else clearEnd = Math.min(clearEnd, box.left - halfLine - span.left);
  }
  control.style.setProperty('--_slider-veil', veiled ? '1' : '0');
  control.style.setProperty('--_slider-clear-start', `${clearStart}px`);
  control.style.setProperty('--_slider-clear-end', `${clearEnd}px`);
}

function fractionOf(value: number, min: number, max: number): number {
  const emptyRange = !(max > min);
  if (emptyRange) return 0;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

const mostTickPartsBeforeCrowding = 20;

function tickCount(min: number, max: number, step: number, largeStep: number): number {
  const range = max - min;
  if (!(range > 0)) return 0;
  for (const size of [step, largeStep]) {
    const parts = range / size;
    const cutsEvenly = Math.abs(parts - Math.round(parts)) < 1e-9;
    if (size > 0 && cutsEvenly && parts <= mostTickPartsBeforeCrowding) return Math.round(parts);
  }
  return 0;
}
