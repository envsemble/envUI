import { ThemePreferenceProvider, ThemeToggle } from '@envsemble/envui';

export const mount = 'root';

export default function ThemeContrastNestedFixture() {
  return (
    <ThemePreferenceProvider
      theme={{ storageKey: 'fixture-outer-theme', contrast: 'high', scale: 'compact' }}
    >
      <ThemePreferenceProvider
        theme={{ storageKey: 'fixture-inner-theme', contrast: 'system' }}
        className="fixture-main"
      >
        <ThemeToggle data-testid="inner-theme-toggle" />
      </ThemePreferenceProvider>
    </ThemePreferenceProvider>
  );
}
