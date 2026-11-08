import { Button, IconButton, Surface, Theme, type ColorScheme } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconMenu } from '@envsemble/envui/icons/Menu';
import { IconSettings } from '@envsemble/envui/icons/Settings';

export const themes = true;

/** Quiet actions in an application's chrome, on the canvas and inside a surface. */
export default function IconButtonFixture({ theme }: { theme: ColorScheme }) {
  return (
    <Theme theme={theme} data-testid={`quiet-${theme}`} className="fixture-section">
      <div className="fixture-actions" data-testid={`quiet-canvas-${theme}`}>
        <IconButton variant="ghost" icon={<IconMenu />} aria-label={`Toggle sidebar ${theme}`} />
        <Button variant="ghost" startIcon={<IconAdd />}>
          New section {theme}
        </Button>
        <IconButton
          variant="ghost"
          icon={<IconSettings />}
          aria-label={`Unavailable settings ${theme}`}
          disabled
        />
      </div>
      <Surface background="default" padding={3} data-testid={`quiet-pane-${theme}`}>
        <IconButton variant="ghost" icon={<IconSettings />} aria-label={`Pane settings ${theme}`} />
      </Surface>
    </Theme>
  );
}
