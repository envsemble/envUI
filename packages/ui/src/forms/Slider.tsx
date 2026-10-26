'use client';

import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Slider as BaseSlider } from '@base-ui/react/slider';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { Row } from '../foundations/Layout.js';
import { Text } from '../foundations/Text.js';
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
 * that shows it. Pressing or dragging anywhere in it chooses a value, and so do the arrow keys. At
 * rest it shows only its text and fill; a thin handle at the value and faint ticks at its steps
 * appear under the pointer and while it is pressed, and go once it is released, and the handle
 * alone shows with keyboard focus. An optional description sits below it.
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
  const control = useRef<HTMLDivElement>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? min);
  // What the slider shows beyond its text and fill follows one rule (sliderReveal): the handle and
  // the ruler of ticks while a pointer hovers or presses it, and the handle alone with keyboard
  // focus. A release puts it back at rest, though the pointer may still be over it: hover counts
  // again only once the pointer has left and come back.
  const [pressed, setPressed] = useState(false);
  const [hover, setHover] = useState<SliderHover>('away');
  const [keyboard, setKeyboard] = useState(false);
  useEffect(function followHover() {
    const element = control.current;
    if (!element) return;
    // Native events, as the pointer capture Base UI sets while pressed confuses React's emulated
    // enter and leave. A touch has no hover: a finger shows the handle only while it is down.
    const enter = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') setHover('over');
    };
    const leave = () => setHover('away');
    element.addEventListener('pointerenter', enter);
    element.addEventListener('pointerleave', leave);
    return () => {
      element.removeEventListener('pointerenter', enter);
      element.removeEventListener('pointerleave', leave);
    };
  }, []);
  // The press lasts until the pointer is released anywhere, cancelled or loses its capture, or the
  // window loses focus, so the handle and the ruler never stay.
  useLayoutEffect(
    function endPress() {
      const element = control.current;
      if (!pressed || !element) return;
      const view = element.ownerDocument.defaultView;
      const release = (event: Event) => {
        setPressed(false);
        setHover((current) => afterRelease(current, element, event));
      };
      // A move without a button means the release went to something that kept it.
      const move = (event: PointerEvent) => {
        if (event.buttons === 0) release(event);
      };
      const owner = element.ownerDocument;
      owner.addEventListener('pointerup', release, true);
      owner.addEventListener('pointercancel', release, true);
      owner.addEventListener('pointermove', move, true);
      element.addEventListener('lostpointercapture', release);
      view?.addEventListener('blur', release);
      return () => {
        owner.removeEventListener('pointerup', release, true);
        owner.removeEventListener('pointercancel', release, true);
        owner.removeEventListener('pointermove', move, true);
        element.removeEventListener('lostpointercapture', release);
        view?.removeEventListener('blur', release);
      };
    },
    [pressed],
  );
  const reveal = sliderReveal({ pressed, hover, keyboard, disabled });
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
  // Where the fill's end and the handle pass under the label or the value, they fade while they show,
  // so the text stays legible at full strength: measured again as the value moves and as the slider
  // or its text changes size. At rest the stylesheet ignores the measure.
  useLayoutEffect(
    function veilAtCurrentValue() {
      if (control.current) veilIndicatorUnderText(control.current);
    },
    [current, label, formatValue],
  );
  // Dragged past either end, the value stays there and the slider stretches a little after the
  // pointer, as a rubber band, then springs back once let go. The stretch is set on the control
  // directly, once a frame, so a drag renders nothing.
  useEffect(
    function stretchPastTheEnds() {
      const element = control.current;
      if (!element || disabled) return;
      return followOverdrag(element);
    },
    [disabled],
  );
  useEffect(function veilOnResize() {
    const element = control.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => veilIndicatorUnderText(element));
    observer.observe(element);
    for (const text of element.querySelectorAll('.env-slider-label, .env-slider-value'))
      observer.observe(text);
    return () => observer.disconnect();
  }, []);
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
        style={
          {
            '--env-slider-ticks': ticks,
            '--env-slider-fraction': fractionOf(current, min, max),
            ...style,
          } as CSSProperties
        }
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
          <BaseSlider.Control
            ref={control}
            className="env-slider-control"
            data-pressed={pressed && !disabled ? '' : undefined}
            data-handle={reveal.handle ? '' : undefined}
            data-ruler={reveal.ruler ? '' : undefined}
            onPointerDown={(event) => {
              setKeyboard(false);
              if (!disabled && event.button === 0) setPressed(true);
            }}
            // Keyboard focus, or a key pressed while focused, shows the handle; a press or leaving
            // the slider ends it.
            onFocus={(event) => {
              if (event.target.matches(':focus-visible')) setKeyboard(true);
            }}
            onKeyDown={() => setKeyboard(true)}
            onBlur={() => setKeyboard(false)}
          >
            <BaseSlider.Track className="env-slider-track">
              <BaseSlider.Indicator className="env-slider-indicator" />
              {/* The handle: a thin line at the value, which shows under the pointer, while pressed
                  and with keyboard focus, beneath the label and the value. */}
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
            {/* The label and the value sit over the track, the fill and the handle, inside the
                slider, in the type of a field's text, always at full strength. */}
            <Row align="center" justify="between" gap={3} className="env-slider-heading">
              <BaseSlider.Label className="env-slider-label" render={<Text render={<div />} />}>
                {label}
              </BaseSlider.Label>
              {/* The output names the range input it shows, and stays quiet while the value moves. */}
              <BaseSlider.Value className="env-slider-value" render={<Text render={<output />} />}>
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
 * Where a hovering pointer stands: away from the slider; over it, which shows the handle and the
 * ruler; or over it after releasing it there, which doesn't, until the pointer leaves and comes back.
 */
