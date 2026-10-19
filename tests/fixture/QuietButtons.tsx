import { Button, IconButton, Surface, Theme, type ThemeValue } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Menu } from '@envsemble/envui/icons/Menu';
import { Settings } from '@envsemble/envui/icons/Settings';

/** Quiet actions in an application's chrome, on the canvas and inside a surface. */
export function QuietButtonsFixture({ theme }: { theme: ThemeValue }) {
  return (
    <Theme theme={theme} data-testid={`quiet-${theme}`} className="fixture-section">
      <div className="fixture-actions" data-testid={`quiet-canvas-${theme}`}>
        <IconButton variant="ghost" icon={<Menu />} aria-label={`Toggle sidebar ${theme}`} />
        <Button variant="ghost" startIcon={<Add />}>
          New section {theme}
        </Button>
        <IconButton
          variant="ghost"
          icon={<Settings />}
          aria-label={`Unavailable settings ${theme}`}
          disabled
        />
      </div>
      <Surface background="default" padding={3} data-testid={`quiet-pane-${theme}`}>
        <IconButton variant="ghost" icon={<Settings />} aria-label={`Pane settings ${theme}`} />
      </Surface>
    </Theme>
  );
}
