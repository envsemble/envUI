import { Column, IconButton, Popover, Row, Text } from '@envsemble/envui';
import { Help } from '@envsemble/envui/icons/Help';

export default function LongHelp() {
  return (
    // Paragraphs of help in a popover: too much to read beside the page; link to a help page.
    <Row align="center" gap={2}>
      <Text render={<span />}>Billing period: monthly</Text>
      <Popover
        title="Billing periods"
        trigger={<IconButton variant="text" icon={<Help />} aria-label="About billing periods" />}
      >
        <Column gap={3}>
          <Text>Northwind is billed on the first day of each period for its members that day.</Text>
          <Text>
            Members added during a period are billed from the next one, and members removed during a
            period stay billed until it ends.
          </Text>
          <Text>
            A yearly period is billed once a year, at a lower price per member, and members added
            during the year are billed for the months that are left.
          </Text>
          <Text>Invoices go to the billing address, and receipts to every owner.</Text>
        </Column>
      </Popover>
    </Row>
  );
}
