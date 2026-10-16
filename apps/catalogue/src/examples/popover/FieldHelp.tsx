import { ActionGroup, IconButton, Popover, Text } from '@envsemble/envui';
import { Help } from '@envsemble/envui/icons/Help';

export default function FieldHelp() {
  return (
    <ActionGroup>
      <Text as="span">Billing period: monthly</Text>
      <Popover
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
    </ActionGroup>
  );
}
