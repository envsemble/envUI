import { ActionGroup, Select, Surface } from '@envsemble/envui';

const sortOptions = [
  { value: 'recent', label: 'Most recent' },
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'Size' },
];

export default function TriggerStyles() {
  return (
    <ActionGroup>
      {/* Secondary, the filled pill, on the page. */}
      <Select label="Sort files" options={sortOptions} defaultValue="recent" />
      {/* Outlined on a pane, where a fill would blend with the surface. */}
      <Surface padding={4}>
        <Select variant="outlined" label="Sort members" options={sortOptions} defaultValue="name" />
      </Surface>
    </ActionGroup>
  );
}
