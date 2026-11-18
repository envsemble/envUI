import { Button, DatePicker, Row } from '@envsemble/envui';

export default function SmallToolbar() {
  return (
    <Row wrap align="center" gap={4} role="group" aria-label="Schedule toolbar">
      <DatePicker
        size="sm"
        visibleLabel={false}
        aria-label="Due"
        placeholder="Due"
        granularity="minute"
        clearable
      />
      <Button variant="outline" size="sm">
        Schedule
      </Button>
    </Row>
  );
}
