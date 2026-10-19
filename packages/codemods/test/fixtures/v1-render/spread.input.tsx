import { Text } from '@envsemble/envui';

export function Title({ heading }) {
  return (
    <Text {...heading} as="h2">
      Projects
    </Text>
  );
}
