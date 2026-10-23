import { ColorPicker } from '@envsemble/envui/color';

export default function TranslucentLabelColor() {
  // Labels are stored as #rrggbb, but this picker offers alpha and every format.
  return (
    <div style={{ inlineSize: 'min(100%, 16rem)' }}>
      <ColorPicker
        label="Label color"
        defaultValue="#2f6f62"
        formats={['hsl', 'rgb', 'hex']}
        alpha
      />
    </div>
  );
}
