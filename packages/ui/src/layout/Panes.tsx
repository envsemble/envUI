'use client';

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useId,
  useMemo,
  type ReactElement,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { panes } from '../foundations/messages/panes.js';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { withDisplayName } from '../internal/react/withDisplayName.js';
import type { ResizeDetails } from '../internal/resize/resizeDetails.js';
import { remPixels, roundToHundredth } from '../internal/dom/lengths.js';
import { useResizableWidth } from '../internal/resize/useResizableWidth.js';
import { Slot } from '../internal/layout/Slot.js';
import { ResizeHandle as Handle, type ResizeHandleProps as HandleProps } from './ResizeHandle.js';
import { chainHandlers } from '../internal/react/chainHandlers.js';
import '../styles/Base.css';
import '../styles/Panes.css';

/** The window class of Panes' own width below which its panes stack, one above the other. */
export type StackBelow = 'medium' | 'expanded' | 'large';

export interface RootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /**
   * Which pane has a width of its own, which Panes.ResizeHandle resizes: the first, such as a list
   * or a sidebar, or the last, such as details. The other pane takes the rest of the room.
   * @default 'start'
   */
  sized?: 'start' | 'end';
  /**
   * The window class of the Panes' own width below which the panes stack, the first above the
   * last, each half the height, and the resize handle hides: medium (37.5 rem), expanded
   * (52.5 rem) or large (75 rem). CSS decides it, so the server's markup is right before any script
   * runs. Without it the panes always sit side by side.
   */
  stackBelow?: StackBelow;
  /** The sized pane's width in rem, for Panes the application controls with onWidthChange. */
  width?: number;
  /**
   * The sized pane's width in rem until people choose one with Panes.ResizeHandle, and the width a
   * double click on the handle returns it to. To keep the width people choose, store what
   * onWidthChange receives and pass it back here.
   * @default 22.5
   */
  defaultWidth?: number;
  /**
   * Receives each new width of the sized pane, in rem: while dragging the handle with committed
   * false, and with committed true as a drag ends, a key moves it or a double click resets it.
   */
  onWidthChange?: (width: number, details: ResizeDetails) => void;
  /**
   * The sized pane's smallest width, in rem.
   * @default 16
   */
  minWidth?: number;
  /**
   * The sized pane's largest width, in rem. It never leaves the other pane less than 16 rem.
   * @default 40
   */
  maxWidth?: number;
  /**
   * A name for this node, such as "inbox", for the application's styles and tests to find it by; it
   * renders as `data-env-name`.
   */
  name?: string;
  /** The two panes, with a Panes.ResizeHandle between them for people to resize them. */
  children: ReactNode;
}

export interface PaneProps extends ComponentPropsWithRef<'div'> {
  /**
   * Names the pane, which makes it a region landmark that people can jump to, such as Messages.
   * Name the panes of a page's main layout; leave small panes unnamed.
   */
  label?: string;
  /**
   * The top of the pane, which stays in view while the pane's content scrolls under it, such as a
   * PageHeader or a Toolbar.
   */
  header?: ReactNode;
}

/** Panes.ResizeHandle's props: a ResizeHandle's look and name, with Panes keeping the width. */
export interface ResizeHandleProps extends Omit<
  HandleProps,
  | 'axis'
  | 'value'
  | 'min'
  | 'max'
  | 'room'
  | 'step'
  | 'largeStep'
  | 'unit'
  | 'percentOf'
  | 'reverse'
  | 'onChange'
  | 'valueText'
  | 'label'
  | 'aria-label'
> {
  /**
   * The handle's name, which says what it resizes, such as Resize the project list.
   * @default 'Resize panes', or EnvUIProvider's messages.panes.resize
   */
  label?: string;
}

interface PanesContextValue {
  handle: ReturnType<typeof useResizableWidth>['handleProps'];
  sizedId: string;
}

const PanesContext = createContext<PanesContextValue | null>(null);

function usePanes(part: string) {
  const context = useContext(PanesContext);
  if (!context) throw new Error(`Panes.${part} must be inside Panes.Root.`);
  return context;
}

const fallbackOtherPaneMinWidthRem = 16;

function widestSizedPaneRem(handle: HTMLElement) {
  const root = handle.parentElement;
  if (!root) return Infinity;
  const other =
    Number.parseFloat(getComputedStyle(root).getPropertyValue('--env-panes-other-min')) ||
    fallbackOtherPaneMinWidthRem;
  return roundToHundredth(root.clientWidth / remPixels(handle) - other);
}

