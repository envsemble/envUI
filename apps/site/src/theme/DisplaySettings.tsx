import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import {
  Button,
  IconButton,
  Menu,
  ThemePreferenceProvider,
  Tooltip,
  useThemePreference,
  type ThemeContrast,
  type ThemePreference,
  type ThemeScale,
} from '@envsemble/envui';
import { IconTune } from '@envsemble/envui/icons/Tune';
import { displayStorageKeys } from './DisplayStorage';
import { reducedMotion } from '../motion/MotionTokens';

const themes: readonly ThemePreference[] = ['system', 'light', 'dark'];
const contrasts: readonly ThemeContrast[] = ['system', 'standard', 'high'];
const scales: readonly ThemeScale[] = ['system', 'comfortable', 'compact'];
const motions = ['playing', 'paused'] as const;

function readStored<T extends string>(key: string, values: readonly T[], fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return values.find((value) => value === stored) ?? fallback;
  } catch {
    // Storage can be blocked; the catalogue then starts with the defaults.
    return fallback;
  }
}

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // A blocked storage API keeps the choice for this visit only.
  }
}

/**
 * The scale the address asks for with ?scale=compact, ?scale=comfortable or ?scale=system, to
 * review a page at that scale without changing the stored setting.
 */
function requestedScale(): ThemeScale | undefined {
  if (typeof location === 'undefined') return undefined;
  const requested = new URLSearchParams(location.search).get('scale');
  return scales.find((scale) => scale === requested);
}

/**
 * Whether the site's animations start paused: where the reader prefers reduced motion, until they
 * play them.
 */
function initialMotion() {
  const reduced =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  return readStored(displayStorageKeys.motion, motions, reduced ? 'paused' : 'playing');
}

interface DisplaySettingsValue {
  contrast: ThemeContrast;
  scale: ThemeScale;
  /** Whether every animation of the site is paused, the previews' and the figures'. */
  motionPaused: boolean;
  setContrast: (contrast: ThemeContrast) => void;
  setScale: (scale: ThemeScale) => void;
  setMotionPaused: (paused: boolean) => void;
}

const DisplaySettingsContext = createContext<DisplaySettingsValue | null>(null);

/**
 * The site's theme, contrast and scale, and whether its animations play, as the reader chose them
 * in the Display menu: stored in localStorage,
 * the theme by ThemePreferenceProvider and the others here, and kept in step with the site's other
 * windows. The theme follows the system until the reader picks one, the contrast follows
 * `prefers-contrast` until then, and the animations start paused where reduced motion is preferred.
 */
export function DisplaySettingsProvider({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const [contrast, setContrastState] = useState(() =>
    readStored(displayStorageKeys.contrast, contrasts, 'system'),
  );
  const [scale, setScaleState] = useState(
    () => requestedScale() ?? readStored(displayStorageKeys.scale, scales, 'system'),
  );
  const [motion, setMotionState] = useState(initialMotion);
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === displayStorageKeys.contrast)
        setContrastState(readStored(displayStorageKeys.contrast, contrasts, 'system'));
      if (event.key === displayStorageKeys.scale)
        setScaleState(readStored(displayStorageKeys.scale, scales, 'system'));
      if (event.key === displayStorageKeys.motion) setMotionState(initialMotion());
    };
    addEventListener('storage', onStorage);
    return () => removeEventListener('storage', onStorage);
  }, []);
  const value = useMemo<DisplaySettingsValue>(
    () => ({
      contrast,
      scale,
      motionPaused: motion === 'paused',
      setContrast(next) {
        setContrastState(next);
        store(displayStorageKeys.contrast, next);
      },
      setScale(next) {
        setScaleState(next);
        store(displayStorageKeys.scale, next);
      },
      setMotionPaused(paused) {
        const next = paused ? 'paused' : 'playing';
        setMotionState(next);
        store(displayStorageKeys.motion, next);
      },
    }),
    [contrast, scale, motion],
  );
  return (
    <DisplaySettingsContext value={value}>
      <ThemePreferenceProvider
        storageKey={displayStorageKeys.theme}
        contrast={contrast}
        scale={scale}
        className={className}
      >
        {children}
      </ThemePreferenceProvider>
    </DisplaySettingsContext>
  );
}

