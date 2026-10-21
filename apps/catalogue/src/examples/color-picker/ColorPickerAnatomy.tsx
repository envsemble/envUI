import { ColorPicker } from '@envsemble/envui';

export default function ColorPickerAnatomy() {
  return (
    <ColorPicker
      label="Accent color"
      defaultValue="#3b6fd4"
      style={{ inlineSize: 'min(100%, 20rem)' }}
    />
  );
}
