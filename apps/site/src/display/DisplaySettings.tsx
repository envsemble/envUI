import { useEffect, useMemo, useState, type ReactNode } from 'react';
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
import { useStoredThemePreference } from '@envsemble/envui/theme-storage';
import { displayStorageKeys, siteThemeStorage } from './DisplayStorage';
import { prefersReducedMotion } from '../shared/ReducedMotion';
import { useHydrated } from '../shared/useHydrated';
import {
  DisplaySettingsContext,
  useDisplaySettings,
  type DisplaySettingsValue,
} from './useDisplaySettings';

const themes: readonly ThemePreference[] = ['system', 'light', 'dark'];
const contrasts: readonly ThemeContrast[] = ['system', 'standard', 'high'];
const scales: readonly ThemeScale[] = ['system', 'comfortable', 'compact'];
const motions = ['playing', 'paused'] as const;

function readStored<T extends string>(key: string, values: readonly T[], fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return values.find((value) => value === stored) ?? fallback;
  } catch {
    return fallback;
  }
}

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function requestedScale(): ThemeScale | undefined {
  if (typeof location === 'undefined') return undefined;
  const requested = new URLSearchParams(location.search).get('scale');
  return scales.find((scale) => scale === requested);
}

function initialMotion() {
  return readStored(
    displayStorageKeys.motion,
    motions,
    prefersReducedMotion() ? 'paused' : 'playing',
  );
}

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
  const storedTheme = useStoredThemePreference(siteThemeStorage);
  const hydrated = useHydrated();
  const shown = hydrated
    ? { contrast, scale, motion }
    : ({ contrast: 'system', scale: 'system', motion: 'playing' } as const);
  const value = useMemo<DisplaySettingsValue>(
    () => ({
      contrast: shown.contrast,
      scale: shown.scale,
      motionPaused: shown.motion === 'paused',
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
    [shown.contrast, shown.scale, shown.motion],
  );
  return (
    <DisplaySettingsContext value={value}>
      <ThemePreferenceProvider
        theme={{ contrast: shown.contrast, scale: shown.scale }}
        {...storedTheme}
        className={className}
      >
        {children}
      </ThemePreferenceProvider>
    </DisplaySettingsContext>
  );
}

function switchColors(change: () => void) {
  if (typeof document.startViewTransition !== 'function' || prefersReducedMotion()) return change();
  document.startViewTransition(() => flushSync(change));
}

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
          <Tooltip content="Display">
            <IconButton variant="ghost" icon={<IconTune />} aria-label="Display" />
          </Tooltip>
        ) : (
          <Button variant="ghost" start={<IconTune />}>
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
