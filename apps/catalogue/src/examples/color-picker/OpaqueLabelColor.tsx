import { ColorPicker } from '@envsemble/envui/color';

export default function OpaqueLabelColor() {
  // Labels are stored as #rrggbb: the picker offers what the value can hold.
  return (
    <div style={{ inlineSize: 'min(100%, 16rem)' }}>
      <ColorPicker label="Label color" defaultValue="#2f6f62" formats={['hex']} />
    </div>
  );
}
