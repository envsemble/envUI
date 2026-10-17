'use client';

import { useId, useRef } from 'react';
import { CloseButton } from '../../actions/CloseButton.js';
import { Tooltip } from '../../feedback/Tooltip.js';
import { ActionElement } from '../../internal/ActionElement.js';
import { DecorativeIcon } from '../../internal/DecorativeIcon.js';
import type { PanelDockPanel } from './Root.js';
import { useEntrance } from './useEntrance.js';

interface PanelTabProps {
  panel: PanelDockPanel;
  showLabel: (label: string) => string;
  closeLabel: (label: string) => string;
  onRestore: () => void;
  onClose: () => void;
}

/**
 * A panel out of sight, as a tab in the strip along the bottom, as on a taskbar: a button that
 * brings it back and a close button.
 */
export function PanelTab({ panel, showLabel, closeLabel, onRestore, onClose }: PanelTabProps) {
  const descriptionId = useId();
  const tab = useRef<HTMLLIElement>(null);
  useEntrance(tab, 'tab', true);
  const label = panel.label ?? panel.title;
  const attention = Boolean(panel.attention);
  const restore = (
    <ActionElement
      className="env-panel-dock-tab-restore"
      aria-label={showLabel(label)}
      aria-describedby={attention ? descriptionId : undefined}
      onClick={onRestore}
    >
      {panel.icon != null && <DecorativeIcon>{panel.icon}</DecorativeIcon>}
      <span className="env-panel-dock-tab-label">{label}</span>
      {attention && <span className="env-panel-dock-tab-attention" aria-hidden="true" />}
    </ActionElement>
  );
  return (
    <li
      ref={tab}
      className="env-panel-dock-tab"
      data-panel-id={panel.id}
      data-mode={panel.mode}
      data-attention={attention || undefined}
    >
      {panel.tooltip != null ? <Tooltip content={panel.tooltip}>{restore}</Tooltip> : restore}
      <CloseButton
        className="env-panel-dock-tab-close"
        aria-label={closeLabel(label)}
        onClick={onClose}
      />
      {attention && (
        <span id={descriptionId} hidden>
          {panel.attention}
        </span>
      )}
    </li>
  );
}
