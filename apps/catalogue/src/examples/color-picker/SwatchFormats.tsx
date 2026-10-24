import { Column } from '@envsemble/envui';
import { ColorSwatch } from '@envsemble/envui/color';

export default function SwatchFormats() {
  return (
    <Column gap={2}>
      <ColorSwatch color="#3b6fd4" format="hex" />
      <ColorSwatch color="#3b6fd4" format="rgb" />
      <ColorSwatch color="#3b6fd480" format="hsl" />
      <ColorSwatch color="#3b6fd4" format="hex" size="sm" />
    </Column>
  );
}
