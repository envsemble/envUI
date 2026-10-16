import { Button, DatePicker, Surface, Stack } from '@envsemble/envui';

export default function SmallToolbar() {
  return (
    <Surface
      background="default"
      padding={1}
      radius="full"
      role="group"
      aria-label="Schedule toolbar"
      render={<Stack direction="row" wrap align="center" gap={4} />}
    >
      <DatePicker
        size="sm"
        showLabel={false}
        aria-label="Due"
        placeholder="Due"
        withTime
        clearable
      />
      <Button variant="outline" size="sm">
        Schedule
      </Button>
    </Surface>
  );
}
