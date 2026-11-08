'use client';

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { Button, IconButton, type ButtonAppearanceProps } from '../actions/Button.js';
import { panes } from '../foundations/messages/panes.js';
import { IconArrowBack } from '../icons/ArrowBack.js';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { usePortalContainer } from '../internal/PortalContainerContext.js';
import { ResizeHandle } from '../internal/ResizeHandle.js';
import { setRef } from '../internal/setRef.js';
import { withDisplayName } from '../internal/withDisplayName.js';
import { inSkeleton } from '../foundations/internal/inSkeleton.js';
import { skeletonAttributes, type SkeletonProps } from '../internal/skeleton.js';
import { readPanesWidth, writePanesWidth } from './panesSize.js';
import type { ResizeDetails } from './resizeDetails.js';
import { IconClose } from '../icons/Close.js';
import { remPixels, roundToHundredth } from '../internal/lengths.js';
import { useResizableWidth } from '../internal/useResizableWidth.js';
import { useLatest } from '../internal/useLatest.js';
import { flag } from '../internal/flag.js';
import { keepTabInside, useSupportingSheet } from './internal/useSupportingSheet.js';
import '../styles/Base.css';
import '../styles/Panes.css';

/**
 * How Panes behaves below `splitAt`: supporting, a main pane with a supporting pane that becomes a
 * sheet over it; list-detail, a list and the chosen item's detail, one at a time.
 */
export type Behavior = 'supporting' | 'list-detail';

/** The window class of Panes' own width from which its panes sit side by side. */
export type SplitAt = 'medium' | 'expanded' | 'large';

/**
 * Why Panes asks to open or close what `open` shows below `splitAt`: Escape, the supporting
 * sheet's close button, a press on its backdrop, the detail's back button, or Panes.Trigger.
 */
export type OpenChangeReason =
  'escape-key' | 'close-press' | 'outside-press' | 'back-press' | 'trigger-press';

/** What Panes.Root's onOpenChange receives beside the requested state. */
export interface OpenChangeDetails {
  /** Why it asks to open or close. */
  reason: OpenChangeReason;
}

export interface RootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /**
   * supporting: Panes.Main and Panes.Supporting, such as a document and its details; below
   * `splitAt` the supporting pane is a sheet over the main one while `open`. list-detail:
   * Panes.List and Panes.Detail, such as messages and the one chosen; below `splitAt` one shows at a
   * time, the detail while `open`, with a back button to the list.
   */
  behavior: Behavior;
  /**
   * The window class of the Panes' own width from which the panes sit side by side: medium
   * (37.5 rem), expanded (52.5 rem) or large (75 rem). Narrower, they behave as `behavior` says. CSS
   * decides it, so the server's markup is right before any script runs.
   * @default 'expanded'
   */
  splitAt?: SplitAt;
  /**
   * Below `splitAt`: whether the supporting sheet is open, or the detail shows instead of the
   * list, for Panes the application controls with onOpenChange, such as a list-detail that opens
   * the detail as an item is chosen. Side by side, both panes show whatever it is.
   */
  open?: boolean;
  /**
   * Whether uncontrolled Panes start with the supporting sheet open, or the detail shown, below
   * `splitAt`. Panes.Trigger opens the sheet, and Escape, the close button, the backdrop and the
   * back button close what shows.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Called with the new state, and why: true when Panes.Trigger opens the supporting sheet, and
   * false when people close what `open` shows below `splitAt`: Escape, the close button or a press
   * on the backdrop closes the supporting sheet, and the back button returns from the detail to the
   * list.
   */
  onOpenChange?: (open: boolean, details: OpenChangeDetails) => void;
  /**
   * The name of the supporting sheet's close button, which shows only while the pane is a sheet.
   * @default 'Close', or EnvUIProvider's messages.panes.close
   */
  closeLabel?: string;
  /**
   * The back button's label in a list-detail's detail, below `splitAt`. Name where it goes, such as
   * All projects.
   * @default 'Back', or EnvUIProvider's messages.panes.back
   */
  backLabel?: string;
  /**
   * The resized pane's width in rem, for Panes the application controls with onWidthChange: the
   * supporting pane, or the list. It applies while the panes sit side by side.
   */
  width?: number;
  /**
   * The resized pane's width in rem until people choose one with Panes.Divider, or one is kept
   * under `persist`, and the width a double click on the divider returns it to.
   * @default 22.5
   */
  defaultWidth?: number;
  /**
   * Receives each new width of the resized pane, in rem: while dragging the divider with committed
   * false, and with committed true as a drag ends, a key moves it or a double click resets it.
   */
  onWidthChange?: (width: number, details: ResizeDetails) => void;
  /**
   * The resized pane's smallest width, in rem.
   * @default 16
   */
  minWidth?: number;
  /**
   * The resized pane's largest width, in rem. It never leaves the other pane less than 16 rem.
   * @default 40
   */
  maxWidth?: number;
  /**
   * Keeps the width people choose in a cookie of this name, for Panes the application doesn't
   * control; a double click on the divider forgets it and returns to `defaultWidth`. Read it on the
   * server with `readPanesWidth(cookieHeader, key)` and pass it as `persistedWidth`, so the server's
   * markup has it and nothing moves as the page hydrates. Without that, the kept width applies
   * after the first render.
   */
  persist?: string;
  /**
   * The width kept under `persist`, in rem, as the server read it from the request's cookies with
   * `readPanesWidth`: the first render uses it, on the server and in the browser alike.
   */
  persistedWidth?: number;
  /**
   * A name for this node, such as "inbox", which dev mode and the docs show; it renders as
   * `data-env-name`.
   */
  name?: string;
  /**
   * The panes: Panes.Main, an optional Panes.Divider and Panes.Supporting; or Panes.List, an
   * optional Panes.Divider and Panes.Detail.
   */
  children: ReactNode;
}

