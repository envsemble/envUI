import { Kbd, Text } from '@envsemble/envui';

/** A few of an application's shortcuts, each named beside its keys. */
const shortcuts = [
  { label: 'Search', keys: ['Ctrl', 'K'] },
  { label: 'Save', keys: ['Ctrl', 'S'] },
  { label: 'New file', keys: ['Ctrl', 'N'] },
];

/**
 * A short list of shortcuts: what each does, and its keys. It stays still while it plays: a key has
 * no pressed or other state of its own to show.
 */
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
