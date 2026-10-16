import type { ReactNode } from 'react';

export interface ToolbarAction {
  id: string;
  label: string;
  onClick: () => void;
  primary?: boolean;
}

interface ToolbarProps {
  actions: ToolbarAction[];
  /** Content at the start of the bar, such as a count or a filter. */
  children?: ReactNode;
}

/** A bar of actions above a list. */
export function Toolbar({ actions, children }: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-start">{children}</div>
      <div className="toolbar-actions">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className={action.primary ? 'toolbar-button toolbar-button-primary' : 'toolbar-button'}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
