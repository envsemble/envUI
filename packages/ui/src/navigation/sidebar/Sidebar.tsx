'use client';

import {
  useContext,
  useId,
  useRef,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { appShell } from '../../foundations/messages/appShell.js';
import { classNames } from '../../internal/classNames.js';
import { useMessages } from '../../internal/EnvUIContext.js';
import { useFormatters } from '../../internal/useFormatters.js';
import { useResize } from '../../internal/useResize.js';
import { withDisplayName } from '../../internal/withDisplayName.js';
import {
  FrameProvider,
  FrameShapeContext,
  useFrameState,
  useNestedShape,
  type FrameStateProps,
} from '../app-shell/FrameStore.js';
import { useSidebarRail } from '../internal/SidebarCompact.js';
import { HandleContext, SidebarRegion, WithFrame, type SidebarProps } from './SidebarRegion.js';

export type { SidebarProps as RootProps } from './SidebarRegion.js';

/**
 * A frame's sidebar: the application's navigation at the start, or a directory or an inspector at
 * the end, in its own column. It collapses to a rail of icons (or out of view) and back, its rail
 * opens over the content on hover and focus, people can resize it, and below the frame's breakpoint
 * its content moves into a drawer that its SidebarTrigger opens. It is a landmark named by label.
 * Inside AppShell.Root it is a sticky column; on its own, in a Sidebar.Provider or alone, a block.
 */
function Root(props: SidebarProps) {
  return (
    <WithFrame>
      <SidebarRegion {...props} handlePart={HandlePart} renderHandle={() => <HandlePart />} />
    </WithFrame>
  );
}

export interface ProviderProps extends FrameStateProps {
  /** The sidebars and their triggers, such as a settings page's sub-navigation. */
  children: ReactNode;
}

/**
 * The state of sidebars without AppShell.Root: their docked preference, widths, persistence,
 * breakpoint and shortcut, for a sidebar and SidebarTriggers that sit apart from it, such as in a
 * page's header. AppShell.Root provides the same itself.
 */
function Provider({ children, ...props }: ProviderProps) {
  const value = useFrameState(props, false);
  // Inside a frame its sidebars are no part of the frame's title bar.
  const shape = useNestedShape();
  return (
    <FrameProvider value={value}>
      <FrameShapeContext value={shape}>{children}</FrameShapeContext>
    </FrameProvider>
  );
}

export type HeaderProps = ComponentPropsWithRef<'div'>;

/**
 * The sidebar's top row, such as its SidebarTrigger with the application's mark and an
 * OrganizationSwitcher: as tall as AppShell.Header, so the two line up. In a rail it shows only
 * the trigger.
 */
function Header({ className, ...props }: HeaderProps) {
  // Beside a title bar, the sidebar's header is part of the window's title area: it drags the
  // window and leaves room for window controls at its edge.
  const titleBar = useContext(FrameShapeContext)?.titleBar ?? false;
  return (
    <div
      {...props}
      className={classNames('env-sidebar-header', className)}
      data-title-bar={titleBar ? '' : undefined}
    />
  );
}

export interface ContentProps extends ComponentPropsWithRef<'div'> {
  /**
   * Takes the remaining height and scrolls on its own, such as for a Tree below the navigation.
   * Hidden in a rail.
   */
  fill?: boolean;
  /**
   * start: children keep their width at the inline start, as navigation items do. stretch:
   * children take the full width, such as a search field.
   * @default 'start'
   */
  align?: 'start' | 'stretch';
}

/**
 * A section of the sidebar's content, such as its NavList.Root; it scrolls when it alone is taller
 * than the room left. Several stack in order.
 */
function Content({ fill = false, align = 'start', className, ...props }: ContentProps) {
  return (
    <div
      {...props}
      className={classNames('env-sidebar-content', className)}
      data-fill={fill ? '' : undefined}
      data-align={align}
    />
  );
}

export interface GroupProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /**
   * The group's visible heading, such as Administration; in a rail it is visually hidden and a
   * hairline separates the groups.
   */
  label: ReactNode;
  /** Renders the label as a heading of this level; without it, the label names a group. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** An action at the label's end, such as an IconButton that adds an item; hidden in a rail. */
  action?: ReactNode;
  /** The group's content, such as a NavList.Root. */
  children: ReactNode;
}

/** Related content under a small heading, such as a second NavList.Root. */
function Group({ label, headingLevel, action, className, children, ...props }: GroupProps) {
  const labelId = useId();
  const inRail = useSidebarRail();
  const Heading = headingLevel ? (`h${headingLevel}` as const) : 'span';
  return (
    <div
      role={headingLevel ? undefined : 'group'}
      aria-labelledby={headingLevel ? undefined : labelId}
      {...props}
      className={classNames('env-sidebar-group', className)}
    >
      <div className="env-sidebar-group-heading">
        <Heading id={labelId} className="env-sidebar-group-label">
          {label}
        </Heading>
        {action != null && !inRail && <div className="env-sidebar-group-action">{action}</div>}
      </div>
      {children}
    </div>
  );
}

export type FooterProps = ComponentPropsWithRef<'div'>;

/** The sidebar's bottom row, such as an AccountMenu. */
function Footer({ className, ...props }: FooterProps) {
  return <div {...props} className={classNames('env-sidebar-footer', className)} />;
}

