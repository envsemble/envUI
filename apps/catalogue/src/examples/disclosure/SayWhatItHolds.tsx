import { Column, Disclosure, Text } from '@envsemble/envui';

export default function SayWhatItHolds() {
  return (
    <Column gap={3}>
      <Disclosure title="How billing works">
        <Text>Each seat is billed monthly, from the day you invite someone.</Text>
      </Disclosure>
      <Disclosure title="Advanced settings">
        <Text>Custom domain, data region and export format.</Text>
      </Disclosure>
    </Column>
  );
}
