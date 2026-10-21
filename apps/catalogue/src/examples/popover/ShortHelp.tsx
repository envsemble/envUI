import { IconButton, Popover, Row, Text } from '@envsemble/envui';
import { Help } from '@envsemble/envui/icons/Help';

export default function ShortHelp() {
  return (
    <Row align="center" gap={2}>
      <Text render={<span />}>Billing period: monthly</Text>
      <Popover
        title="Billing periods"
        trigger={<IconButton variant="text" icon={<Help />} aria-label="About billing periods" />}
      >
        <Text>Members added during a period are billed from the next one.</Text>
      </Popover>
    </Row>
  );
}
