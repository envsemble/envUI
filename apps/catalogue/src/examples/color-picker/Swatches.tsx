import { ColorSwatch, List, Row } from '@envsemble/envui';

const labels = [
  { name: 'Design', color: '#6b4fa3' },
  { name: 'Research', color: '#2f6f62' },
  { name: 'Archive', color: '#ffffff' },
];

export default function Swatches() {
  return (
    <List.Root aria-label="Labels">
      {labels.map(({ name, color }) => (
        <List.Item
          key={name}
          label={
            // The swatch before the name, centred on its line.
            <Row render={<span />} align="center" gap={2}>
              <ColorSwatch color={color} />
              {name}
            </Row>
          }
          description={color.toUpperCase()}
        />
      ))}
    </List.Root>
  );
}
