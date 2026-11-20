import type {
  ThemeContrast,
  ThemeCorners,
  ThemePreference,
  ThemeScale,
  ThemeSelection,
} from '@envsemble/envui';
import type {
  themeContrasts,
  themeCorners,
  themePreferences,
  themeScales,
  themeSelections,
} from '../../packages/ui/src/internal/theme/themeRoot.js';

type Same<First, Second> = [First] extends [Second]
  ? [Second] extends [First]
    ? true
    : false
  : false;

export const everyThemeSettingListsEachOfItsValues: [
  Same<ThemeContrast, (typeof themeContrasts)[number]>,
  Same<ThemeScale, (typeof themeScales)[number]>,
  Same<ThemeSelection, (typeof themeSelections)[number]>,
  Same<ThemeCorners, (typeof themeCorners)[number]>,
  Same<ThemePreference, (typeof themePreferences)[number]>,
] = [true, true, true, true, true];
