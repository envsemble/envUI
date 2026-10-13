import { Slider as BaseSlider } from '@base-ui/react/slider';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
  type Ref,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { setRef } from '../internal/setRef.js';
import { FieldFrame } from './internal/FieldFrame.js';
import { subscribeFormReset } from './internal/subscribeFormReset.js';

export interface SliderProps
  extends Omit<ComponentPropsWithRef<'div'>, 'defaultValue' | 'onChange' | 'children'> {
  /** Visible label and the slider's accessible name. */
  label: ReactNode;
  /** Guidance below the slider, linked to it. */
  hint?: ReactNode;
  value?: number;
  /** Starting value when the slider owns it; min by default. */
  defaultValue?: number;
  /** Receives the value while it changes, by dragging, pressing the track or with the keyboard. */
  onValueChange?: (value: number) => void;
  /** Receives the value once a change is complete, such as when the thumb is released. */
  onValueCommit?: (value: number) => void;
  /** 0 by default. */
  min?: number;
  /** 100 by default. */
  max?: number;
  /** The values between min and max that the slider can take; 1 by default. */
  step?: number;
  /** The change of Page Up, Page Down and arrow keys with Shift; a tenth of the range by default. */
  largeStep?: number;
  /** The value as people read and hear it, such as (value) => `${value}%`. */
  formatValue?: (value: number) => string;
  disabled?: boolean;
  /** Submits the value with a form under this name. */
  name?: string;
  /** The id of a form the slider belongs to when it is outside of it. */
  form?: string;
  /** The native range input, for example to focus it. */
  inputRef?: Ref<HTMLInputElement>;
}

/** A value in a range, chosen by dragging a thumb along a track or with the keyboard. */
export function Slider({
  label,
  hint,
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  largeStep = Math.max(step, Math.round((max - min) / 10 / step) * step),
  formatValue,
  disabled = false,
  name,
  form,
  inputRef,
  className,
  'aria-describedby': describedBy,
  ...props
}: SliderProps) {
  const id = useId();
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
  const description =
    [describedBy, hint != null ? `${id}-hint` : undefined].filter(Boolean).join(' ') || undefined;
  return (
    <BaseSlider.Root
      {...props}
      className={classNames('env-slider', className)}
      value={current}
      onValueChange={(next) => {
        if (value === undefined) setUncontrolledValue(next);
        onValueChange?.(next);
      }}
      onValueCommitted={(next) => onValueCommit?.(next)}
      min={min}
      max={max}
      step={step}
      largeStep={largeStep}
      disabled={disabled}
      name={name}
      form={form}
    >
      <FieldFrame
        id={id}
        label={
          <div className="env-slider-heading">
            <BaseSlider.Label className="env-slider-label">{label}</BaseSlider.Label>
            {/* The output names the range input it shows, and stays quiet while the value moves. */}
            <BaseSlider.Value className="env-slider-value">
              {(formatted, values) => (formatValue ? formatValue(values[0]!) : formatted[0])}
            </BaseSlider.Value>
          </div>
        }
        hint={hint}
      >
        <BaseSlider.Control className="env-slider-control">
          <BaseSlider.Track className="env-slider-track">
            <BaseSlider.Indicator className="env-slider-indicator" />
            <BaseSlider.Thumb
              className="env-slider-thumb"
              inputRef={(node: HTMLInputElement | null) => {
                input.current = node;
                setRef(inputRef, node);
              }}
              aria-describedby={description}
              getAriaValueText={(formatted, number) =>
                formatValue ? formatValue(number) : formatted
              }
            />
          </BaseSlider.Track>
        </BaseSlider.Control>
      </FieldFrame>
    </BaseSlider.Root>
  );
}
