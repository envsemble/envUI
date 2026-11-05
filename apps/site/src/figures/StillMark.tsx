import { Text } from '@envsemble/envui';

/**
 * The quiet line under a figure that is a still picture of a component, such as one shown open or
 * a table of its states, which looks like the component but doesn't take input: it tells the
 * picture from a live example, which needs no mark.
 */
export function StillMark() {
  return (
    <Text variant="caption" emphasis="muted" className="site-still-mark">
      Still picture, not live
    </Text>
  );
}
