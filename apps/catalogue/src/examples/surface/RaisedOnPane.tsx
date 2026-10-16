import { Stack, Surface, Text } from '@envsemble/envui';

export default function RaisedOnPane() {
  return (
    <Surface padding={5} render={<Stack gap={4} />}>
      <Text as="h3" variant="section-heading">
        Billing
      </Text>
      <Surface tone="alternate" corners="standard" padding={4} render={<Stack gap={1} />}>
        <Text variant="supporting">Next invoice</Text>
        <Text>€240.00 on 1 April</Text>
      </Surface>
      <Text variant="supporting">Invoices go to billing@example.com.</Text>
    </Surface>
  );
}
