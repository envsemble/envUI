import { IconButton, Popover, Text, Row } from '@envsemble/envui';
import { Help } from '@envsemble/envui/icons/Help';

export default function FieldHelp() {
  return (
    <Row wrap align="center" gap={4}>
      <Text render={<span />}>Billing period: monthly</Text>
      <Popover
        // Shown open in the docs; without defaultOpen, it opens from its trigger.
        defaultOpen
        title="Billing periods"
        side="right"
        align="start"
        trigger={<IconButton variant="text" icon={<Help />} aria-label="About billing periods" />}
      >
        <Text>
          Northwind is billed on the first day of each period for the members it has that day.
          Members added later are billed from the next period.
        </Text>
      </Popover>
    </Row>
  );
}
