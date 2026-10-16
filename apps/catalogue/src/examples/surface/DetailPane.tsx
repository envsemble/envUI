import { useId } from 'react';
import { Stack, Surface, Text } from '@envsemble/envui';

export default function DetailPane() {
  const heading = useId();
  return (
    <Surface padding={5} render={<Stack as="section" gap={3} aria-labelledby={heading} />}>
      <Text as="h3" variant="section-heading" id={heading}>
        Northwind launch
      </Text>
      <Text>Shared plans, notes and decisions for the spring launch.</Text>
      <Text variant="supporting">Updated by Priya Shah</Text>
    </Surface>
  );
}