export interface MainProps extends ComponentPropsWithRef<'div'> {
  /**
   * Names the pane, which makes it a region landmark that people can jump to, such as Documents.
   * Name the panes of a page's main layout; leave small panes unnamed.
   */
  label?: string;
}

/** Panes.Detail's props: Panes.Main's, with its optional name. */
export type DetailProps = MainProps;

export interface ListProps extends ComponentPropsWithRef<'div'> {
  /** Names the pane's region, such as Projects. */
  label: string;
}

/**
 * The supporting pane: named, and a skeleton while what it holds loads. It stays busy and keeps
 * focus, as a sheet must, while its content is the skeleton, and inert.
 */
export interface SupportingProps extends ComponentPropsWithRef<'div'>, SkeletonProps {
  /** Names the pane's region, such as Details. */
  label: string;
}

export interface DividerProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'aria-label' | 'onChange'
> {
  /**
   * The divider's name, which says what it resizes, such as Resize project list.
   * @default 'Resize panes', or EnvUIProvider's messages.panes.resize
   */
  label?: string;
}

interface PanesContextValue {
  behavior: Behavior;
  open: boolean;
  close: (reason: OpenChangeReason) => void;
  /** Opens the supporting pane, or the detail. */
  show: () => void;
  backLabel: string | undefined;
  closeLabel: string | undefined;
  /** The divider's ResizeHandle props, which size the resized pane. */
  divider: ReturnType<typeof useResizableWidth>['handleProps'];
  /** The pane the divider resizes, which it names in aria-controls. */
  resizedId: string;
  listRef: RefObject<HTMLDivElement | null>;
}

const PanesContext = createContext<PanesContextValue | null>(null);

function usePanes(part: string) {
  const context = useContext(PanesContext);
  if (!context) throw new Error(`Panes.${part} must be inside Panes.Root.`);
  return context;
}

/** Whether an element shows, as CSS decided: it has a box. */
const shows = (element: HTMLElement | null) => element !== null && element.offsetParent !== null;

/** The other pane's least width in rem, as `--env-panes-other-min` sets it in Panes.css. */
const otherPaneMinWidth = 16;

