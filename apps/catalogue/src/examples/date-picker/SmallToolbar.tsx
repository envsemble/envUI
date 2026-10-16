import { ActionGroup, Button, DatePicker, Surface } from '@envsemble/envui';

export default function SmallToolbar() {
  return (
    <Surface
      tone="pane"
      padding={1}
      corners="pill"
      role="group"
      aria-label="Schedule toolbar"
      render={<ActionGroup />}
    >
      <DatePicker
        size="sm"
        showLabel={false}
        aria-label="Due"
        placeholder="Due"
        withTime
        clearable
      />
      <Button variant="outlined" size="sm">
        Schedule
      </Button>
    </Surface>
  );
}
