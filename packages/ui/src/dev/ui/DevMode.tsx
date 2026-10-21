'use client';

// Dev mode's UI: a toggle in the corner and, while open, the 3D view and the inspector over the
// page. It is made of envUI's components, inside its own Theme, and the readout leaves it out.

import { useEffect, useState } from 'react';
import { IconButton } from '../../actions/Button.js';
import { Theme, type ThemeValue } from '../../foundations/Theme.js';
import { ViewInAr } from '../../icons/ViewInAr.js';
import { resolveRoot } from '../measure.js';
import { Inspector } from './Inspector.js';
import { useLivePage } from './useLivePage.js';
import { View3D } from './View3D.js';

/** How the installer talks to the UI. */
export interface DevModeController {
  open: boolean;
  /** Called by the UI with its setter, so that the installer's open() and close() reach it. */
  subscribe: (setOpen: (open: boolean) => void) => () => void;
  setOpen: (open: boolean) => void;
  button: boolean;
  /** The shortcut as people read it, such as Alt+Shift+D, or null without one. */
  shortcut: string | null;
  root?: Element | string;
}

/** The page's theme, so dev mode's UI matches it. */
function pageTheme(): ThemeValue {
  const theme = document
    .querySelector('[data-env-theme]:not([data-env-dev] *)')
    ?.getAttribute('data-env-theme');
  return theme === 'dark' ? 'dark' : 'light';
}

export function DevMode({ controller }: { controller: DevModeController }) {
  const [open, setOpen] = useState(controller.open);
  useEffect(() => controller.subscribe(setOpen), [controller]);
  return (
    <Theme theme={pageTheme()} className="env-dev">
      {open ? <Panel controller={controller} /> : null}
      {controller.button ? (
        <IconButton
          className="env-dev-toggle"
          variant={open ? 'primary' : 'secondary'}
          icon={<ViewInAr />}
          aria-label="Dev mode"
          aria-pressed={open}
          title={controller.shortcut ? `Dev mode (${controller.shortcut})` : 'Dev mode'}
          onClick={() => controller.setOpen(!open)}
        />
      ) : null}
    </Theme>
  );
}

function Panel({ controller }: { controller: DevModeController }) {
  const [root] = useState(() => resolveRoot(controller.root));
  const live = useLivePage(root);
  const [selected, setSelected] = useState<number | null>(null);
  const [treeHover, setTreeHover] = useState<number | null>(null);
  return (
    <div className="env-dev-panel" role="region" aria-label="Dev mode">
      <View3D live={live} selected={selected} onSelect={setSelected} treeHover={treeHover} />
      <Inspector
        live={live}
        selected={selected}
        onSelect={setSelected}
        onTreeHover={setTreeHover}
        onClose={() => controller.setOpen(false)}
      />
    </div>
  );
}
