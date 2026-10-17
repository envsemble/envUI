'use client';

import {
  createElement,
  useContext,
  useLayoutEffect,
  useRef,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { IconButton } from '../../actions/Button.js';
import { CloseButton } from '../../actions/CloseButton.js';
import { Tooltip } from '../../feedback/Tooltip.js';
import { panelDock as panelDockMessages } from '../../foundations/messages/panelDock.js';
import { CloseFullscreen } from '../../icons/CloseFullscreen.js';
import { Minimize } from '../../icons/Minimize.js';
import { OpenInFull } from '../../icons/OpenInFull.js';
import { classNames } from '../../internal/classNames.js';
import { ControlDefaults } from '../../internal/ControlDefaults.js';
import { useMessages } from '../../internal/EnvUIContext.js';
import { setRef } from '../../internal/setRef.js';
import { PanelDockPanelContext } from '../internal/PanelDockContext.js';

export interface HeaderProps extends Omit<ComponentPropsWithRef<'header'>, 'title'> {
  /**
   * The panel's title, as a heading in 1.125 rem medium-weight text; it wraps between words rather
   * than truncating.
   */
  title: ReactNode;
  /** Supporting text below the title, in 0.875 rem muted text, such as who changed it last. */
  meta?: ReactNode;
  /**
   * The application's own actions, before the window controls, such as an Edit IconButton and a
   * Menu of more; buttons that set no variant take the window controls' ghost one.
   */
  actions?: ReactNode;
  /**
   * Shows the window controls, Minimize, Maximize or Restore, and Close, inside a PanelDock; false
   * leaves them out. EnvUIProvider's messages.panelDock names them.
   * @default true
   */
  controls?: boolean;
  /**
   * The title's heading level in the page outline; the look stays the same.
   * @default 2
   */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Content below the title row that stays with the sticky header, such as Tabs. */
  children?: ReactNode;
}

/**
 * The header of a docked panel. It sticks to the top of the panel while its content scrolls: the
 * title and its metadata at the start, the application's actions and the window controls at the
 * end, small like a title bar's.
 */
export function Header({
  title,
  meta,
  actions,
  controls = true,
  headingLevel = 2,
  className,
  children,
  ref,
  ...props
}: HeaderProps) {
  const panel = useContext(PanelDockPanelContext);
  const header = useRef<HTMLElement>(null);
  const windowControls = controls && panel !== null;
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
      {(actions != null || windowControls) && (
        <div className="env-panel-dock-actions">
          {/* The application's buttons take the window controls' quiet look. */}
          <ControlDefaults variant="ghost">{actions}</ControlDefaults>
          {windowControls && <WindowControls />}
        </div>
      )}
      {children != null && <div className="env-panel-dock-header-content">{children}</div>}
    </header>
  );
}

/**
 * Minimize, Maximize or Restore, and Close for the panel around them, as small icon buttons with
 * tooltips, named from EnvUIProvider's messages. A stacked dock already fills the region, so its
 * panels leave out Maximize.
 */
function WindowControls() {
  const panel = useContext(PanelDockPanelContext)!;
  const messages = useMessages('panelDock', panelDockMessages);
  const maximized = panel.mode === 'maximized';
  return (
    <div className="env-panel-dock-controls">
      <WindowControl
        label={messages.minimize}
        icon={<Minimize />}
        onClick={() => panel.changeMode('minimized')}
      />
      {!panel.stacked && (
        <WindowControl
          label={maximized ? messages.restore : messages.maximize}
          icon={maximized ? <CloseFullscreen /> : <OpenInFull />}
          onClick={() => panel.changeMode(maximized ? 'open' : 'maximized')}
        />
      )}
      <Tooltip content={messages.close}>
        <CloseButton aria-label={messages.close} onClick={panel.close} />
      </Tooltip>
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
      <IconButton variant="ghost" icon={icon} aria-label={label} onClick={onClick} />
    </Tooltip>
  );
}
