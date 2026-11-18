import { Fragment, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { rootMotionDuration } from '../shared/RootMotionTokens';

const fadeSpeed = 'medium';

const crossfadeSpeed = 'slow';

const durationOf = (speed: 'medium' | 'slow') => `var(--env-motion-duration-${speed})`;

const layout: CSSProperties = { display: 'grid', justifyItems: 'center', inlineSize: '100%' };

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
      rootMotionDuration(crossfade ? crossfadeSpeed : fadeSpeed),
    );
    return () => window.clearTimeout(timer);
  }, [fading, round, crossfade]);
  if (crossfade)
    return (
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
                animation: `catalogue-renew-out ${durationOf(crossfadeSpeed)} var(--env-motion-ease) forwards`,
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
        transition: `opacity ${durationOf(fadeSpeed)} var(--env-motion-ease)`,
      }}
    >
      <Fragment key={shown}>{children}</Fragment>
    </div>
  );
}