/** The widest the resized pane can be, in rem, beside the other pane's least width. */
function roomFor(divider: HTMLElement) {
  const root = divider.parentElement;
  if (!root) return Infinity;
  const rem = remPixels(divider);
  const other =
    Number.parseFloat(getComputedStyle(root).getPropertyValue('--env-panes-other-min')) ||
    otherPaneMinWidth;
  return roundToHundredth((root.clientWidth - divider.offsetWidth) / rem - other);
}

/**
 * Two panes side by side, after Material's pane patterns, and how they behave in less room: a main
 * pane with a supporting pane that becomes a sheet over it, or a list and its detail, one at a time.
 * Invisible structure that never paints, except the supporting pane while it is a sheet, which is
 * modal. Its own width decides, in CSS: it is the env-panes container. Each pane scrolls on its own
 * when Panes has a height, as in a Scaffold's body that scrolls; an optional Panes.Divider resizes
 * them.
 */
function Root({
  behavior,
  splitAt = 'expanded',
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  backLabel,
  closeLabel,
  width,
  defaultWidth = 22.5,
  onWidthChange,
  minWidth = 16,
  maxWidth = 40,
  persist,
  persistedWidth,
  name,
  className,
  style,
  children,
  ...props
}: RootProps) {
  const sizeText = useMessages('panes', panes).size;
  const keep = useCallback(
    (kept: number | undefined) => {
      if (persist) writePanesWidth(persist, kept);
    },
    [persist],
  );
  const resize = useResizableWidth({
    width,
    defaultWidth,
    onWidthChange,
    minWidth,
    maxWidth,
    // Until people choose a width, the one the server read from the cookie; a double click forgets
    // both and returns to the default.
    keptWidth: persistedWidth,
    keep,
    // The widest the resized pane can be in the Panes' width, leaving the other pane its room,
    // read as a drag starts or a key moves the divider: a drag starts at the width that shows.
    room: roomFor,
    // The supporting pane is at the end, so it grows as the divider moves toward the start.
    reverse: behavior === 'supporting',
    widthText: (size) => sizeText({ size }),
  });
  const { restore } = resize;
  useLayoutEffect(() => {
    const kept = persist ? readPanesWidth(document.cookie, persist) : undefined;
    if (kept !== undefined) restore(kept);
  }, [persist, restore]);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const latestOpen = useLatest({ controlled: controlledOpen !== undefined, onOpenChange });
  const setOpen = useCallback(
    (next: boolean, reason: OpenChangeReason) => {
      if (!latestOpen.current.controlled) setUncontrolledOpen(next);
      latestOpen.current.onOpenChange?.(next, { reason });
    },
    [latestOpen],
  );
  const close = useCallback((reason: OpenChangeReason) => setOpen(false, reason), [setOpen]);
  const show = useCallback(() => setOpen(true, 'trigger-press'), [setOpen]);
  const resizedId = `${useId()}-resized`;
  const listRef = useRef<HTMLDivElement>(null);
  const context = useMemo<PanesContextValue>(
    () => ({
      behavior,
      open,
      close,
      show,
      backLabel,
      closeLabel,
      divider: resize.handleProps,
      resizedId,
      listRef,
    }),
    [behavior, open, close, show, backLabel, closeLabel, resize.handleProps, resizedId],
  );
  return (
    <PanesContext value={context}>
      <div
        {...props}
        className={classNames('env-panes', className)}
        style={{ '--env-panes-size': `${resize.width}rem`, ...style } as CSSProperties}
        data-env-layout="panes"
        data-env-name={name}
        data-behavior={behavior}
        data-split-at={splitAt}
        data-open={flag(open)}
      >
        {children}
        {behavior === 'supporting' && (
          // The backdrop behind the supporting sheet; a press on it closes the sheet. Pointer only:
          // Escape closes it from the keyboard.
          <div
            className="env-panes-backdrop"
            aria-hidden="true"
            onClick={() => close('outside-press')}
          />
        )}
      </div>
    </PanesContext>
  );
}

