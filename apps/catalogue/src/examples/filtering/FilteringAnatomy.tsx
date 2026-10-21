import {
  Button,
  Column,
  CounterBadge,
  PageHeader,
  Row,
  SearchField,
  Select,
  Text,
} from '@envsemble/envui';
import { FilterList } from '@envsemble/envui/icons/FilterList';

const statuses = [
  { value: 'any', label: 'Any status' },
  { value: 'active', label: 'Active' },
];

export default function FilteringAnatomy() {
  return (
    <Column gap={4} style={{ inlineSize: 'min(100%, 34rem)' }}>
      <PageHeader
        headingLevel={3}
        title="Projects"
        controlSize="sm"
        toolbar={
          <Row wrap align="center" gap={3}>
            <SearchField label="Search projects" size="sm" defaultValue="web" />
            <Select
              aria-label="Status"
              size="sm"
              variant="outline"
              items={statuses}
              defaultValue="active"
            />
            <Button variant="secondary" size="sm" startIcon={<FilterList />}>
              Filters <CounterBadge value={2} aria-label="2 in use" />
            </Button>
          </Row>
        }
      />
      <Text role="status" variant="body-sm" emphasis="muted">
        2 projects of 6
      </Text>
    </Column>
  );
}
