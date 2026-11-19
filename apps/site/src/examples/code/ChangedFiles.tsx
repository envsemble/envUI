import { Badge, List, VisuallyHidden } from '@envsemble/envui';

const files = [
  { name: 'pricing.md', additions: 124, deletions: 37 },
  { name: 'faq.md', additions: 8, deletions: 0 },
  { name: 'changelog.md', additions: 1, deletions: 1 },
];

function DiffStat({ additions, deletions }: { additions: number; deletions: number }) {
  return (
    <Badge style={{ fontVariantNumeric: 'tabular-nums' }}>
      <span aria-hidden="true" style={{ color: 'var(--env-color-fg-success)' }}>
        +{additions}
      </span>{' '}
      <span aria-hidden="true" style={{ color: 'var(--env-color-fg-danger)' }}>
        −{deletions}
      </span>
      <VisuallyHidden>
        {additions} added lines and {deletions} removed lines
      </VisuallyHidden>
    </Badge>
  );
}

export default function ChangedFiles() {
  return (
    <List.Root aria-label="Changed files">
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
