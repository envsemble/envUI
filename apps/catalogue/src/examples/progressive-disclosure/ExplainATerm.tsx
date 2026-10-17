import { Button, IconButton, Link, Popover, Stack, Text, Tooltip } from '@envsemble/envui';
import { Download } from '@envsemble/envui/icons/Download';
import { Help } from '@envsemble/envui/icons/Help';

export default function ExplainATerm() {
  return (
    <Stack direction="row" wrap align="center" justify="between" gap={4}>
      <Stack gap={1}>
        <Stack direction="row" align="center" gap={1}>
          <Text variant="body-sm" emphasis="muted">
            Billable hours this week
          </Text>
          {/* An explanation people open on purpose, which may hold a link: a Popover. */}
          <Popover
            title="Billable hours"
            side="bottom"
            align="start"
            trigger={
              <IconButton
                variant="text"
                size="sm"
                icon={<Help />}
                aria-label="About billable hours"
              />
            }
          >
            <Text>
              Time logged on tasks of projects that bill a client. Internal projects and time off
              don’t count.
            </Text>
            <Link href="/help/time-tracking">How time tracking works</Link>
          </Popover>
        </Stack>
        <Text variant="headline">32&nbsp;h</Text>
      </Stack>
      {/* A Tooltip only names an icon-only control: a few words, the same as its accessible name. */}
      <Tooltip content="Download timesheet">
        <Button
          variant="secondary"
          iconOnly
          icon={<Download />}
          aria-label="Download timesheet"
          href="/timesheets/2026-03-02.csv"
        />
      </Tooltip>
    </Stack>
  );
}
