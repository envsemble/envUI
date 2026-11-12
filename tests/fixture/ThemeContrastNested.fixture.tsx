import { ThemePreferenceProvider, ThemeToggle } from '@envsemble/envui';

export const mount = 'root';

/**
 * Two providers that both apply to the document, against the advice to let one: an outer one at
 * high contrast and the compact scale, and an inner one at system contrast without a scale.
 */
export default function ThemeContrastNestedFixture() {
  return (
    <ThemePreferenceProvider storageKey="fixture-outer-theme" contrast="high" scale="compact">
      <ThemePreferenceProvider
        storageKey="fixture-inner-theme"
        contrast="system"
        className="fixture-main"
      >
        <ThemeToggle data-testid="inner-theme-toggle" />
      </ThemePreferenceProvider>
    </ThemePreferenceProvider>
  );
}
