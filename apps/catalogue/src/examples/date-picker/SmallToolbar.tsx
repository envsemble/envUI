import { ActionGroup, Button, DatePicker, Surface } from '@envsemble/envui';

export default function CompactToolbar() {
  return (
    <Surface
      tone="pane"
      padding={1}
      corners="pill"
      density="compact"
      role="group"
      aria-label="Schedule toolbar"
      render={<ActionGroup />}
    >
      <DatePicker density="compact" aria-label="Due" placeholder="Due" withTime clearable />
      <Button variant="outlined">Schedule</Button>
    </Surface>
  );
}
