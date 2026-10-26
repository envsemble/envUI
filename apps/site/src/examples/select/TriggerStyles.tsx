import { Select, Surface, Row } from '@envsemble/envui';

const sortOptions = [
  { value: 'recent', label: 'Most recent' },
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'Size' },
];

export default function TriggerStyles() {
  return (
    <Row wrap align="center" gap={4}>
      {/* Secondary, the filled pill, on the page. */}
      <Select label="Sort files" items={sortOptions} defaultValue="recent" />
      {/* Outlined on a pane, where a fill would blend with the surface. */}
      <Surface padding={4}>
        <Select variant="outline" label="Sort members" items={sortOptions} defaultValue="name" />
      </Surface>
    </Row>
  );
}
