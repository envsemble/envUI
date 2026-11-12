import { RelativeTime, Theme, Tooltip, type ColorScheme } from '@envsemble/envui';

export const themes = true;

/**
 * Times with their date and time in a tooltip, in English and German, one without a tooltip and one
 * inside the application's own Tooltip. Their words and clock are tests/library/source/RelativeTime.test.ts's.
 */
export default function RelativeTimeFixture({ theme }: { theme: ColorScheme }) {
  return (
    <Theme theme={theme} data-testid={`relative-times-${theme}`} className="fixture-section">
      <RelativeTime
        data-testid="fixed"
        value="2026-10-16T12:00:00Z"
        now={Date.parse('2026-10-14T12:00:00Z')}
      />
      <RelativeTime
        data-testid="fixed-german"
        locale="de"
        value="2026-10-16T12:00:00Z"
        now={new Date('2026-10-14T12:00:00Z')}
      />
      <RelativeTime
        data-testid="no-tooltip"
        tooltip={false}
        value="2026-10-14T09:00:00Z"
        now={Date.parse('2026-10-14T12:00:00Z')}
      />
      {/* Inside the application's own Tooltip, that one describes the time. */}
      <Tooltip content={`Updated by Alex Morgan ${theme}`}>
        <RelativeTime
          data-testid="in-tooltip"
          value="2026-10-14T09:00:00Z"
          now={Date.parse('2026-10-14T12:00:00Z')}
        />
      </Tooltip>
    </Theme>
  );
}
