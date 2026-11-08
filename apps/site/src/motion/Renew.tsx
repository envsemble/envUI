import { Fragment, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { rootMotionDuration } from './RootMotionTokens';

/** How long the example takes to fade out, and then in again, when it is drawn again. */
const fade = 'medium';

/** With `crossfade`, how long the new example takes to show through the old one as it fades out. */
const crossfadeTime = 'slow';

/** A motion token's duration, for a style. */
const durationOf = (speed: 'medium' | 'slow') => `var(--env-motion-duration-${speed})`;

/** Laid out as the stage lays out the example: as wide as the stage, with the example centred. */
const layout: CSSProperties = { display: 'grid', justifyItems: 'center', inlineSize: '100%' };

/**
 * Draws an animated figure's example again whenever `round` changes, with a short fade out and in.
 * This is for a loop that can't return the example to its start by using it, such as one that
 * creates projects or removes a file, so that the loop ends where it began without a jump. Count
 * the rounds in a cue near the end of the script (usePointer's `onCue`), and leave time for the
 * fade after it. With `crossfade`, the new example is there at once, beneath the old one, which
 * fades out over it: what both show alike, such as a composer at the bottom, stays as it is, and
 * the figure is never blank.
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
      // Both in one grid cell, keyed by their rounds so the old one keeps its state: the new one
      // beneath, the old one over it, fading out, and removed once it has.
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
