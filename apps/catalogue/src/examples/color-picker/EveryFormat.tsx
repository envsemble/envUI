import { ColorPicker } from '@envsemble/envui/color';

export default function EveryFormat() {
  return (
    <div style={{ inlineSize: 'min(100%, 18rem)' }}>
      <ColorPicker
        label="Highlight color"
        alpha
        defaultValue="rgba(107, 79, 163, 0.6)"
        valueFormat="rgb"
      />
    </div>
  );
}
