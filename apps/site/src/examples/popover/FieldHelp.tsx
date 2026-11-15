import { IconButton, Popover, Text, Row } from '@envsemble/envui';
import { IconHelp } from '@envsemble/envui/icons/Help';

export default function FieldHelp() {
  return (
    <Row wrap align="center" gap={4}>
      <Text render={<span />}>Billing period: monthly</Text>
      <Popover
        defaultOpen
        title="Billing periods"
        side="bottom"
        align="end"
        trigger={
          <IconButton variant="text" icon={<IconHelp />} aria-label="About billing periods" />
        }
      >
        <Text>
          Northwind is billed on the first day of each period for the members it has that day.
          Members added later are billed from the next period.
        </Text>
      </Popover>
    </Row>
  );
}
