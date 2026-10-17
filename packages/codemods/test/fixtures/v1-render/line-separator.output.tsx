import { Text } from '@envsemble/envui';

/* A line separator, which the parser counts as a line break and an editor doesn't. */

export function Note() {
  return (
    <Text render={<p />} variant="caption">
      Saved
    </Text>
  );
}
