import { createContext, Fragment, use, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Button,
  IconButton,
  Popover,
  SegmentedControl,
  Text,
  ThemePreferenceProvider,
  Tooltip,
  type SegmentedControlItem,
  useThemePreference,
  type ThemeContrast,
  type ThemePreference,
  type ThemeScale,
} from '@envsemble/envui';
import { IconTune } from '@envsemble/envui/icons/Tune';
import { displayStorageKeys } from './DisplayStorage';

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

/** The Display menu's settings, each one choice among a few, in the order they show. */
const settingItems = {
  Theme: [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ],
  Contrast: [
    { value: 'system', label: 'System' },
    { value: 'standard', label: 'Standard' },
    { value: 'high', label: 'High' },
  ],
  Scale: [
    { value: 'system', label: 'System' },
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'compact', label: 'Compact' },
  ],
  Motion: [
    { value: 'playing', label: 'Play' },
    { value: 'paused', label: 'Pause' },
  ],
} satisfies Record<string, readonly SegmentedControlItem[]>;

/**
 * The Display menu: the theme, the contrast, the scale and the motion, each stored as it is chosen,
 * four rows alike, each its name beside a SegmentedControl of its choices, so the whole fits in a
 * small popover. Motion pauses every animation of the site, the tiles' and the figures', on every
 * page, or plays them again; a figure's own button overrides it for that figure (MotionStage.tsx).
 * iconOnly shows its trigger as an icon, in a narrow window. It opens below its trigger, at the
 * page's top end.
 */
export function DisplayMenu({ iconOnly = false }: { iconOnly?: boolean }) {
  const { contrast, setContrast, scale, setScale, motionPaused, setMotionPaused } =
    useDisplaySettings();
  const { preference, setPreference } = useThemePreference();
  const settings: [keyof typeof settingItems, string, (next: string) => void][] = [
    ['Theme', preference, (next) => setPreference(themes.find((value) => value === next)!)],
    ['Contrast', contrast, (next) => setContrast(contrasts.find((value) => value === next)!)],
    ['Scale', scale, (next) => setScale(scales.find((value) => value === next)!)],
    ['Motion', motionPaused ? 'paused' : 'playing', (next) => setMotionPaused(next === 'paused')],
  ];
  return (
    <Popover
      aria-label="Display"
      side="bottom"
      align="end"
      width="lg"
      trigger={
        iconOnly ? (
          // The Tooltip passes the popover button's props and ref on to the IconButton.
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
      <div className="site-display-settings">
        {settings.map(([name, value, onValueChange]) => (
          <Fragment key={name}>
            <Text variant="body-sm" emphasis="muted" render={<span aria-hidden="true" />}>
              {name}
            </Text>
            <SegmentedControl
              aria-label={name}
              size="sm"
              items={settingItems[name]}
              value={value}
              onValueChange={onValueChange}
            />
          </Fragment>
        ))}
      </div>
    </Popover>
  );
}
