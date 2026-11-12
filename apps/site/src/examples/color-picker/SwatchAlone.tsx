import { IconButton, Popover } from '@envsemble/envui';
import { ColorPicker, ColorSwatch } from '@envsemble/envui/color';

export default function SwatchAlone() {
  return (
    <Popover
      aria-label="Label color"
      trigger={<IconButton icon={<ColorSwatch color="#2f6f62" />} aria-label="Label color" />}
    >
      <ColorPicker label="Label color" visibleLabel={false} defaultValue="#2f6f62" />
    </Popover>
  );
}
