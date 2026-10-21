import { ColorPicker } from '@envsemble/envui';

export default function ContrastChecked() {
  return (
    <ColorPicker
      label="Label color"
      defaultValue="#e8c547"
      error="Too light for text on white; choose a darker color."
      style={{ inlineSize: 'min(100%, 18rem)' }}
    />
  );
}
