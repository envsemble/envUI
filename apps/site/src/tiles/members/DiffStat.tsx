import { DiffStat, List } from '@envsemble/envui';

const files = [
  { name: 'pricing.md', additions: 124, deletions: 37 },
  { name: 'faq.md', additions: 8, deletions: 0 },
  { name: 'notes.md', additions: 1, deletions: 1 },
];

/**
 * Changed files, each with the size of its change. A count shows what it is given, so it holds
 * still.
 */
export default function DiffStatTile() {
  return (
    <List.Root aria-label="Changed files" density="sm" style={{ inlineSize: '11rem' }}>
      {files.map(({ name, additions, deletions }) => (
        <List.Item
          key={name}
          label={name}
          end={<DiffStat additions={additions} deletions={deletions} />}
        />
      ))}
    </List.Root>
  );
}
