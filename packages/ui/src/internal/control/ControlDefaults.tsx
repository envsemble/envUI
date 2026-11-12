'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { ControlSize } from './controlTypes.js';
import { reportInDevelopment } from '../developmentReport.js';

/** A button's variant, the one list of them, which Button's ButtonVariant documents. */
export type ControlVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'text';

/** A button's tone, the one list of them, which Button's ButtonTone documents. */
export type ControlTone = 'neutral' | 'accent' | 'danger';

/**
 * Defaults a container gives the buttons the application puts in its slots, such as the actions of
 * a toolbar or a title bar, which take the ghost variant there. A button's own prop always wins.
 */
export interface ControlDefaultsValue {
  /** The variant of a Button or IconButton that sets none, where it takes the button's tone. */
  variant?: ControlVariant;
  /** The size of a Button or IconButton that sets none. */
  size?: ControlSize;
}

const ControlDefaultsContext = createContext<ControlDefaultsValue>({});

/**
 * Gives the buttons inside it a default variant and size, which they take only where they set
 * none. Nested defaults merge, the inner winning.
 */
export function ControlDefaults({
  variant,
  size,
  children,
}: ControlDefaultsValue & { children?: ReactNode }) {
  const outer = useContext(ControlDefaultsContext);
  const value = useMemo(
    () => ({ variant: variant ?? outer.variant, size: size ?? outer.size }),
    [variant, size, outer.variant, outer.size],
  );
  return <ControlDefaultsContext value={value}>{children}</ControlDefaultsContext>;
}

const noDefaults: ControlDefaultsValue = {};

/**
 * Clears the defaults of every ControlDefaults around it, for content a portal renders elsewhere:
 * a popover or dialog opened from a toolbar or a field's end action is not inside them on the page,
 * so its buttons take their own defaults.
 */
export function ResetControlDefaults({ children }: { children?: ReactNode }) {
  return <ControlDefaultsContext value={noDefaults}>{children}</ControlDefaultsContext>;
}

/** The defaults of the nearest ControlDefaults, or none. */
export function useControlDefaults(): ControlDefaultsValue {
  return useContext(ControlDefaultsContext);
}

/**
 * The tones each variant is designed in, which Button's ButtonEmphasisProps types as its pairs and
 * a development build's report lists.
 */
const designedTones: Readonly<Record<ControlVariant, readonly ControlTone[]>> = {
  primary: ['neutral', 'accent', 'danger'],
  secondary: ['neutral'],
  outline: ['neutral', 'danger'],
  ghost: ['neutral', 'danger'],
  text: ['neutral', 'danger'],
};

/** Whether `variant` is designed in `tone`. */
function takesTone(variant: ControlVariant, tone: ControlTone) {
  return designedTones[variant].includes(tone);
}

/**
 * The variant and tone a button renders in, by one rule:
 * 1. its own variant, where it sets one;
 * 2. else its container's, from the nearest ControlDefaults, where that variant takes the button's
 *    tone: a `tone="danger"` button in a toolbar is a ghost danger one;
 * 3. else the variant the button falls back to, primary for Button: a `tone="accent"` button in a
 *    toolbar stays the primary accent one it is elsewhere, since ghost has no accent.
 * A pair that is still not designed, which only code past the types can ask for, such as a
 * secondary danger button, renders neutral, and a development build reports it once.
 */
export function resolveEmphasis(
  {
    variant,
    tone = 'neutral',
    fallbackVariant,
  }: { variant?: ControlVariant; tone?: ControlTone; fallbackVariant: ControlVariant },
  containerVariant: ControlVariant | undefined,
): { variant: ControlVariant; tone: ControlTone } {
  const resolved =
    variant ??
    (containerVariant && takesTone(containerVariant, tone) ? containerVariant : fallbackVariant);
  if (takesTone(resolved, tone)) return { variant: resolved, tone };
  reportInDevelopment(
    () =>
      process.env.NODE_ENV !== 'production' &&
      `a ${resolved} button has no ${tone} tone, so it renders neutral. A ${resolved} button takes ${new Intl.ListFormat('en', { type: 'disjunction' }).format(designedTones[resolved])}.`,
  );
  return { variant: resolved, tone: 'neutral' };
}

/**
 * resolveEmphasis with the nearest ControlDefaults, for a component that renders a Button with an
 * explicit variant, such as ConfirmButton, whose resting variant falls back to outline.
 */
export function useButtonEmphasis(emphasis: {
  variant?: ControlVariant;
  tone?: ControlTone;
  fallbackVariant: ControlVariant;
}) {
  return resolveEmphasis(emphasis, useControlDefaults().variant);
}
