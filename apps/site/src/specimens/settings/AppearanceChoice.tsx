import { useState } from 'react';
import { Surface, ThemePreferenceProvider, useTheme, type ThemeScale } from '@envsemble/envui';
import AppearanceChoice from '../../examples/settings/AppearanceChoice';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

/** Where the figure's own preference is kept, apart from the site's. */
const storageKey = 'catalogue-appearance-figure';

const choice = (value: string) => `.env-radio:has(input[value="${value}"])`;

/*
 * The pointer picks the theme other than the page's: the figure's own area takes it at once. It
 * picks Compact, and the area steps down a scale. Then it puts both back, System and Comfortable.
 */
const scriptFrom = (other: 'light' | 'dark'): PointerStep[] => [
  { wait: 500 },
  { to: choice(other), x: 0.3, y: 2.5 },
  { to: choice(other), x: 0.3, y: 0.5, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 1300 },
  { to: choice('compact'), x: 0.3, y: 0.5, duration: 600 },
  { wait: 300 },
  { click: true },
  { cue: 'compact' },
  { wait: 1500 },
  { to: choice('comfortable'), x: 0.3, y: 0.5, duration: 450 },
  { wait: 300 },
  { click: true },
  { cue: 'comfortable' },
  { wait: 900 },
  { to: choice('system'), x: 0.3, y: 0.5, duration: 600 },
  { wait: 300 },
  { click: true },
  { wait: 1000 },
  { leave: true },
  { wait: 700 },
];

function Choosing() {
  const site = useTheme();
  const [script] = useState(() => scriptFrom(site.theme === 'dark' ? 'light' : 'dark'));
  // The application sets the chosen scale on its root provider; here, on the figure's own.
  const [scale, setScale] = useState<ThemeScale>('comfortable');
  usePointer(script, {
    onCue: (cue) => setScale(cue === 'compact' ? 'compact' : 'comfortable'),
  });
  return (
    // As tall as the area at the comfortable scale, so the stage keeps one height as it steps down.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        justifyItems: 'center',
        inlineSize: '100%',
        minBlockSize: '29.3rem',
      }}
    >
      {/* The figure's own area, which takes the theme and the scale chosen in it, as a window would. */}
      <ThemePreferenceProvider
        applyToDocument={false}
        storageKey={storageKey}
        defaultPreference="system"
        scale={scale}
      >
        <Surface background="default" padding={5} style={{ borderRadius: 'var(--env-radius-xl)' }}>
          <AppearanceChoice />
        </Surface>
      </ThemePreferenceProvider>
    </div>
  );
}

/** The appearance settings, chosen by a pointer no one sees, taking effect in the figure at once. */
export default function AppearanceChoiceMotion() {
  // Each visit starts at System, whatever a figure left behind.
  useState(() => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Storage may be blocked; the figure starts at System anyway.
    }
    return null;
  });
  return (
    <MotionStage label="the theme and the scale taking effect at once">
      <Choosing />
    </MotionStage>
  );
}
