import { Select, Column } from '@envsemble/envui';

const sortOptions = [
  { value: 'recent', label: 'Most recent' },
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'Size' },
];

export default function TriggerStyles() {
  return (
    <Column gap={4} style={{ inlineSize: 'min(100%, 20rem)' }}>
      {/* Outline, the default, as every field is. */}
      <Select label="Sort files" items={sortOptions} defaultValue="recent" />
      {/* Floating, roomier, for a long form on a page. */}
      <Select variant="floating" label="Sort members" items={sortOptions} defaultValue="name" />
    </Column>
  );
}
