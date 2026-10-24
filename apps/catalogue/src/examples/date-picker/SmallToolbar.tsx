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
      {/* A field's width is a share of its container, which a toolbar that takes the width of its
          content doesn't have: the toolbar gives it one, so the field and the button share a row. */}
      <DatePicker
        style={{ inlineSize: '12rem' }}
        size="sm"
        showLabel={false}
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
