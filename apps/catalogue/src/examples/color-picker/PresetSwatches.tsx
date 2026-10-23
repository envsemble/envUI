import { ColorPicker } from '@envsemble/envui/color';

const brand = [
  { color: '#3b6fd4', label: 'Blue' },
  { color: '#2f6f62', label: 'Teal' },
  { color: '#6b4fa3', label: 'Violet' },
  { color: '#c2413b', label: 'Red' },
  { color: '#d98a1f', label: 'Amber' },
  { color: '#5c6370', label: 'Slate' },
];

export default function PresetSwatches() {
  return (
    <div style={{ inlineSize: 'min(100%, 16rem)' }}>
      <ColorPicker label="Project color" defaultValue="#6b4fa3" swatches={brand} />
    </div>
  );
}