export function useDisplaySettings() {
  const value = use(DisplaySettingsContext);
  if (!value) throw new Error('useDisplaySettings needs a DisplaySettingsProvider around it.');
  return value;
}

/**
 * Changes the page's colors, a theme or a contrast chosen in the Display menu, crossfading the
 * whole window from the old ones to the new (ThemeFade.css), rather than swapping them in one
 * frame. The new colors are drawn at once underneath, with nothing in the
 * page transitioning (ThemePreferenceProvider). With motion reduced, or in a browser without view
 * transitions, they change at once.
 */
function switchColors(change: () => void) {
  if (typeof document.startViewTransition !== 'function' || reducedMotion()) return change();
  document.startViewTransition(() => flushSync(change));
}

/**
 * The Display menu: the theme, the contrast, the scale and the motion, each stored as it is chosen,
 * four groups of plain choices alike. Motion pauses every animation of the site, the tiles' and the
 * figures', on every page, or plays them again; a figure's own button overrides it for that figure
 * (MotionStage.tsx). iconOnly shows its trigger as an icon, in a narrow window. It opens below its
 * trigger, at the page's top end.
 */
export function DisplayMenu({ iconOnly = false }: { iconOnly?: boolean }) {
  const { contrast, setContrast, scale, setScale, motionPaused, setMotionPaused } =
    useDisplaySettings();
  const { preference, setPreference } = useThemePreference();
  return (
    <Menu.Root
      aria-label="Display"
      side="bottom"
      align="end"
      trigger={
        iconOnly ? (
          // The Tooltip passes the menu button's props and ref on to the IconButton.
          <Tooltip content="Display">
            <IconButton variant="ghost" icon={<IconTune />} aria-label="Display" />
          </Tooltip>
        ) : (
          <Button variant="ghost" startIcon={<IconTune />}>
            Display
          </Button>
        )
      }
    >
      <Menu.RadioGroup
        label="Theme"
        value={preference}
        onValueChange={(next) =>
          switchColors(() => setPreference(themes.find((value) => value === next)!))
        }
      >
        <Menu.RadioItem value="system" closeOnClick={false}>
          System
        </Menu.RadioItem>
        <Menu.RadioItem value="light" closeOnClick={false}>
          Light
        </Menu.RadioItem>
        <Menu.RadioItem value="dark" closeOnClick={false}>
          Dark
        </Menu.RadioItem>
      </Menu.RadioGroup>
      <Menu.Separator />
      <Menu.RadioGroup
        label="Contrast"
        value={contrast}
        onValueChange={(next) =>
          switchColors(() => setContrast(contrasts.find((value) => value === next)!))
        }
      >
        <Menu.RadioItem value="system" closeOnClick={false}>
          System
        </Menu.RadioItem>
        <Menu.RadioItem value="standard" closeOnClick={false}>
          Standard
        </Menu.RadioItem>
        <Menu.RadioItem value="high" closeOnClick={false}>
          High
        </Menu.RadioItem>
      </Menu.RadioGroup>
      <Menu.Separator />
      <Menu.RadioGroup
        label="Scale"
        value={scale}
        onValueChange={(next) => setScale(scales.find((value) => value === next)!)}
      >
        <Menu.RadioItem value="system" closeOnClick={false}>
          System
        </Menu.RadioItem>
        <Menu.RadioItem value="comfortable" closeOnClick={false}>
          Comfortable
        </Menu.RadioItem>
        <Menu.RadioItem value="compact" closeOnClick={false}>
          Compact
        </Menu.RadioItem>
      </Menu.RadioGroup>
      <Menu.Separator />
      <Menu.RadioGroup
        label="Motion"
        value={motionPaused ? 'paused' : 'playing'}
        onValueChange={(next) => setMotionPaused(next === 'paused')}
      >
        <Menu.RadioItem value="playing" closeOnClick={false}>
          Play
        </Menu.RadioItem>
        <Menu.RadioItem value="paused" closeOnClick={false}>
          Pause
        </Menu.RadioItem>
      </Menu.RadioGroup>
    </Menu.Root>
  );
}
