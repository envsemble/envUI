import { Disclosure, Text } from '@envsemble/envui';

export default function DisclosureAnatomy() {
  return (
    <Disclosure title="How visibility works" defaultOpen>
      <Text>Private projects are visible only to the people invited to them.</Text>
    </Disclosure>
  );
}
