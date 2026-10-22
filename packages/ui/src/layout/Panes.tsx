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
  type ReactNode,
  type RefObject,
} from 'react';
import { Button, IconButton } from '../actions/Button.js';
import { panes } from '../foundations/messages/panes.js';
import { ArrowBack } from '../icons/ArrowBack.js';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { ResizeHandle } from '../internal/ResizeHandle.js';
import { setRef } from '../internal/setRef.js';
import { useFormatters } from '../internal/useFormatters.js';
import { withDisplayName } from '../internal/withDisplayName.js';
import { inSkeleton } from '../foundations/inSkeleton.js';
import { skeletonAttributes, type SkeletonProps } from '../internal/skeleton.js';
import { readPanesSize, writePanesSize } from './panesSize.js';
import { Close } from '../icons/Close.js';

/**
 * How Panes behaves below `splitAt`: supporting, a main pane with a supporting pane that becomes a
 * sheet over it; list-detail, a list and the chosen item's detail, one at a time.
 */
export type PanesBehavior = 'supporting' | 'list-detail';

/** The window class of Panes' own width from which its panes sit side by side. */
export type PanesSplitAt = 'medium' | 'expanded' | 'large';

export interface RootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /**
   * supporting: Panes.Main and Panes.Supporting, such as a document and its details; below
   * `splitAt` the supporting pane is a sheet over the main one while `open`. list-detail:
   * Panes.List and Panes.Detail, such as messages and the one chosen; below `splitAt` one shows at a
   * time, the detail while `open`, with a back button to the list.
   */
  behavior: PanesBehavior;
  /**
   * The window class of the Panes' own width from which the panes sit side by side: medium
   * (37.5 rem), expanded (52.5 rem) or large (75 rem). Narrower, they behave as `behavior` says. CSS
   * decides it, so the server's markup is right before any script runs.
   * @default 'expanded'
   */
  splitAt?: PanesSplitAt;
  /**
   * Below `splitAt`: whether the supporting sheet is open, or the detail shows instead of the
   * list. Side by side, both panes show whatever it is. The application keeps it, as it knows when
   * an item is chosen or the sheet's button pressed.
   * @default false
   */
  open?: boolean;
  /**
   * Called with false when people close what `open` shows below `splitAt`: Escape, the close
   * button or a press on the scrim closes the supporting sheet, and the back button returns from
   * the detail to the list. Set `open` from it.
   */
  onOpenChange?: (open: boolean) => void;
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
   * The resized pane's width in rem, for Panes the application controls with onSizeChange: the
   * supporting pane, or the list. It applies while the panes sit side by side.
   */
  size?: number;
  /**
   * The resized pane's width in rem until people choose one with Panes.Divider, or one is kept
   * under `persist`, and the width a double click on the divider returns it to.
   * @default 22.5
   */
  defaultSize?: number;
  /**
   * Receives each new width of the resized pane, in rem: while dragging the divider with committed
   * false, and with committed true as a drag ends, a key moves it or a double click resets it.
   */
  onSizeChange?: (size: number, details: { committed: boolean }) => void;
  /**
   * The resized pane's smallest width, in rem.
   * @default 16
   */
  minSize?: number;
  /**
   * The resized pane's largest width, in rem. It never leaves the other pane less than 16 rem.
   * @default 40
   */
  maxSize?: number;
  /**
   * Keeps the width people choose in a cookie of this name, for Panes the application doesn't
   * control; a double click on the divider forgets it and returns to `defaultSize`. Read it on the
   * server with `readPanesSize(cookieHeader, key)` and pass it as `persistedSize`, so the server's
   * markup has it and nothing moves as the page hydrates. Without that, the kept width applies
   * after the first render.
   */
  persist?: string;
  /**
   * The width kept under `persist`, in rem, as the server read it from the request's cookies with
   * `readPanesSize`: the first render uses it, on the server and in the browser alike.
   */
  persistedSize?: number;
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

export interface PaneProps extends ComponentPropsWithRef<'div'> {
  /**
   * Names the pane, which makes it a region landmark that people can jump to, such as Documents.
   * Name the panes of a page's main layout; leave small panes unnamed.
   */
  label?: string;
}

export interface NamedPaneProps extends ComponentPropsWithRef<'div'> {
  /** Names the pane's region, such as Details or Projects. */
  label: string;
}

/**
 * The supporting pane: named, and a skeleton while what it holds loads. It stays busy and keeps
 * focus, as a sheet must, while its content is the skeleton, and inert.
 */
export interface SupportingProps extends NamedPaneProps, SkeletonProps {}

export interface DividerProps
  extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'aria-label' | 'onChange'> {
  /**
   * The divider's name, which says what it resizes, such as Resize project list.
   * @default 'Resize panes', or EnvUIProvider's messages.panes.resize
   */
  label?: string;
}

