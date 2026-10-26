import { ColorPicker } from '@envsemble/envui/color';

export default function FormatsTogether() {
  return (
    <div style={{ inlineSize: 'min(100%, 18rem)' }}>
      <ColorPicker label="Brand color" defaultValue="#6b4fa3" formats={['hex', 'rgb', 'hsl']} />
    </div>
  );
}