type SliderHover = 'away' | 'over' | 'released';

/**
 * The rule for what the slider shows besides its text and fill. Pressed, or with a pointer over it
 * that hasn't released it there since it came, the handle and the ruler of ticks; with keyboard
 * focus, the handle alone, as the value says the exact amount. Otherwise, at rest, neither.
 */
function sliderReveal({
  pressed,
  hover,
  keyboard,
  disabled,
}: {
  pressed: boolean;
  hover: SliderHover;
  keyboard: boolean;
  disabled: boolean;
}): { handle: boolean; ruler: boolean } {
  if (disabled) return { handle: false, ruler: false };
  const pointer = pressed || hover === 'over';
  return { handle: pointer || keyboard, ruler: pointer };
}

/**
 * The hover once a press ends: a release over the slider spends it, so the slider returns to rest
 * under the pointer; a release elsewhere, or by a finger, leaves the pointer away. Where the event
 * has no place, as a lost capture or the window's blur, the pointer stays where it was.
 */
function afterRelease(current: SliderHover, control: HTMLElement, event: Event): SliderHover {
  if (!('clientX' in event) || event.type === 'lostpointercapture') {
    return current === 'away' ? 'away' : 'released';
  }
  const pointer = event as PointerEvent;
  if (pointer.pointerType === 'touch') return 'away';
  const box = control.getBoundingClientRect();
  const inside =
    pointer.clientX >= box.left &&
    pointer.clientX <= box.right &&
    pointer.clientY >= box.top &&
    pointer.clientY <= box.bottom;
  return inside ? 'released' : 'away';
}

/**
 * Marks where the slider's indicators pass under the label or the value, within half a line of
 * either, so the stylesheet fades them there while they show. --env-slider-veil on the control is 1
 * where the end of the fill and the handle sit under the text, and 0 elsewhere. For the ticks,
 * --env-slider-clear-start and --env-slider-clear-end bound the stretch clear of the text, from the
 * track's left side, physical as the ticks are, so that either direction works.
 */
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
    const margin = Number.parseFloat(getComputedStyle(text).fontSize) / 2 || 0;
    if (at >= box.left - margin && at <= box.right + margin) veiled = true;
    // The text in the track's left half bounds the clear stretch on the left, the other on the right.
    if (box.left + box.width / 2 < span.left + span.width / 2)
      clearStart = Math.max(clearStart, box.right + margin - span.left);
    else clearEnd = Math.min(clearEnd, box.left - margin - span.left);
  }
  control.style.setProperty('--env-slider-veil', veiled ? '1' : '0');
  control.style.setProperty('--env-slider-clear-start', `${clearStart}px`);
  control.style.setProperty('--env-slider-clear-end', `${clearEnd}px`);
}

/**
 * The most a slider stretches, as a fraction of its length, and, so that a wide one stays calm, at
 * most half its height.
 */
const STRETCH_MOST = 0.06;
/** How readily the stretch gives at first: at a pointer's first pixels past the end, about half. */
const STRETCH_GIVE = 0.55;

