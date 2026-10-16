import { Surface, Toolbar } from '@envsemble/envui';
import { Help } from '@envsemble/envui/icons/Help';
import { ZoomIn } from '@envsemble/envui/icons/ZoomIn';
import { ZoomOut } from '@envsemble/envui/icons/ZoomOut';

export default function ViewControls() {
  return (
    // A pill surface floats the toolbar over a diagram; its buttons take the small size.
    <Surface
      padding={1}
      radius="full"
      render={<Toolbar.Root aria-label="Diagram view" size="sm" />}
      style={{ inlineSize: 'fit-content' }}
    >
      <Toolbar.Button icon={<ZoomOut />} label="Zoom out" shortcut="Ctrl+-" />
      <Toolbar.Button icon={<ZoomIn />} label="Zoom in" shortcut="Ctrl+=" />
      <Toolbar.Separator />
      <Toolbar.Link href="#diagram-help" icon={<Help />} label="Diagram help" />
    </Surface>
  );
}
