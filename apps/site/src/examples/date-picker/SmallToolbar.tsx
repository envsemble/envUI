import { Button, DatePicker, Surface, Row } from '@envsemble/envui';

export default function SmallToolbar() {
  return (
    <Surface
      background="default"
      padding={1}
      radius="full"
      role="group"
      aria-label="Schedule toolbar"
      render={<Row wrap align="center" gap={4} />}
    >
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
    </Surface>
  );
}
