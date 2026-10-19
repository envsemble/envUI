import { Text } from '@envsemble/envui';

export function Title({ heading }) {
  return (
    <Text {...heading} render={<h2 />}>
      Projects
    </Text>
  );
}
