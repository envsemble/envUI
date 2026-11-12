import { Column, Text } from '@envsemble/envui';

export default function Measure() {
  return (
    // Text fills its container, so the column stops its lines at a readable length.
    <Column gap={2} style={{ maxInlineSize: '53ch' }}>
      <Text render={<h3 />} variant="title">
        Hollow Wood
      </Text>
      <Text>
        The path leaves the car park by the old mill and climbs gently through beech and oak. After
        the first kilometre it follows the stream to a wooden bridge, where most walkers stop for
        tea before the steeper stretch up to the ridge.
      </Text>
    </Column>
  );
}
