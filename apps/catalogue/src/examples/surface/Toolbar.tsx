import { Button, IconButton, Column, Row, Surface } from '@envsemble/envui';
import { ZoomIn } from '@envsemble/envui/icons/ZoomIn';
import { ZoomOut } from '@envsemble/envui/icons/ZoomOut';

export default function Toolbar() {
  return (
    // align="start" keeps the toolbar as wide as its controls.
    <Column gap={4} align="start">
      <Surface
        padding={1}
        radius="full"
        role="group"
        aria-label="Diagram view"
        render={<Row wrap align="center" gap={4} />}
      >
        <IconButton variant="ghost" size="sm" icon={<ZoomOut />} aria-label="Zoom out" />
        <IconButton variant="ghost" size="sm" icon={<ZoomIn />} aria-label="Zoom in" />
        <Button variant="secondary" size="sm">
          Fit to screen
        </Button>
      </Surface>
    </Column>
  );
}