interface PanesContextValue {
  behavior: PanesBehavior;
  open: boolean;
  close: () => void;
  backLabel: string | undefined;
  closeLabel: string | undefined;
  size: number;
  min: number;
  max: number;
  change: (size: number, committed: boolean) => void;
  reset: () => void;
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

/** Sizes are kept to a hundredth of a rem. */
const round = (value: number) => Math.round(value * 100) / 100;

/** Whether an element shows, as CSS decided: it has a box. */
const shows = (element: HTMLElement | null) => element !== null && element.offsetParent !== null;

/** The widest the resized pane can be, in rem, beside the other pane's least width. */
function roomFor(divider: HTMLElement) {
  const root = divider.parentElement;
  if (!root) return Infinity;
  const rem =
    Number.parseFloat(getComputedStyle(divider.ownerDocument.documentElement).fontSize) || 16;
  const other =
    Number.parseFloat(getComputedStyle(root).getPropertyValue('--env-panes-other-min')) || 16;
  return round((root.clientWidth - divider.offsetWidth) / rem - other);
}

/** What Tab reaches inside an element, in order. */
const tabbables = (element: HTMLElement) =>
  [
    ...element.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]',
    ),
  ].filter((candidate) => candidate.tabIndex >= 0 && candidate.getClientRects().length > 0);

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
  open = false,
  onOpenChange,
  backLabel,
  closeLabel,
  size: controlledSize,
  defaultSize = 22.5,
  onSizeChange,
  minSize = 16,
  maxSize = 40,
  persist,
  persistedSize,
  name,
  className,
  style,
  children,
  ...props
}: RootProps) {
  const min = Math.max(0, minSize);
  const max = Math.max(min, maxSize);
  const clamp = useCallback(
    (value: number) => round(Math.min(max, Math.max(min, value))),
    [min, max],
  );
  // A size chosen by resizing or read from the cookie, or 'default' once a double click forgot it;
  // until then the width the server read, else the default, applies.
  const [chosenSize, setChosenSize] = useState<number | 'default'>();
  const size = clamp(
    controlledSize ??
      (chosenSize === 'default' ? defaultSize : (chosenSize ?? persistedSize ?? defaultSize)),
  );
  useLayoutEffect(() => {
    const kept = persist ? readPanesSize(document.cookie, persist) : undefined;
    if (kept !== undefined) setChosenSize(kept);
  }, [persist]);

  const latest = useRef({ size, controlledSize, onSizeChange, persist, defaultSize, clamp });
  latest.current = { size, controlledSize, onSizeChange, persist, defaultSize, clamp };
  const change = useCallback((next: number, committed: boolean) => {
    const current = latest.current;
    const value = current.clamp(next);
    if (current.controlledSize === undefined) {
      setChosenSize(value);
      if (committed && current.persist) writePanesSize(current.persist, value);
    }
    if (committed || value !== current.size) current.onSizeChange?.(value, { committed });
  }, []);
  const reset = useCallback(() => {
    const current = latest.current;
    const value = current.clamp(current.defaultSize);
    if (current.controlledSize === undefined) {
      // The default, also where the width the server read came from the cookie just forgotten.
      setChosenSize('default');
      if (current.persist) writePanesSize(current.persist, undefined);
    }
    current.onSizeChange?.(value, { committed: true });
  }, []);

  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  const close = useCallback(() => onOpenChangeRef.current?.(false), []);
  const resizedId = `${useId()}-resized`;
  const listRef = useRef<HTMLDivElement>(null);
  const context = useMemo<PanesContextValue>(
    () => ({
      behavior,
      open,
      close,
      backLabel,
      closeLabel,
      size,
      min,
      max,
      change,
      reset,
      resizedId,
      listRef,
    }),
    [behavior, open, close, backLabel, closeLabel, size, min, max, change, reset, resizedId],
  );
  return (
    <PanesContext value={context}>
      <div
        {...props}
        className={classNames('env-panes', className)}
        style={{ '--env-panes-size': `${size}rem`, ...style } as CSSProperties}
        data-env-layout="panes"
        data-env-name={name}
        data-behavior={behavior}
        data-split-at={splitAt}
        data-open={open ? '' : undefined}
      >
        {children}
        {behavior === 'supporting' && (
          // The scrim behind the supporting sheet; a press on it closes the sheet. Pointer only:
          // Escape closes it from the keyboard.
          <div className="env-panes-scrim" aria-hidden="true" onClick={close} />
        )}
      </div>
    </PanesContext>
  );
}

