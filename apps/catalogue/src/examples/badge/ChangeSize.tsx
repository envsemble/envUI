import { DiffStat, List } from '@envsemble/envui';

const files = [
  { name: 'pricing.md', additions: 124, deletions: 37 },
  { name: 'faq.md', additions: 8, deletions: 0 },
  { name: 'changelog.md', additions: 1, deletions: 1 },
];

export default function ChangeSize() {
  return (
    <List.Root aria-label="Changed files">
      {files.map(({ name, additions, deletions }) => (
        <List.Item
          key={name}
          title={name}
          action={<DiffStat additions={additions} deletions={deletions} />}
        />
      ))}
    </List.Root>
  );
}
