import { Button, Column, Row, SearchField, Select } from '@envsemble/envui';

const statuses = [
  { value: 'any', label: 'Any status' },
  { value: 'active', label: 'Active' },
];

export default function WaitsForApply() {
  return (
    // Nothing changes until Apply, and nothing says how many will match.
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
        <Button variant="primary" size="sm">
          Apply
        </Button>
      </Row>
    </Column>
  );
}
