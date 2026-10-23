import { List } from '@envsemble/envui';
import { ColorSwatch } from '@envsemble/envui/color';

const labels = [
  { name: 'Design', color: '#6b4fa3' },
  { name: 'Research', color: '#2f6f62' },
  { name: 'Archive', color: '#ffffff' },
];

export default function Swatches() {
  return (
    <List.Root aria-label="Labels">
      {labels.map(({ name, color }) => (
        <List.Item key={name} label={<ColorSwatch color={color} label={name} format="hex" />} />
      ))}
    </List.Root>
  );
}
