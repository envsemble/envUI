import { ColorSwatch, List } from '@envsemble/envui';

const labels = [
  { name: 'Design', color: '#6b4fa3' },
  { name: 'Research', color: '#2f6f62' },
  { name: 'Archive', color: '#ffffff' },
];

/** The swatch before the name, centred on its line. */
const label = { display: 'flex', alignItems: 'center', gap: '0.5rem' } as const;

export default function Swatches() {
  return (
    <List.Root aria-label="Labels">
      {labels.map(({ name, color }) => (
        <List.Item
          key={name}
          title={
            <span style={label}>
              <ColorSwatch color={color} />
              {name}
            </span>
          }
          detail={color.toUpperCase()}
        />
      ))}
    </List.Root>
  );
}
