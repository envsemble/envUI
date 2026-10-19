import { Stack, Surface, Text } from '@envsemble/envui';

export default function RaisedOnPane() {
  return (
    <Surface padding={5} render={<Stack gap={4} />}>
      <Text render={<h3 />} variant="title">
        Billing
      </Text>
      <Surface background="raised" radius="sm" padding={4} render={<Stack gap={1} />}>
        <Text variant="body-sm">Next invoice</Text>
        <Text>€240.00 on 1 April</Text>
      </Surface>
      <Text variant="body-sm">Invoices go to billing@example.com.</Text>
    </Surface>
  );
}
