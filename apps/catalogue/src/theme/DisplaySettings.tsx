import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Button,
  IconButton,
  Menu,
  ThemePreferenceProvider,
  ThemeRadioGroup,
  Tooltip,
  type ThemeContrast,
  type ThemeScale,
} from '@envsemble/envui';
import { Tune } from '@envsemble/envui/icons/Tune';
import { displayStorageKeys } from './DisplayStorage';

const contrasts: readonly ThemeContrast[] = ['system', 'standard', 'high'];
const scales: readonly ThemeScale[] = ['comfortable', 'compact'];

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
 * The scale the address asks for with ?scale=compact or ?scale=comfortable, to review a page at
 * that scale without changing the stored setting.
 */
function requestedScale(): ThemeScale | undefined {
  if (typeof location === 'undefined') return undefined;
  const requested = new URLSearchParams(location.search).get('scale');
  return scales.find((scale) => scale === requested);
}

interface DisplaySettingsValue {
  contrast: ThemeContrast;
  scale: ThemeScale;
  setContrast: (contrast: ThemeContrast) => void;
  setScale: (scale: ThemeScale) => void;
}

const DisplaySettingsContext = createContext<DisplaySettingsValue | null>(null);

/**
 * The catalogue's theme, contrast and scale, as the reader chose them in the Display menu: stored in
 * localStorage, the theme by ThemePreferenceProvider and the others here, and kept in step with the
 * catalogue's other windows. The theme follows the system until the reader picks one, and the
 * contrast follows `prefers-contrast` until then.
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
    () => requestedScale() ?? readStored(displayStorageKeys.scale, scales, 'comfortable'),
  );
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === displayStorageKeys.contrast)
        setContrastState(readStored(displayStorageKeys.contrast, contrasts, 'system'));
      if (event.key === displayStorageKeys.scale)
        setScaleState(readStored(displayStorageKeys.scale, scales, 'comfortable'));
    };
    addEventListener('storage', onStorage);
    return () => removeEventListener('storage', onStorage);
  }, []);
  const value = useMemo<DisplaySettingsValue>(
    () => ({
      contrast,
      scale,
      setContrast(next) {
        setContrastState(next);
        store(displayStorageKeys.contrast, next);
      },
      setScale(next) {
        setScaleState(next);
        store(displayStorageKeys.scale, next);
      },
    }),
    [contrast, scale],
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
 * The Display menu: the theme, the contrast and the scale, each stored as it is chosen. iconOnly
 * shows its trigger as an icon, such as in a phone's top bar. It opens below its trigger, at the
 * top of the page.
 */
export function DisplayMenu({ iconOnly = false }: { iconOnly?: boolean }) {
  const { contrast, setContrast, scale, setScale } = useDisplaySettings();
  return (
    <Menu.Root
      aria-label="Display"
      side="bottom"
      align="end"
      trigger={
        iconOnly ? (
          // The Tooltip passes the menu button's props and ref on to the IconButton.
          <Tooltip content="Display">
            <IconButton variant="ghost" icon={<Tune />} aria-label="Display" />
          </Tooltip>
        ) : (
          <Button variant="ghost" startIcon={<Tune />}>
            Display
          </Button>
        )
      }
    >
      <ThemeRadioGroup label="Theme" />
      <Menu.Separator />
      <Menu.RadioGroup
        label="Contrast"
        value={contrast}
        onValueChange={(next) => setContrast(contrasts.find((value) => value === next)!)}
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
        <Menu.RadioItem value="comfortable" closeOnClick={false}>
          Comfortable
        </Menu.RadioItem>
        <Menu.RadioItem value="compact" closeOnClick={false}>
          Compact
        </Menu.RadioItem>
      </Menu.RadioGroup>
    </Menu.Root>
  );
}
