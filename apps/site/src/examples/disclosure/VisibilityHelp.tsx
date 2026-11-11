import { Disclosure, Text } from '@envsemble/envui';

export default function VisibilityHelp() {
  return (
    <Disclosure title="How visibility works" style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Text>
        Team projects are open to every workspace member. Private projects are visible only to the
        people invited to them.
      </Text>
    </Disclosure>
  );
}
