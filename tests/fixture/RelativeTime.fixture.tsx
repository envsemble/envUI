import { RelativeTime, Theme, Tooltip, type ColorScheme } from '@envsemble/envui';

export const themes = true;

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
      <RelativeTime
        data-testid="own-tooltip"
        value="2026-10-14T09:00:00Z"
        now={Date.parse('2026-10-14T12:00:00Z')}
        renderTooltip={(date) => <strong>{`${date.toISOString().slice(11, 16)} UTC`}</strong>}
      />
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
