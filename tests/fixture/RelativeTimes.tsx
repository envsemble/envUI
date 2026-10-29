import { useState } from 'react';
import {
  Button,
  EnvUIProvider,
  IconButton,
  RelativeTime,
  Surface,
  Theme,
  Tooltip,
  formatRelativeTime,
  type ColorScheme,
} from '@envsemble/envui';
import { Settings } from '@envsemble/envui/icons/Settings';

const second = 1_000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;

export function RelativeTimesFixture({ theme }: { theme: ColorScheme }) {
  // Moments relative to when the fixture opens, so they read the same in every run.
  const [openedAt] = useState(() => Date.now());
  const [savedAt, setSavedAt] = useState(() => openedAt - 2 * hour);
  return (
    <Theme theme={theme} data-testid={`relative-times-${theme}`} className="fixture-section">
      <p>
        Saved <RelativeTime data-testid="seconds-ago" value={openedAt - 30 * second} />
      </p>
      <RelativeTime data-testid="seconds-ahead" value={openedAt + 20 * second} />
      <RelativeTime data-testid="minutes-ago" value={openedAt - 90 * second} />
      <RelativeTime data-testid="hours-ago" value={openedAt - 3 * hour} />
      <RelativeTime data-testid="days-ahead" value={openedAt + 2 * day} />
      <RelativeTime data-testid="weeks-ago" value={new Date(openedAt - 15 * day)} />
      <RelativeTime data-testid="from-string" value={new Date(openedAt + 5 * day).toISOString()} />
      <RelativeTime data-testid="short" format="short" value={openedAt - 3 * hour} />
      <RelativeTime data-testid="narrow" format="narrow" value={openedAt + 2 * day} />
      <RelativeTime data-testid="german" locale="de" value={openedAt - 3 * hour} />
      <RelativeTime data-testid="german-now" locale="de" value={openedAt - 5 * second} />
      <RelativeTime
        data-testid="labelled-now"
        nowLabel="moments ago"
        value={openedAt - 5 * second}
      />
      {/* The provider's locale and now message, which a time's own props would override. */}
      <EnvUIProvider locale="de" messages={{ relativeTime: { now: 'gerade eben' } }}>
        <RelativeTime data-testid="provider-german" value={openedAt - 3 * hour} />
        <RelativeTime data-testid="provider-now" value={openedAt - 5 * second} />
        <RelativeTime data-testid="provider-own" locale="en" value={openedAt - 3 * hour} />
      </EnvUIProvider>
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
      <RelativeTime data-testid="no-tooltip" tooltip={false} value={openedAt - 3 * hour} />
      <span data-testid="invalid">
        <RelativeTime value="not a date" />
      </span>
      {/* An invalid now, such as from missing data, leaves the text to the clock. */}
      <RelativeTime data-testid="invalid-now" value={openedAt - 3 * hour} now={Number.NaN} />
      {/* Inside the application's own Tooltip, that one describes the time. */}
      <Tooltip content={`Updated by Alex Morgan ${theme}`}>
        <RelativeTime data-testid="in-tooltip" value={openedAt - 3 * hour} />
      </Tooltip>
      <output data-testid="formatted">
        {formatRelativeTime(openedAt + 3 * hour, { now: openedAt, format: 'short' })}
      </output>
      <p>
        Draft saved <RelativeTime data-testid="saved" value={savedAt} />
      </p>
      <Button variant="secondary" onClick={() => setSavedAt(Date.now())}>
        Save draft {theme}
      </Button>
      {/* A small toolbar: the time sits on the center line of 2 rem controls. */}
      <Surface
        background="muted"
        padding={2}
        radius="sm"
        className="fixture-toolbar"
        data-testid="toolbar"
      >
        <span className="fixture-shrink-label">Quarterly report</span>
        <RelativeTime data-testid="toolbar-time" format="narrow" value={openedAt - 3 * hour} />
        <IconButton size="sm" icon={<Settings />} aria-label="Report settings" />
      </Surface>
      <p className="fixture-narrow-time" data-testid="narrow-frame">
        Updated <RelativeTime data-testid="narrow-time" value={openedAt - 3 * hour} />
      </p>
      <p dir="rtl" lang="ar">
        تم التحديث <RelativeTime data-testid="rtl" locale="en" value={openedAt - 3 * hour} />
      </p>
    </Theme>
  );
}