/**
 * How far the slider stretches, in pixels, for a pointer this far past its end: a rubber band's
 * curve, which gives a little over half the distance at first and less the further it goes,
 * approaching the reach but never reaching it, and always short of the pointer.
 */
function rubberBand(past: number, reach: number): number {
  if (!(past > 0) || !(reach > 0)) return 0;
  return reach * (1 - 1 / (1 + (STRETCH_GIVE * past) / reach));
}

/**
 * Follows a pointer that presses the slider's control and drags past either end: the control's
 * --env-slider-stretch is the fraction it stretches by, and --env-slider-stretch-origin the side it
 * stays fixed on, the one away from the pointer, physical, so either direction works. The stretch
 * is measured once a frame, at most, and follows at once (--env-slider-stretch-spring, 0s); a release
 * sets it back to 0, and the stylesheet springs it back.
 * Under reduced motion it never stretches. Returns the cleanup.
 */
function followOverdrag(control: HTMLElement): () => void {
  const owner = control.ownerDocument;
  const view = owner.defaultView;
  if (!view) return () => {};
  let drag: { id: number; left: number; right: number; width: number; reach: number } | null = null;
  let pointerX = 0;
  let frame = 0;
  const stretch = (fraction: number) =>
    control.style.setProperty('--env-slider-stretch', String(Math.round(fraction * 1e5) / 1e5));
  const apply = () => {
    frame = 0;
    if (!drag) return;
    const pastRight = pointerX - drag.right;
    const pastLeft = drag.left - pointerX;
    const past = Math.max(pastRight, pastLeft, 0);
    if (past > 0) {
      control.style.setProperty('--env-slider-stretch-origin', pastRight > 0 ? 'left' : 'right');
      // Past the end, the stretch follows the pointer at once, until the release springs it back.
      control.style.setProperty('--env-slider-stretch-spring', '0s');
    }
    stretch(rubberBand(past, drag.reach) / drag.width);
  };
  const move = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.id) return;
    // A move without a button means the release went to something that kept it.
    if (event.buttons === 0) return stop();
    pointerX = event.clientX;
    if (!frame) frame = view.requestAnimationFrame(apply);
  };
  const end = (event: Event) => {
    if (drag && (!('pointerId' in event) || (event as PointerEvent).pointerId === drag.id)) stop();
  };
  const listen = () => {
    owner.addEventListener('pointermove', move, true);
    owner.addEventListener('pointerup', end, true);
    owner.addEventListener('pointercancel', end, true);
    control.addEventListener('lostpointercapture', end);
    view.addEventListener('blur', end);
  };
  const stop = () => {
    drag = null;
    if (frame) view.cancelAnimationFrame(frame);
    frame = 0;
    owner.removeEventListener('pointermove', move, true);
    owner.removeEventListener('pointerup', end, true);
    owner.removeEventListener('pointercancel', end, true);
    control.removeEventListener('lostpointercapture', end);
    view.removeEventListener('blur', end);
    // Both in one change, as the release may be measured before the next frame.
    control.style.removeProperty('--env-slider-stretch-spring');
    stretch(0);
  };
  const down = (event: PointerEvent) => {
    if (drag || event.button !== 0 || !event.isPrimary) return;
    if (view.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    // The box as it would be unstretched, as a press can come while the slider still springs back:
    // its stretch so far, and the side it stretches from, give its length and where it starts.
    const now = Number.parseFloat(
      getComputedStyle(control).getPropertyValue('--env-slider-stretch'),
    );
    const s = Number.isFinite(now) ? now : 0;
    const box = control.getBoundingClientRect();
    const width = box.width / (1 + s);
    const height = box.height / (1 - s / 2);
    if (!(width > 0)) return;
    const fromRight = control.style.getPropertyValue('--env-slider-stretch-origin') === 'right';
    const left = fromRight ? box.right - width : box.left;
    const reach = Math.min(width * STRETCH_MOST, height / 2);
    drag = { id: event.pointerId, left, right: left + width, width, reach };
    pointerX = event.clientX;
    listen();
  };
  control.addEventListener('pointerdown', down);
  return () => {
    control.removeEventListener('pointerdown', down);
    if (drag) stop();
  };
}

/**
 * The value's place in the range, from 0 at min to 1 at max, which keeps the handle clear of the
 * rounded ends; 0 where the range is empty.
 */
function fractionOf(value: number, min: number, max: number): number {
  if (!(max > min)) return 0;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
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
