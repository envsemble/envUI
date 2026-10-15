import {
  createElement,
  useContext,
  useLayoutEffect,
  useRef,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { setRef } from '../internal/setRef.js';
import { IconButton } from '../actions/Button.js';
import { Tooltip } from '../feedback/Tooltip.js';
import { Close } from '../icons/Close.js';
import { CloseFullscreen } from '../icons/CloseFullscreen.js';
import { Minimize } from '../icons/Minimize.js';
import { OpenInFull } from '../icons/OpenInFull.js';
import { PanelDockPanelContext } from './internal/PanelDockContext.js';

export interface PanelDockHeaderProps extends Omit<ComponentPropsWithRef<'header'>, 'title'> {
  /** The panel's title, as a heading. */
  title: ReactNode;
  /** Supporting text below the title, such as who changed it last. */
  meta?: ReactNode;
  /** The application's own actions before the window controls, such as Edit and a menu of more. */
  actions?: ReactNode;
  /** The window controls; PanelDockControls inside a PanelDock by default, null for none. */
  controls?: ReactNode;
  /** The title's heading level in the page outline; 2 by default. The appearance stays the same. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Content below the title row that stays with the header, such as Tabs. */
  children?: ReactNode;
}

/**
 * The header of a docked panel. It sticks to the top of the panel while its content scrolls: the
 * title and its metadata at the start, the application's actions and the window controls at the
 * end, compact like a title bar's.
 */
export function PanelDockHeader({
  title,
  meta,
  actions,
  controls,
  headingLevel = 2,
  className,
  children,
  ref,
  ...props
}: PanelDockHeaderProps) {
  const panel = useContext(PanelDockPanelContext);
  const header = useRef<HTMLElement>(null);
  const windowControls = controls === undefined ? panel && <PanelDockControls /> : controls;
  // The panel's content keeps controls that take focus out from beneath the header, so it needs
  // the header's size, which changes as the title wraps.
  const reportSize = panel?.reportHeaderSize;
  useLayoutEffect(() => {
    const element = header.current;
    if (!element || !reportSize) return;
    const measure = () => reportSize(element.offsetHeight);
    measure();
    const observer =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    observer?.observe(element);
    return () => {
      observer?.disconnect();
      reportSize(0);
    };
  }, [reportSize]);
  return (
    <header
      {...props}
      ref={(node) => {
        header.current = node;
        setRef(ref, node);
      }}
      className={classNames('env-panel-dock-header', className)}
      // Also where the header sits deeper in the content, such as in a form.
      data-scrolled={panel?.scrolled || undefined}
    >
      <div className="env-panel-dock-heading">
        {createElement(`h${headingLevel}`, { className: 'env-panel-dock-title' }, title)}
        {meta != null && <div className="env-panel-dock-meta">{meta}</div>}
      </div>
      {(actions != null || windowControls != null) && (
        <div className="env-panel-dock-actions">
          {actions}
          {windowControls}
        </div>
      )}
      {children != null && <div className="env-panel-dock-header-content">{children}</div>}
    </header>
  );
}

export interface PanelDockControlsProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** Accessible name and tooltip of the control that minimizes the panel; Minimize by default. */
  minimizeLabel?: string;
  /** Accessible name and tooltip of the control that maximizes the panel; Maximize by default. */
  maximizeLabel?: string;
  /** The same for a maximized panel, which returns it to the row; Restore by default. */
  restoreLabel?: string;
  /** Accessible name and tooltip of the control that closes the panel; Close by default. */
  closeLabel?: string;
}

/**
 * Minimize, Maximize or Restore, and Close for the panel around it, as compact icon buttons with
 * tooltips. A stacked dock already fills the region, so its panels leave out Maximize.
 */
export function PanelDockControls({
  minimizeLabel = 'Minimize',
  maximizeLabel = 'Maximize',
  restoreLabel = 'Restore',
  closeLabel = 'Close',
  className,
  ...props
}: PanelDockControlsProps) {
  const panel = useContext(PanelDockPanelContext);
  if (!panel) throw new Error('PanelDockControls must be used inside a PanelDock panel.');
  const maximized = panel.mode === 'maximized';
  return (
    <div {...props} className={classNames('env-panel-dock-controls', className)}>
      <WindowControl
        label={minimizeLabel}
        icon={<Minimize />}
        onClick={() => panel.changeMode('minimized')}
      />
      {!panel.stacked && (
        <WindowControl
          label={maximized ? restoreLabel : maximizeLabel}
          icon={maximized ? <CloseFullscreen /> : <OpenInFull />}
          onClick={() => panel.changeMode(maximized ? 'open' : 'maximized')}
        />
      )}
      <WindowControl label={closeLabel} icon={<Close />} onClick={panel.close} />
    </div>
  );
}

function WindowControl({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <Tooltip content={label}>
      <IconButton variant="text" icon={icon} aria-label={label} onClick={onClick} />
    </Tooltip>
  );
}
