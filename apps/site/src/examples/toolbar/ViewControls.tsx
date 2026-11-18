import { Surface, Toolbar } from '@envsemble/envui';
import { IconHelp } from '@envsemble/envui/icons/Help';
import { IconZoomIn } from '@envsemble/envui/icons/ZoomIn';
import { IconZoomOut } from '@envsemble/envui/icons/ZoomOut';

export default function ViewControls() {
  return (
    <Surface
      padding={1}
      radius="full"
      render={<Toolbar.Root aria-label="Diagram view" size="sm" tooltipDelay={0} />}
      style={{ inlineSize: 'fit-content' }}
    >
      <Toolbar.Button icon={<IconZoomOut />} label="Zoom out" shortcut="Ctrl+-" />
      <Toolbar.Button icon={<IconZoomIn />} label="Zoom in" shortcut="Ctrl+=" />
      <Toolbar.Separator />
      <Toolbar.Link href="/help/diagrams" icon={<IconHelp />} label="Diagram help" />
    </Surface>
  );
}
