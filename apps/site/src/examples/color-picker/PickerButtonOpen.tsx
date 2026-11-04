import { ColorPickerButton } from '@envsemble/envui/color';

export default function PickerButtonOpen() {
  return (
    // Shown open, as after a press on the button.
    <ColorPickerButton label="Label color" defaultValue="#2f6f62" defaultOpen />
  );
}
