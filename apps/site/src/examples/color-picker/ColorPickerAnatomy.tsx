import { ColorPicker } from '@envsemble/envui/color';

export default function ColorPickerAnatomy() {
  return (
    <ColorPicker
      label="Accent color"
      defaultValue="#3b6fd4"
      alpha
      swatches={['#3b6fd4', '#2f6f62', '#c2413b']}
      style={{ inlineSize: 'min(100%, 18rem)' }}
    />
  );
}
