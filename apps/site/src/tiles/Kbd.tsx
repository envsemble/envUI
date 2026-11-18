import { Kbd, Text } from '@envsemble/envui';

const shortcuts = [
  { label: 'Search', keys: ['Ctrl', 'K'] },
  { label: 'Save', keys: ['Ctrl', 'S'] },
  { label: 'New file', keys: ['Ctrl', 'N'] },
];

export default function KbdTile() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto auto',
        alignItems: 'center',
        columnGap: 'var(--env-space-6)',
        rowGap: 'var(--env-space-3)',
      }}
    >
      {shortcuts.map(({ label, keys }) => (
        <div key={label} style={{ display: 'contents' }}>
          <Text emphasis="muted">{label}</Text>
          <Kbd keys={keys} style={{ justifySelf: 'end' }} />
        </div>
      ))}
    </div>
  );
}
