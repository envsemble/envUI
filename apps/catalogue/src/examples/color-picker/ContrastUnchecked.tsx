import { ColorPicker } from '@envsemble/envui';

export default function ContrastUnchecked() {
  return (
    <ColorPicker
      label="Label color"
      defaultValue="#e8c547"
      style={{ inlineSize: 'min(100%, 18rem)' }}
    />
  );
}
