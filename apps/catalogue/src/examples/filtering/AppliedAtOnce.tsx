import { Column, Row, SearchField, Select, Text } from '@envsemble/envui';

const statuses = [
  { value: 'any', label: 'Any status' },
  { value: 'active', label: 'Active' },
];

export default function AppliedAtOnce() {
  return (
    // Each choice filters at once, and the count says what is left.
    <Column gap={3} style={{ inlineSize: 'min(100%, 22rem)' }}>
      <Row wrap align="center" gap={3}>
        <SearchField label="Search projects" size="sm" defaultValue="web" />
        <Select
          aria-label="Status"
          size="sm"
          variant="outline"
          items={statuses}
          defaultValue="active"
        />
      </Row>
      <Text role="status" variant="body-sm" emphasis="muted">
        2 projects of 6
      </Text>
    </Column>
  );
}
