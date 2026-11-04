import { IconButton, Link, Popover, Column, Row, Text, Tooltip } from '@envsemble/envui';
import { IconHelp } from '@envsemble/envui/icons/Help';

export default function ExplainATerm() {
  return (
    <Column gap={1}>
      <Row align="center" gap={1}>
        <Text variant="body-sm" emphasis="muted">
          Billable hours this week
        </Text>
        {/* An explanation people open on purpose, which may hold a link: a Popover. */}
        <Popover
          title="Billable hours"
          side="bottom"
          align="start"
          trigger={
            // The Tooltip names the icon-only trigger and passes the popover's props on to it.
            <Tooltip content="About billable hours">
              <IconButton
                variant="text"
                size="sm"
                icon={<IconHelp />}
                aria-label="About billable hours"
              />
            </Tooltip>
          }
        >
          <Text>
            Time logged on tasks of projects that bill a client. Internal projects and time off
            don’t count.
          </Text>
          <Link href="/help/time-tracking">How time tracking works</Link>
        </Popover>
      </Row>
      <Text variant="headline">32&nbsp;h</Text>
    </Column>
  );
}