function Root({
  sized = 'start',
  stackBelow,
  width,
  defaultWidth = 22.5,
  onWidthChange,
  minWidth = 16,
  maxWidth = 40,
  name,
  className,
  style,
  children,
  ...props
}: RootProps) {
  const sizeText = useMessages('panes', panes).size;
  const resize = useResizableWidth({
    width,
    defaultWidth,
    onWidthChange,
    minWidth,
    maxWidth,
    room: widestSizedPaneRem,
    reverse: sized === 'end',
    widthText: (size) => sizeText({ size }),
  });
  const fallbackId = `${useId()}-sized`;
  const paneAt: number[] = [];
  const given: ReactElement<PaneProps>[] = [];
  Children.forEach(children, (child, index) => {
    if (!isValidElement<PaneProps>(child) || child.type !== PanePart) return;
    paneAt.push(index);
    given.push(child);
  });
  const sizedIndex = sized === 'start' ? paneAt[0] : paneAt.at(-1);
  const sizedPane = sized === 'start' ? given[0] : given.at(-1);
  const sizedId = sizedPane?.props.id ?? fallbackId;
  const context = useMemo<PanesContextValue>(
    () => ({ handle: resize.handleProps, sizedId }),
    [resize.handleProps, sizedId],
  );
  return (
    <PanesContext value={context}>
      <div
        {...props}
        className={classNames('env-panes', className)}
        style={{ '--env-panes-size': `${resize.width}rem`, ...style }}
        data-env-layout="panes"
        data-env-name={name}
        data-sized={sized}
        data-stack-below={stackBelow}
      >
        {Children.map(children, (child, index) =>
          index === sizedIndex && isValidElement<PaneProps>(child) && child.props.id === undefined
            ? cloneElement(child, { id: sizedId })
            : child,
        )}
      </div>
    </PanesContext>
  );
}

function Pane({ label, header, className, children, ...props }: PaneProps) {
  usePanes('Pane');
  return (
    <div
      {...props}
      className={classNames('env-panes-pane', className)}
      {...(label !== undefined && { role: 'region', 'aria-label': label })}
    >
      {header != null && (
        <div className="env-panes-header">
          <Slot className="env-panes-header-content" grow>
            {header}
          </Slot>
        </div>
      )}
      <div className="env-panes-body">{children}</div>
    </div>
  );
}

function ResizeHandle({ label, className, onDoubleClick, ...props }: ResizeHandleProps) {
  const { handle, sizedId } = usePanes('ResizeHandle');
  const messages = useMessages('panes', panes);
  return (
    <Handle
      {...props}
      {...handle}
      label={label ?? messages.resize}
      aria-controls={sizedId}
      className={classNames('env-panes-resize-handle', className)}
      onDoubleClick={chainHandlers(onDoubleClick, handle.onDoubleClick)}
    />
  );
}

/**
 * A region split into two panes side by side, such as a list and its detail: one pane has a width
 * of its own, which a Panes.ResizeHandle between them resizes, and the other takes the rest. Each
 * pane's content scrolls on its own under its header when Panes has a height. With `stackBelow`
 * the panes stack in a narrow region. A pane the application renders alone, such as the list
 * while no item is open, fills the region and the handle hides. Panes fill their region with square
 * corners; an application rounds them with its own class, and the panes follow, since the root
 * clips them.
 */
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'Panes.Root');
/** One pane: the first or the last child of Panes.Root, with an optional header. */
const PanePart = /* @__PURE__ */ withDisplayName(Pane, 'Panes.Pane');
/**
 * The ResizeHandle between the panes, which resizes the sized pane: invisible on the seam with its
 * grip of three dots, a line along it under the pointer, while dragged and with keyboard focus. Its
 * hit area reaches only into the pane after it, so the scrollbar and the controls at the edge of the
 * pane before it stay reachable. The arrow keys move it 1 rem a step, 5 with Shift, and a double
 * click returns the pane to its default width. It hides while the panes stack.
 */
const ResizeHandlePart = /* @__PURE__ */ withDisplayName(ResizeHandle, 'Panes.ResizeHandle');
export { RootPart as Root, PanePart as Pane, ResizeHandlePart as ResizeHandle };
