import { useState } from 'react';
import {
  Button,
  ConfirmButton,
  IconButton,
  Surface,
  Theme,
  type ThemeValue,
} from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Menu } from '@envsemble/envui/icons/Menu';
import { Settings } from '@envsemble/envui/icons/Settings';

/** Quiet actions in an application's chrome, on the canvas and inside a surface. */
export function QuietButtonsFixture({ theme }: { theme: ThemeValue }) {
  const [deleted, setDeleted] = useState(0);
  return (
    <Theme theme={theme} data-testid={`quiet-${theme}`} className="fixture-section">
      <div className="fixture-actions" data-testid={`quiet-canvas-${theme}`}>
        <IconButton variant="quiet" icon={<Menu />} aria-label={`Toggle sidebar ${theme}`} />
        <Button variant="quiet" startIcon={<Add />}>
          New section {theme}
        </Button>
        <IconButton
          variant="quiet"
          icon={<Settings />}
          aria-label={`Unavailable settings ${theme}`}
          disabled
        />
        <ConfirmButton
          variant="quiet"
          icon={<Delete />}
          aria-label={`Delete section ${theme}`}
          confirmLabel={`Delete section ${theme}?`}
          onConfirm={() => setDeleted((count) => count + 1)}
        />
        <output data-testid={`quiet-deleted-${theme}`}>{deleted}</output>
      </div>
      <Surface tone="pane" padding={3} data-testid={`quiet-pane-${theme}`}>
        <IconButton variant="quiet" icon={<Settings />} aria-label={`Pane settings ${theme}`} />
      </Surface>
    </Theme>
  );
}