export interface HandleProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /**
   * The handle's name.
   * @default the sidebar's resizeLabel, 'Resize sidebar', or EnvUIProvider's
   * messages.appShell.resizeSidebar; on a sidebar that isn't resizable, the sidebar's label
   */
  label?: string;
}

/** Pixels a press may move and still be a click. */
const clickSlop = 4;

/**
 * The sidebar's edge as a window splitter: dragging it or its arrow keys resize a resizable
 * sidebar, its value the width in rem; Enter, or a click without a drag, collapses or expands it.
 * On a sidebar that isn't resizable its value is only collapsed or expanded. It sits at the sidebar's
 * inline end (its inline start at the end side), inside the sidebar. A resizable Sidebar.Root
 * adds one where it has none.
 */
function Handle({
  label,
  className,
  onKeyDown,
  onPointerDown,
  onPointerUp,
  ...props
}: HandleProps) {
  const scope = useContext(HandleContext);
  const messages = useMessages('appShell', appShell);
  const formatters = useFormatters();
  const press = useRef<{ x: number; y: number } | null>(null);
  const resizing = scope?.resizable === true && !scope.collapsed;
  const remPixels = scope?.remPixels ?? 16;
  // The width read in rem, as people set it, such as 16 rem.
  const remText = (pixels: number) =>
    messages.sidebarWidth({
      size: formatters.number({ maximumFractionDigits: 1 }).format(pixels / remPixels),
    });
  const { handleProps } = useResize({
    axis: 'inline',
    value: scope?.value ?? 0,
    min: scope?.min ?? 0,
    max: scope?.max ?? 0,
    step: scope?.remPixels ?? 16,
    largeStep: (scope?.remPixels ?? 16) * 4,
    reverse: scope?.side === 'end',
    disabled: !resizing,
    valueText: remText,
    onChange: (next, { committed }) => scope?.setWidth(next, committed),
  });
  if (!scope) return null;
  const toggleKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      scope.toggle();
      return;
    }
    if (resizing) handleProps.onKeyDown(event);
  };
  const down = (event: PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (event.defaultPrevented) return;
    press.current = event.button === 0 ? { x: event.clientX, y: event.clientY } : null;
    if (resizing) {
      handleProps.onPointerDown(event);
      scope.setResizing(true);
    }
  };
  const up = (event: PointerEvent<HTMLDivElement>) => {
    onPointerUp?.(event);
    if (resizing) {
      handleProps.onPointerUp(event);
      scope.setResizing(false);
    }
    const start = press.current;
    press.current = null;
    // A click without a drag collapses or expands the sidebar.
    if (
      start &&
      Math.abs(event.clientX - start.x) < clickSlop &&
      Math.abs(event.clientY - start.y) < clickSlop
    )
      scope.toggle();
  };
  const end = (event: PointerEvent<HTMLDivElement>) => {
    press.current = null;
    if (resizing) {
      handleProps.onPointerCancel(event);
      scope.setResizing(false);
    }
  };
  const common = {
    ...props,
    'aria-controls': scope.id,
    className: classNames('env-sidebar-handle', className),
    onKeyDown: toggleKeys,
    onPointerDown: down,
    onPointerUp: up,
    'data-side': scope.side,
  };
  if (resizing)
    return (
      <div
        {...handleProps}
        {...common}
        aria-label={label ?? scope.label}
        data-resizable=""
        onPointerCancel={end}
        onLostPointerCapture={(event) => {
          handleProps.onLostPointerCapture(event);
          scope.setResizing(false);
        }}
      />
    );
  // A resizable sidebar collapsed: the splitter at its collapsed end, which Enter restores.
  if (scope.resizable)
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={0}
        aria-valuemin={0}
        aria-valuemax={Math.round(scope.max)}
        aria-valuetext={messages.sidebarCollapsed}
        tabIndex={0}
        {...common}
        aria-label={label ?? scope.label}
        onPointerCancel={end}
        data-axis="inline"
      />
    );
  // Not resizable: a splitter with two positions, collapsed and expanded, named after the sidebar it
  // sizes, as a window splitter is after its primary pane, so the name holds as it toggles.
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={scope.collapsed ? 0 : 100}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={scope.collapsed ? messages.sidebarCollapsed : messages.sidebarExpanded}
      tabIndex={0}
      {...common}
      aria-label={label ?? scope.pane}
      onPointerCancel={end}
      data-axis="inline"
    />
  );
}

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'Sidebar.Root');
const ProviderPart = /* @__PURE__ */ withDisplayName(Provider, 'Sidebar.Provider');
const HeaderPart = /* @__PURE__ */ withDisplayName(Header, 'Sidebar.Header');
const ContentPart = /* @__PURE__ */ withDisplayName(Content, 'Sidebar.Content');
const GroupPart = /* @__PURE__ */ withDisplayName(Group, 'Sidebar.Group');
const FooterPart = /* @__PURE__ */ withDisplayName(Footer, 'Sidebar.Footer');
const HandlePart = /* @__PURE__ */ withDisplayName(Handle, 'Sidebar.Handle');
export {
  RootPart as Root,
  ProviderPart as Provider,
  HeaderPart as Header,
  ContentPart as Content,
  GroupPart as Group,
  FooterPart as Footer,
  HandlePart as Handle,
};
