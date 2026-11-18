import { IconButton, Popover, Text } from '@envsemble/envui';
import { IconHelp } from '@envsemble/envui/icons/Help';

export default function PopoverAnatomy() {
  return (
    <Popover
      defaultOpen
      title="Billing periods"
      trigger={<IconButton variant="text" icon={<IconHelp />} aria-label="About billing periods" />}
    >
      <Text>Members added during a period are billed from the next one.</Text>
    </Popover>
  );
}
