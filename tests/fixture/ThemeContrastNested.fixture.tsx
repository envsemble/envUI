import { ThemePreferenceProvider, ThemeToggle } from '@envsemble/envui';

export const mount = 'root';

export default function ThemeContrastNestedFixture() {
  return (
    <ThemePreferenceProvider theme={{ contrast: 'high', scale: 'compact' }}>
      <ThemePreferenceProvider theme={{ contrast: 'system' }} className="fixture-main">
        <ThemeToggle data-testid="inner-theme-toggle" />
      </ThemePreferenceProvider>
    </ThemePreferenceProvider>
  );
}
