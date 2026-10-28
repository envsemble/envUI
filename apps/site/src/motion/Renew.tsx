import { Fragment, useEffect, useState, type ReactNode } from 'react';

/** How long the example takes to fade out, and then in again, as it is drawn anew. */
const fade = 200;

/**
 * Draws an animated figure's example anew whenever `round` changes, with a short fade out and in:
 * for a loop that can't put the example back as it was by using it, such as projects created or
 * a file removed, so it ends where it began without a jump. Count the rounds in a cue near the
 * script's end (usePointer's `onCue`), and leave the fade's time after it.
 */
export function Renew({ round, children }: { round: number; children: ReactNode }) {
  const [shown, setShown] = useState(round);
  const fading = shown !== round;
  useEffect(() => {
    if (!fading) return;
    const timer = window.setTimeout(() => setShown(round), fade);
    return () => window.clearTimeout(timer);
  }, [fading, round]);
  return (
    // Laid out as the stage lays out the example: as wide as the stage, the example centred.
    <div
      style={{
        display: 'grid',
        justifyItems: 'center',
        inlineSize: '100%',
        opacity: fading ? 0 : 1,
        transition: `opacity ${fade}ms ease`,
      }}
    >
      <Fragment key={shown}>{children}</Fragment>
    </div>
  );
}
