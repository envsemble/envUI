import { Column, Disclosure, Text } from '@envsemble/envui';

export default function VagueSummary() {
  return (
    <Column gap={3}>
      <Disclosure title="More">
        <Text>Each seat is billed monthly, from the day you invite someone.</Text>
      </Disclosure>
      <Disclosure title="Show details">
        <Text>Custom domain, data region and export format.</Text>
      </Disclosure>
    </Column>
  );
}
