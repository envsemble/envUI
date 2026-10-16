import { ActionGroup, Button, IconButton, Stack, Surface } from '@envsemble/envui';
import { ZoomIn } from '@envsemble/envui/icons/ZoomIn';
import { ZoomOut } from '@envsemble/envui/icons/ZoomOut';

export default function CompactToolbar() {
  return (
    // align="start" keeps the toolbar as wide as its controls.
    <Stack align="start">
      <Surface
        padding={1}
        corners="pill"
        density="compact"
        role="group"
        aria-label="Diagram view"
        render={<ActionGroup />}
      >
        <IconButton variant="quiet" icon={<ZoomOut />} aria-label="Zoom out" />
        <IconButton variant="quiet" icon={<ZoomIn />} aria-label="Zoom in" />
        <Button variant="secondary">Fit to screen</Button>
      </Surface>
    </Stack>
  );
}
