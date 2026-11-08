import { Fragment, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { rootMotionDuration } from '../shared/RootMotionTokens';

/** How long the example takes to fade out, and then in again, as it is drawn anew. */
const fade = 'medium';

/** How long the example drawn anew takes to show through the one that fades out, with `crossfade`. */
const crossfadeTime = 'slow';

/** A motion token's duration, for a style. */
const durationOf = (speed: 'medium' | 'slow') => `var(--env-motion-duration-${speed})`;

/** Laid out as the stage lays out the example: as wide as the stage, the example centred. */
const layout: CSSProperties = { display: 'grid', justifyItems: 'center', inlineSize: '100%' };

/**
 * Draws an animated figure's example anew whenever `round` changes, with a short fade out and in:
 * for a loop that can't put the example back as it was by using it, such as projects created or
 * a file removed, so it ends where it began without a jump. Count the rounds in a cue near the
 * script's end (usePointer's `onCue`), and leave the fade's time after it. With `crossfade`, the
 * example drawn anew is there at once, beneath the one that ends, which fades out over it: what
 * both show alike, such as a composer at the foot, stays as it is, and the figure is never blank.
 */
export function Renew({
  round,
  crossfade = false,
  children,
}: {
  round: number;
  crossfade?: boolean;
  children: ReactNode;
}) {
  const [shown, setShown] = useState(round);
  const fading = shown !== round;
  useEffect(() => {
    if (!fading) return;
    const timer = window.setTimeout(
      () => setShown(round),
      rootMotionDuration(crossfade ? crossfadeTime : fade),
    );
    return () => window.clearTimeout(timer);
  }, [fading, round, crossfade]);
  if (crossfade)
    return (
      // Both in one cell, keyed by their rounds so the one that ends keeps its state: the new one
      // beneath, the one that ends over it, fading out, and taken away once it has.
      <div style={{ ...layout, gridTemplateAreas: '"renew"' }}>
        {[...new Set([round, shown])].map((each) => (
          <div
            key={each}
            inert={each !== round}
            aria-hidden={each !== round || undefined}
            style={{
              ...layout,
              gridArea: 'renew',
              ...(each !== round && {
                animation: `catalogue-renew-out ${durationOf(crossfadeTime)} var(--env-motion-ease) forwards`,
              }),
            }}
          >
            {children}
          </div>
        ))}
      </div>
    );
  return (
    <div
      style={{
        ...layout,
        opacity: fading ? 0 : 1,
        transition: `opacity ${durationOf(fade)} var(--env-motion-ease)`,
      }}
    >
      <Fragment key={shown}>{children}</Fragment>
    </div>
  );
}
