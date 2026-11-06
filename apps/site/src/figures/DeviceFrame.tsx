import {
  createContext,
  use,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { Text } from '@envsemble/envui';
import { IconArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { IconArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { IconBatteryFull } from '@envsemble/envui/icons/BatteryFull';
import { IconLock } from '@envsemble/envui/icons/Lock';
import { IconRefresh } from '@envsemble/envui/icons/Refresh';
import { IconSignalCellular4Bar } from '@envsemble/envui/icons/SignalCellular4Bar';
import { IconSignalWifi4Bar } from '@envsemble/envui/icons/SignalWifi4Bar';
import type { DeviceKind } from '../shared/DocumentationTypes';
import { courseOf, headingEvent, headingOf, mustShowOf, type Heading } from '../motion/MustShow';

/*
 * A device drawn around a page's figure: a phone or a browser's window whose screen is a window of
 * its own, at a real width, so a frame of an application, such as a Scaffold, lays out as it does
 * on that device. The device is a plain drawing: one solid stroke around the whole body, a phone's
 * status bar and home indicator, a window's address bar; what its screen shows is the figure as it
 * is. A page's figure takes one with `device` on its fence (LiveExample.tsx); the gallery's and
 * Related's cards never do.
 */

/** The screen's size, in rem, of each kind: a phone 384 px across, a window 1024 px. */
const screens: Record<DeviceKind, { width: number; height: number }> = {
  phone: { width: 24, height: 44 },
  window: { width: 64, height: 40 },
};

/**
 * The device a page's figure is drawn in, which an animated figure's stage (MotionStage) puts
 * around what it plays: the figure's, from its fence, never a card's.
 */
export const FigureDevice = createContext<DeviceKind | undefined>(undefined);

/**
 * Whether what renders is on a device's screen: a specimen that frames its example in a window of
 * its own width, such as a sweep's frame, shows it on the screen as it is instead.
 */
const OnScreen = createContext(false);

/** Whether what renders is on a device's screen (DeviceFrame). */
export const useOnScreen = () => use(OnScreen);

/**
 * The least each kind is drawn at, and the least its small text (body-sm) is drawn at, about
 * 10 px, whichever is larger: a device that would need to be drawn smaller is drawn at it instead
 * and cut off at the stage's edges. The compact scale's small text needs 0.84, the comfortable
 * scale's, a touch screen's, the kind's least.
 */
const leastScale: Record<DeviceKind, number> = { phone: 0.8, window: 0.75 };
const leastText = 10;

/**
 * Where a still figure's view starts across a screen cut off at its end, in the device's px: a
 * frame of an application shows where its navigation meets its page, the page from halfway in, so
 * a narrow stage shows as much of the page's content as of the navigation's labels.
 */
function boundaryStart(row: Element, scale: number, size: number) {
  const body = row.querySelector('.env-scaffold-body');
  if (!body || !row.querySelector('.env-scaffold-navigation')) return 0;
  const start = (body.getBoundingClientRect().left - row.getBoundingClientRect().left) / scale;
  return Math.max(0, start - size / 2);
}

/** Room kept around a point the pointer heads to, in the device's px: its cursor and a margin. */
const pointRoom = 40;

/** A box in the device's own px, from its top left corner. */
interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** The point of a heading, in the device's own px, as a box with room around it. */
function pointBox(row: Element, scale: number, { selector, x, y }: Heading): Box | undefined {
  // The first that shows: a pane that is closed may keep its parts, hidden.
  const element = [...row.querySelectorAll(selector)].find(
    (candidate) =>
      candidate.getClientRects().length > 0 &&
      candidate.checkVisibility({ opacityProperty: true, visibilityProperty: true }),
  );
  if (!element) return undefined;
  const own = row.getBoundingClientRect();
  const box = element.getBoundingClientRect();
  const left = (box.left - own.left + x * box.width) / scale;
  const top = (box.top - own.top + y * box.height) / scale;
  return {
    left: left - pointRoom / 2,
    top: top - pointRoom / 2,
    right: left + pointRoom,
    bottom: top + pointRoom,
  };
}

/**
 * The boxes, in the device's own px, of what a figure names to keep in view (useMustShow): each
 * around its content, such as a value's text rather than the width of its row, with room for the
 * fade of a cut edge.
 */
function namedBoxes(row: Element, scale: number, root: Element): Box[] {
  const own = row.getBoundingClientRect();
  const range = document.createRange();
  return mustShowOf(root, true).flatMap((selector) =>
    [...row.querySelectorAll(selector)]
      .filter((element) => element.getClientRects().length > 0)
      .map((element) => {
        range.selectNodeContents(element);
        const box = range.getBoundingClientRect();
        return {
          left: (box.left - own.left) / scale - pointRoom,
          top: (box.top - own.top) / scale - pointRoom,
          right: (box.right - own.left) / scale + pointRoom,
          bottom: (box.bottom - own.top) / scale + pointRoom,
        };
      }),
  );
}

/**
 * Where a view of `size` starts along one side of a device of `whole`: so it shows `span` where
 * it fits, as near the start as it can; where it doesn't, so it shows `focus`, moving no more
 * than it must from `from`; else at the span's start, or the device's. A view that would stop
 * within `snap` of the device's start or end goes on to it, where what it shows still fits, so a
 * sliver of the device isn't left in the fade of a cut edge.
 */
function viewStart(
  whole: number,
  size: number,
  span: [number, number] | undefined,
  focus: [number, number] | undefined,
  from: number,
  snap: number,
) {
  const most = Math.max(0, whole - size);
  const clamp = (value: number) => Math.min(most, Math.max(0, value));
  const fits = span && span[1] - span[0] <= size;
  const start = fits
    ? clamp(Math.min(span[0], span[1] - size))
    : focus
      ? clamp(Math.min(Math.max(from, focus[1] - size), focus[0]))
      : clamp(span ? span[0] : 0);
  const shows = fits ? span : focus;
  if (start < snap && (!shows || shows[1] <= size)) return 0;
  if (start > most - snap && (!shows || shows[0] >= most)) return most;
  return start;
}

/** The span of boxes along one side, or nothing where there are none. */
function spanOf(boxes: Box[], pick: (box: Box) => [number, number]) {
  return boxes.length
    ? boxes
        .map(pick)
        .reduce<
          [number, number]
        >((a, b) => [Math.min(a[0], b[0]), Math.max(a[1], b[1])], [Infinity, -Infinity])
    : undefined;
}

interface Fit {
  scale: number;
  width: number;
  height: number;
  x: number;
  y: number;
  cut: string;
  /** How far the view runs out over the stage's padding at its start and its end. */
  outset: { start: number; end: number };
}

const sameFit = (a: Fit, b: Fit) =>
  a.scale === b.scale &&
  a.cut === b.cut &&
  Math.abs(a.outset.start - b.outset.start) < 0.5 &&
  Math.abs(a.outset.end - b.outset.end) < 0.5 &&
  Math.abs(a.width - b.width) < 0.5 &&
  Math.abs(a.height - b.height) < 0.5 &&
  Math.abs(a.x - b.x) < 0.5 &&
  Math.abs(a.y - b.y) < 0.5;

/**
 * A device at its own size, scaled to fit its stage's width and at most `--site-device-most` high,
 * never drawn larger than it is nor smaller than its kind's least scale (leastScale): where it
 * would need to be, it is cut off at the stage's end and foot, its top start, the bar and the
 * navigation, in view, and its cut edges fade out. On an animated figure, the view keeps every
 * point its pointer heads to in it, and what it names with `useMustShow`, where they fit together,
 * or else follows the pointer, so what it acts on is never cut off (MustShow.ts). A side that is
 * cut off runs out over the stage's padding to its edge. The place it holds on the stage is its
 * view, so the stage is as tall as what it shows.
 */
export function DeviceStage({ kind, children }: { kind: DeviceKind; children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<Fit>();
  useLayoutEffect(() => {
    const stageElement = stage.current;
    const rowElement = row.current;
    const fitElement = rowElement?.parentElement;
    if (!stageElement || !rowElement || !fitElement) return;
    // The animated figure's preview, whose pointer's points the view keeps.
    const root = stageElement.closest('.catalogue-motion-subject');
    let view = { x: 0, y: 0 };
    const update = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const most =
        parseFloat(getComputedStyle(stageElement).getPropertyValue('--site-device-most')) * rem ||
        Infinity;
      // How long a cut edge's fade is, in the stage's px (DeviceFrame.css).
      const fade =
        (parseFloat(getComputedStyle(fitElement).getPropertyValue('--site-device-fade')) || 0) *
        rem;
      // offsetWidth and offsetHeight are the row's own, before its scale.
      const width = rowElement.offsetWidth;
      const height = rowElement.offsetHeight;
      const room = stageElement.clientWidth;
      if (!width || !height || !room) return;
      const fits = Math.min(1, room / width, most / height);
      const small = parseFloat(
        getComputedStyle(rowElement).getPropertyValue('--env-font-size-body-sm'),
      );
      const least = Math.max(leastScale[kind], small ? leastText / (small * rem) : 0);
      const scale = Math.min(1, Math.max(fits, least));
      // A device cut off at its start or end runs out to the stage's edge there, over its padding,
      // so it fades out at the edge of the stage rather than in a strip inside it.
      const host = stageElement.closest('.site-live-example');
      const hostStyle = host && getComputedStyle(host);
      const pad = {
        start: hostStyle ? parseFloat(hostStyle.paddingLeft) || 0 : 0,
        end: hostStyle ? parseFloat(hostStyle.paddingRight) || 0 : 0,
      };
      const across = width * scale > room + 0.5;
      const shown = {
        width: across ? Math.min(width * scale, room + pad.start + pad.end) : width * scale,
        height: Math.min(height * scale, most),
      };
      // The scale the row is drawn at now, which its points are measured in.
      const drawn = rowElement.getBoundingClientRect().width / width || scale;
      const boxes = root
        ? [
            ...courseOf(root).flatMap((point) => pointBox(rowElement, drawn, point) ?? []),
            ...namedBoxes(rowElement, drawn, root),
          ]
        : [];
      const heading = root && headingOf(root);
      const focus = heading ? pointBox(rowElement, drawn, heading) : undefined;
      const along = (size: number) =>
        root
          ? viewStart(
              width,
              size / scale,
              spanOf(boxes, (box) => [box.left, box.right]),
              focus && [focus.left, focus.right],
              view.x,
              fade / scale,
            )
          : Math.min(width - size / scale, boundaryStart(rowElement, drawn, size / scale));
      let x = along(shown.width);
      const outset = { start: 0, end: 0 };
      if (across && width * scale <= room + pad.start + pad.end) {
        // Whole over the padding: it sits in the middle of the stage.
        outset.start = outset.end = (width * scale - room) / 2;
      } else if (across) {
        // A side that isn't cut keeps the stage's padding.
        const startCut = x > 0.5;
        const endCut = x + shown.width / scale < width - 0.5;
        outset.start = startCut ? pad.start : 0;
        outset.end = endCut ? pad.end : 0;
        shown.width = room + outset.start + outset.end;
        if (!startCut) x = 0;
        else if (!endCut) x = width - shown.width / scale;
        else x = along(shown.width);
      }
      view = {
        x,
        y: viewStart(
          height,
          shown.height / scale,
          spanOf(boxes, (box) => [box.top, box.bottom]),
          focus && [focus.top, focus.bottom],
          view.y,
          fade / scale,
        ),
      };
      const cut = [
        view.y > 0.5 && 'top',
        view.y + shown.height / scale < height - 0.5 && 'bottom',
        view.x > 0.5 && 'start',
        view.x + shown.width / scale < width - 0.5 && 'end',
      ]
        .filter(Boolean)
        .join(' ');
      const next = { scale, ...shown, ...view, cut, outset };
      setFit((current) => (current && sameFit(current, next) ? current : next));
    };
    update();
    // Measured in the next frame: the size it sets resizes the stage it observes.
    let request = 0;
    const later = () => {
      cancelAnimationFrame(request);
      request = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(later);
    observer.observe(stageElement);
    observer.observe(rowElement);
    root?.addEventListener(headingEvent, later);
    // What opens and closes on the screen, such as a pane the pointer heads into, moves the view
    // to what is left of its points.
    const mutations = new MutationObserver(later);
    if (root) mutations.observe(rowElement, { childList: true, attributes: true, subtree: true });
    // The pointer's script names its points as its preview starts, a moment after.
    const timer = setTimeout(later, 600);
    return () => {
      cancelAnimationFrame(request);
      clearTimeout(timer);
      observer.disconnect();
      mutations.disconnect();
      root?.removeEventListener(headingEvent, later);
    };
  }, [kind]);
  return (
    <div
      ref={stage}
      className="site-device-stage"
      style={{ '--site-device-scale': fit?.scale ?? 1 } as CSSProperties}
    >
      <div
        className="site-device-fit"
        data-cut={fit?.cut || undefined}
        style={
          fit && {
            inlineSize: fit.width,
            blockSize: fit.height,
            ...(fit.outset.start + fit.outset.end > 0 && {
              marginLeft: -fit.outset.start,
              marginRight: -fit.outset.end,
            }),
          }
        }
      >
        <div
          ref={row}
          className="site-device-row"
          data-fitted={fit ? '' : undefined}
          style={fit && { translate: `${-fit.x * fit.scale}px ${-fit.y * fit.scale}px` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** The phone's status bar: the time at its start, the signal, the Wi-Fi and the battery at its end. */
function StatusBar() {
  return (
    <div className="site-device-bar" aria-hidden>
      <Text variant="caption" render={<span />} className="site-device-time">
        9:30
      </Text>
      <span className="site-device-glyphs">
        <IconSignalWifi4Bar />
        <IconSignalCellular4Bar />
        <IconBatteryFull />
      </span>
    </div>
  );
}

/** The window's address bar: back, forward and reload, and the address in a pill. */
function AddressBar({ address }: { address: string }) {
  return (
    <div className="site-device-bar" aria-hidden>
      <span className="site-device-glyphs">
        <IconArrowBack />
        <IconArrowForward />
        <IconRefresh />
      </span>
      <span className="site-device-address">
        <IconLock />
        <Text variant="caption" render={<span />}>
          {address}
        </Text>
      </span>
    </div>
  );
}

/**
 * Makes the figure on a screen as tall as the screen, which stands in for its window: the first
 * element on it, and through the wrappers that hold it, down to the example's own root, an envUI
 * part or the box that set its height, such as a Scaffold standing a 22 rem box in for the window.
 * It holds as the figure loads, goes live and comes back.
 */
function useFill(screen: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const element = screen.current;
    if (!element) return;
    // Whether each element filled is where the figure's own height was, read before filling it.
    const filled = new WeakMap<HTMLElement, boolean>();
    const fill = () => {
      let next = [...element.children].find(
        (child) => !child.classList.contains('catalogue-overlay-layer'),
      );
      for (let depth = 0; next instanceof HTMLElement && depth < 4; depth++) {
        const own =
          filled.get(next) ??
          (Boolean(next.style.blockSize) || [...next.classList].some((name) => /^env-/.test(name)));
        filled.set(next, own);
        next.style.blockSize = '100%';
        if (own) break;
        next = next.firstElementChild ?? undefined;
      }
    };
    fill();
    const observer = new MutationObserver(fill);
    observer.observe(element, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [screen]);
}

export interface DeviceFrameProps {
  kind: DeviceKind;
  children: ReactNode;
  /** The address the window's bar shows. */
  address?: string;
  /** What the device is named for assistive technology, such as the figure's subject. */
  label?: string;
}

/**
 * A phone or a window around a figure, at its own size: the stage around it scales it. The screen
 * is the figure's window, a size container named env-window as a width frame is (Stage.css), and
 * the containing block of its fixed overlays; the figure fills it.
 */
export function DeviceFrame({ kind, children, address = 'example.com', label }: DeviceFrameProps) {
  const screen = useRef<HTMLDivElement>(null);
  useFill(screen);
  const size = screens[kind];
  return (
    <div
      className="site-device"
      data-kind={kind}
      role={label ? 'group' : undefined}
      aria-label={label}
    >
      {kind === 'phone' ? <StatusBar /> : <AddressBar address={address} />}
      <div
        ref={screen}
        className="site-device-screen"
        style={{ inlineSize: `${size.width}rem`, blockSize: `${size.height}rem` }}
      >
        <OnScreen value>{children}</OnScreen>
      </div>
      {kind === 'phone' && <span className="site-device-home" aria-hidden />}
    </div>
  );
}

/** A figure on a device of its kind, fitted to its stage. */
export function OnDevice({
  kind,
  label,
  children,
}: {
  kind: DeviceKind;
  label?: string;
  children: ReactNode;
}) {
  return (
    <DeviceStage kind={kind}>
      <DeviceFrame kind={kind} label={label}>
        {children}
      </DeviceFrame>
    </DeviceStage>
  );
}
