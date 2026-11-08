'use client';

import { useId, useRef } from 'react';
import { IconButton } from '../../../actions/Button.js';
import { IconClose } from '../../../icons/Close.js';
import { Tooltip } from '../../../overlays/Tooltip.js';
import { ActionElement } from '../../../internal/control/ActionElement.js';
import { DecorativeIcon } from '../../../internal/DecorativeIcon.js';
import { Row } from '../../Layout.js';
import type { PanelDockPanel } from '../panelDockTypes.js';
import { useEntrance } from './useEntrance.js';
import { flag } from '../../../internal/flag.js';
import '../../../styles/Base.css';
import '../../../styles/PanelDock.css';

interface PanelTabProps {
  panel: PanelDockPanel;
  /** Until the dock reads its layout, the one layout that has the tab, where only one does. */
  tabIn: 'wide' | 'stacked' | undefined;
  openLabel: (label: string) => string;
  closeLabel: (label: string) => string;
  onRestore: () => void;
  onClose: () => void;
}

/**
 * A panel out of sight, as a tab in the strip along the bottom, as on a taskbar: a button that
 * brings it back and a close button.
 */
export function PanelTab({
  panel,
  tabIn,
  openLabel,
  closeLabel,
  onRestore,
  onClose,
}: PanelTabProps) {
  const descriptionId = useId();
  const tab = useRef<HTMLLIElement>(null);
  useEntrance(tab, 'tab', true);
  const label = panel.label ?? panel.title;
  const attention = Boolean(panel.attention);
  const restore = (
    <ActionElement
      className="env-panel-dock-tab-restore"
      aria-label={openLabel(label)}
      aria-describedby={attention ? descriptionId : undefined}
      onClick={onRestore}
    >
      {panel.icon != null && <DecorativeIcon>{panel.icon}</DecorativeIcon>}
      <span className="env-panel-dock-tab-label">{label}</span>
      {attention && <span className="env-panel-dock-tab-attention" aria-hidden="true" />}
    </ActionElement>
  );
  return (
    <Row
      align="center"
      render={
        <li
          ref={tab}
          className="env-panel-dock-tab"
          data-panel-id={panel.id}
          data-mode={panel.mode}
          data-env-ssr-tab-in={tabIn}
          data-attention={flag(attention)}
        />
      }
    >
      {panel.tooltip != null ? <Tooltip content={panel.tooltip}>{restore}</Tooltip> : restore}
      <IconButton
        variant="ghost"
        icon={<IconClose />}
        className="env-panel-dock-tab-close"
        aria-label={closeLabel(label)}
        onClick={onClose}
      />
      {attention && (
        <span id={descriptionId} hidden>
          {panel.attention}
        </span>
      )}
    </Row>
  );
}