/** The main pane of supporting Panes, at the start. */
function Main({ label, className, ...props }: MainProps) {
  usePanes('Main');
  return (
    <div
      {...props}
      className={classNames('env-panes-main', className)}
      {...(label !== undefined && { role: 'region', 'aria-label': label })}
    />
  );
}

/**
 * The supporting pane, at the end, such as details or filters for the main pane. Below `splitAt` it
 * is a modal sheet over the main pane while `open`: a side sheet in a medium width, a bottom sheet
 * in a compact one. Inside a Scaffold whose document scrolls, the sheet is the window's, as Sheet
 * is: fixed to the window over a backdrop, scrolling inside itself while the page stays. As a sheet
 * it is a modal dialog with a close button: everything else on the page is inert, focus moves into
 * it and Tab stays in it, and Escape, the close button or a press on the backdrop closes it, which
 * returns focus to where it was. In a contained PortalContainer, such as a preview on a page, the
 * sheet belongs to the container: it is not modal, so the page stays in use and focus stays where
 * it is.
 */
function Supporting({
  label,
  skeleton = false,
  className,
  onKeyDown,
  ref,
  id,
  children,
  ...props
}: SupportingProps) {
  const { open, close, closeLabel, resizedId } = usePanes('Supporting');
  const messages = useMessages('panes', panes);
  const { contained } = usePortalContainer();
  const pane = useRef<HTMLDivElement | null>(null);
  const { sheet, modal } = useSupportingSheet(pane, open, contained);
  return (
    <div
      tabIndex={-1}
      {...props}
      id={id ?? resizedId}
      ref={(node) => {
        pane.current = node;
        setRef(ref, node);
      }}
      role={sheet ? 'dialog' : 'region'}
      aria-modal={modal || undefined}
      aria-label={label}
      {...skeletonAttributes(skeleton)}
      className={classNames('env-panes-supporting', className)}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || !sheet) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          close('escape-key');
          return;
        }
        if (modal) keepTabInside(event);
      }}
    >
      {/* Always rendered, so the server's markup has it; the style sheet shows it only while the
          pane is a sheet, and hidden it is out of the tab order and the accessibility tree. */}
      <div className="env-panes-close">
        <IconButton
          variant="ghost"
          icon={<IconClose />}
          aria-label={closeLabel ?? messages.close}
          onClick={() => close('close-press')}
        />
      </div>
      {inSkeleton(skeleton, children)}
    </div>
  );
}

/** Focus on the list's current row, else on the list itself. */
function focusCurrentRow(list: HTMLElement | null) {
  if (!list) return;
  const current = list.querySelector<HTMLElement>('[aria-current]:not([aria-current="false"])');
  const target =
    current?.matches(':is(a[href], button, [tabindex])') === true
      ? current
      : (current?.querySelector<HTMLElement>('a[href], button, [tabindex]') ?? current);
  if (target && target.tabIndex >= 0) target.focus();
  else {
    if (!list.hasAttribute('tabindex')) list.tabIndex = -1;
    list.focus();
  }
}

/** The list pane of list-detail Panes, at the start. Below `splitAt` it hides while `open`. */
function List({ label, className, ref, id, ...props }: ListProps) {
  const { listRef, resizedId } = usePanes('List');
  return (
    <div
      {...props}
      id={id ?? resizedId}
      ref={(node) => {
        listRef.current = node;
        setRef(ref, node);
      }}
      role="region"
      aria-label={label}
      className={classNames('env-panes-list', className)}
    />
  );
}

/**
 * The detail pane of list-detail Panes, at the end. Below `splitAt` it shows only while `open`,
 * with a back button to the list at its start, and focus follows what shows: the back button as
 * the detail opens, the list's current row as it closes.
 */