/** The main pane of supporting Panes, at the start. */
function Main({ label, className, ...props }: PaneProps) {
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
 * is: fixed to the window over a scrim, scrolling inside itself while the page stays. As a sheet
 * it is a modal dialog with a close button: everything else on the page is inert, focus moves into
 * it and Tab stays in it, and Escape, the close button or a press on the scrim closes it, which
 * returns focus to where it was.
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
  const pane = useRef<HTMLDivElement | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  // Whether the pane is a sheet: CSS decides, positioning it over the main pane below splitAt. Read
  // while it is open, again as the Panes' width changes; side by side it is there all along.
  const [sheet, setSheet] = useState(false);
  useLayoutEffect(() => {
    const element = pane.current;
    if (!open || !element) {
      setSheet(false);
      return;
    }
    const check = () => {
      const { position } = getComputedStyle(element);
      setSheet(position === 'absolute' || position === 'fixed');
    };
    check();
    const observer = new ResizeObserver(check);
    if (element.parentElement) observer.observe(element.parentElement);
    return () => observer.disconnect();
  }, [open]);
  // As a sheet, everything else on the page is inert, so aria-modal holds, and focus moves in; as it
  // closes, focus goes back to where it was. A sheet that becomes a pane beside the main one, as
  // the Panes widen, keeps focus where it is. A sheet fixed to the window keeps the page still.
  const openRef = useRef(open);
  openRef.current = open;
  useLayoutEffect(() => {
    const element = pane.current;
    if (!sheet || !element) return;
    const document = element.ownerDocument;
    const active = document.activeElement;
    returnFocus.current = active instanceof HTMLElement ? active : null;
    if (!element.contains(active)) element.focus();
    const others: HTMLElement[] = [];
    for (let node: Element = element; node.parentElement && node !== document.body; ) {
      for (const other of node.parentElement.children)
        if (
          other instanceof HTMLElement &&
          other !== node &&
          !other.inert &&
          // The scrim stays live, as a press on it closes the sheet, and so do live regions, such
          // as toasts, which announce what happens meanwhile.
          !other.classList.contains('env-panes-scrim') &&
          !other.hasAttribute('aria-live')
        )
          others.push(other);
      node = node.parentElement;
    }
    for (const other of others) other.inert = true;
    const html = document.documentElement;
    const still = getComputedStyle(element).position === 'fixed';
    const kept = { overflow: html.style.overflow, gutter: html.style.scrollbarGutter };
    if (still) {
      // The page keeps its scrollbar's room, so nothing moves.
      html.style.scrollbarGutter = 'stable';
      html.style.overflow = 'hidden';
    }
    return () => {
      for (const other of others) other.inert = false;
      if (still) {
        html.style.overflow = kept.overflow;
        html.style.scrollbarGutter = kept.gutter;
      }
      const target = returnFocus.current;
      returnFocus.current = null;
      if (openRef.current) return;
      const now = document.activeElement;
      const lost = now === null || now === document.body || element.contains(now);
      if (!target?.isConnected || !lost) return;
      // WebKit lets focus onto what was inert only once styles are worked out again.
      target.getBoundingClientRect();
      target.focus();
    };
  }, [sheet]);
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
      aria-modal={sheet || undefined}
      aria-label={label}
      {...skeletonAttributes(skeleton)}
      className={classNames('env-panes-supporting', className)}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || !sheet) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          close();
          return;
        }
        // Tab stays in the sheet, from its last stop to its first and back.
        if (event.key !== 'Tab') return;
        const stops = tabbables(event.currentTarget);
        const first = stops[0];
        const last = stops[stops.length - 1];
        const active = event.currentTarget.ownerDocument.activeElement;
        if (!first || !last) {
          event.preventDefault();
        } else if (event.shiftKey && (active === first || active === event.currentTarget)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }}
    >
      {/* Always rendered, so the server's markup has it; the style sheet shows it only while the
          pane is a sheet, and hidden it is out of the tab order and the accessibility tree. */}
      <div className="env-panes-close">
        <IconButton
          variant="ghost"
          icon={<Close />}
          aria-label={closeLabel ?? messages.close}
          onClick={close}
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
function List({ label, className, ref, id, ...props }: NamedPaneProps) {
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
function Detail({ label, className, children, ref, ...props }: PaneProps) {
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
        <Button ref={back} variant="text" startIcon={<ArrowBack />} onClick={close}>
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
 * A double click returns it to the default width. It shows only while the panes sit side by side,
 * and measures nothing until it is dragged.
 */
function Divider({ label, className, onDoubleClick, ...props }: DividerProps) {
  const { behavior, size, min, max, change, reset, resizedId } = usePanes('Divider');
  const messages = useMessages('panes', panes);
  const formatters = useFormatters();
  return (
    <ResizeHandle
      {...props}
      axis="inline"
      unit="rem"
      // The supporting pane is at the end, so it grows as the divider moves toward the start.
      reverse={behavior === 'supporting'}
      value={size}
      min={min}
      max={max}
      // The widest the resized pane can be in the Panes' width, leaving the other pane its room,
      // read as a drag starts or a key moves the divider: a drag starts at the width that shows.
      room={roomFor}
      step={1}
      largeStep={5}
      onChange={(value, { committed }) => change(value, committed)}
      valueText={(value) =>
        messages.size({
          size: formatters.number({ maximumFractionDigits: 1 }).format(round(value)),
        })
      }
      label={label ?? messages.resize}
      aria-controls={resizedId}
      className={classNames('env-panes-divider', className)}
      onDoubleClick={(event) => {
        onDoubleClick?.(event);
        if (!event.defaultPrevented) reset();
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
export {
  RootPart as Root,
  MainPart as Main,
  SupportingPart as Supporting,
  ListPart as List,
  DetailPart as Detail,
  DividerPart as Divider,
};
