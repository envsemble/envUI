import { useId } from 'react';
import { Stack, Surface, Text } from '@envsemble/envui';

export default function DetailPane() {
  const heading = useId();
  return (
    <Surface padding={5} render={<Stack render={<section />} gap={3} aria-labelledby={heading} />}>
      <Text render={<h3 />} variant="title" id={heading}>
        Northwind launch
      </Text>
      <Text>Shared plans, notes and decisions for the spring launch.</Text>
      <Text variant="body-sm">Updated by Priya Shah</Text>
    </Surface>
  );
}
