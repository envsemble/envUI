import { Column, Surface, Text } from '@envsemble/envui';

export default function Hierarchy() {
  return (
    <Surface background="default" padding={6} radius="xl" render={<Column gap={5} />}>
      <Column gap={2}>
        <Text render={<h3 />} variant="headline">
          Billing
        </Text>
        <Text>Your plan renews on the first of July for the whole team.</Text>
        <Text emphasis="muted">
          The owner of the workspace gets a receipt after each payment, and can change the card or
          the plan at any time.
        </Text>
      </Column>
      <Column gap={1}>
        <Text render={<h4 />} variant="title">
          Payment method
        </Text>
        <Text variant="body-sm">The card we charge each month</Text>
      </Column>
    </Surface>
  );
}