function Detail({ label, className, children, ref, ...props }: DetailProps) {
  const { open, close, backLabel, listRef } = usePanes('Detail');
  const messages = useMessages('panes', panes);
  const back = useRef<HTMLButtonElement>(null);
  const detail = useRef<HTMLDivElement | null>(null);
  const wasOpen = useRef(open);
  // One pane at a time, as CSS shows the back button: focus left in a pane that hides goes to the
  // one that shows. Focus elsewhere on the page stays where it is.
  useLayoutEffect(() => {
    const opened = open && !wasOpen.current;
    const closed = !open && wasOpen.current;
    wasOpen.current = open;
    if (!opened && !closed) return;
    // One at a time, the back button shows with the detail, and the detail hides as it closes; side
    // by side, both panes show and focus stays where it is.
    const oneAtATime = opened ? shows(back.current) : !shows(detail.current);
    if (!oneAtATime) return;
    const active = document.activeElement;
    const root = detail.current?.parentElement;
    if (active && active !== document.body && !root?.contains(active)) return;
    if (opened) back.current?.focus();
    else if (closed) focusCurrentRow(listRef.current);
  }, [open, listRef]);
  return (
    <div
      {...props}
      ref={(node) => {
        detail.current = node;
        setRef(ref, node);
      }}
      className={classNames('env-panes-detail', className)}
      {...(label !== undefined && { role: 'region', 'aria-label': label })}
    >
      {/* Always rendered, so the server's markup has it; the style sheet shows it only while one
          pane shows at a time, and hidden it is out of the tab order and the accessibility tree. */}
      <div className="env-panes-back">
        <Button
          ref={back}
          variant="text"
          startIcon={<IconArrowBack />}
          onClick={() => close('back-press')}
        >
          {backLabel ?? messages.back}
        </Button>
      </div>
      {children}
    </div>
  );
}

/**
 * The divider between the panes, which resizes the supporting pane or the list: the gap between
 * them, with a small grip and no line. It is a focusable separator that the pointer drags and the
 * arrow keys move, 1 rem a step, 5 with Shift, which names the pane it resizes in aria-controls.
 * A double click returns it to the default width. It shows only while the panes sit side by side.
 * Place it between two surfaces, each pane's own, such as a Surface as tall as the pane, never
 * beside content on the page.
 */
function Divider({ label, className, onDoubleClick, ...props }: DividerProps) {
  const { divider, resizedId } = usePanes('Divider');
  const messages = useMessages('panes', panes);
  return (
    <ResizeHandle
      {...props}
      {...divider}
      label={label ?? messages.resize}
      grip
      aria-controls={resizedId}
      className={classNames('env-panes-divider', className)}
      onDoubleClick={(event) => {
        onDoubleClick?.(event);
        divider.onDoubleClick(event);
      }}
    />
  );
}

/** Panes.Trigger's props: a Button's, as a native button. */
export type TriggerProps = ButtonAppearanceProps &
  ComponentPropsWithRef<'button'> & { href?: undefined };

/**
 * The button that opens the supporting pane while it is a sheet, below `splitAt`; place it in the
 * main pane. It hides while the panes sit side by side, where the supporting pane shows anyway,
 * and says whether the sheet is open with aria-expanded. It takes Button's props.
 */
function Trigger({ className, onClick, ...props }: TriggerProps) {
  const { open, show, resizedId } = usePanes('Trigger');
  return (
    <Button
      {...props}
      className={classNames('env-panes-trigger', className)}
      aria-expanded={open}
      aria-controls={resizedId}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) show();
      }}
    />
  );
}

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'Panes.Root');
const MainPart = /* @__PURE__ */ withDisplayName(Main, 'Panes.Main');
const SupportingPart = /* @__PURE__ */ withDisplayName(Supporting, 'Panes.Supporting');
const ListPart = /* @__PURE__ */ withDisplayName(List, 'Panes.List');
const DetailPart = /* @__PURE__ */ withDisplayName(Detail, 'Panes.Detail');
const DividerPart = /* @__PURE__ */ withDisplayName(Divider, 'Panes.Divider');
const TriggerPart = /* @__PURE__ */ withDisplayName(Trigger, 'Panes.Trigger');
export {
  RootPart as Root,
  MainPart as Main,
  SupportingPart as Supporting,
  ListPart as List,
  DetailPart as Detail,
  DividerPart as Divider,
  TriggerPart as Trigger,
};
