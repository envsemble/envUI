import type { PanelDockPanel } from '../Root.js';

/** Where a panel shows: in the row, filling the region, or out of sight behind its tab. */
export type Placement = 'row' | 'fill' | 'hidden';

export interface HeightBounds {
  min: number;
  max: number;
  /** The block size open panels have: the dock's height below the row's gutter. */
  room: number;
}

export interface ScrollPosition {
  element: Element;
  top: number;
  left: number;
}

/** A tab's press in a stacked dock: the panel to show, the panel active then, and when. */
export interface TabChoice {
  id: string;
  active: string | undefined;
  /** The time the tab brought its panel forward, on the dock's clock of recency. */
  time: number;
}

/** The panel whose content, or a popup it opened, took focus last, and the element that took it. */
export interface FocusedPanel {
  id: string;
  element: EventTarget;
}

/**
 * The panel or tab of this dock that holds focus, read before an update is committed: focus in the
 * dock, or elsewhere in a popup that the panel whose content last took focus opened.
 */
export function locateFocus(dock: HTMLElement | null, focusedPanel: FocusedPanel | null) {
  const page = dock?.ownerDocument;
  const focused = page?.activeElement;
  if (!dock || !(focused instanceof HTMLElement) || focused === page?.body) return null;
  if (!dock.contains(focused))
    return focusedPanel?.element === focused
      ? { id: focusedPanel.id, tab: false, popup: true, element: focused }
      : null;
  const owner = focused.closest<HTMLElement>('.env-panel-dock-panel, .env-panel-dock-tab');
  if (!owner || owner.closest('.env-panel-dock') !== dock || owner.dataset.panelId === undefined)
    return null;
  return {
    id: owner.dataset.panelId,
    tab: owner.classList.contains('env-panel-dock-tab'),
    popup: false,
    element: focused,
  };
}

/**
 * The panel a tab asked a stacked dock to show, while that choice holds, as long as the same panel
 * is active: that panel while it is there, or the panel that appeared or was brought forward last
 * since, which takes the choice over, so a panel that opens shows. A panel not recorded yet has just
 * appeared.
 */
export function heldChoice(
  choice: TabChoice | null,
  panels: readonly PanelDockPanel[],
  activeId: string | undefined,
  times: Map<string, number>,
) {
  if (!choice || choice.active !== activeId) return undefined;
  let held = panels.some((panel) => panel.id === choice.id) ? choice.id : undefined;
  let latest = choice.time;
  for (const panel of panels) {
    if (panel.id === choice.id || panel.mode === 'minimized') continue;
    const time = times.get(panel.id) ?? Infinity;
    if (time > latest) {
      held = panel.id;
      latest = time;
    }
  }
  return held;
}

/** The candidate that appeared or was brought forward last; one never recorded is the newest. */
export function newest<T extends PanelDockPanel>(
  candidates: readonly T[],
  times: Map<string, number>,
) {
  let found: T | undefined;
  let latest = -Infinity;
  for (const panel of candidates) {
    const time = times.get(panel.id) ?? Infinity;
    if (time >= latest) {
      found = panel;
      latest = time;
    }
  }
  return found;
}

/** The candidate brought forward longest ago; of those never recorded, the first. */
export function oldest<T extends PanelDockPanel>(
  candidates: readonly T[],
  times: Map<string, number>,
) {
  let found: T | undefined;
  let earliest = Infinity;
  for (const panel of candidates) {
    const time = times.get(panel.id) ?? Infinity;
    if (!found || time < earliest) {
      found = panel;
      earliest = time;
    }
  }
  return found;
}

/** The elements inside the panels that are scrolled away from their start. */
export function readScrollPositions(rowElement: Element) {
  const positions: ScrollPosition[] = [];
  for (const element of rowElement.querySelectorAll('*'))
    if (element.scrollTop !== 0 || element.scrollLeft !== 0)
      positions.push({ element, top: element.scrollTop, left: element.scrollLeft });
  return positions;
}

/**
 * Brings an element that the panel hides entirely into view, also one beneath the sticky header,
 * inside a list that scrolls on its own or beside the view. Only the panel's own scrolling elements
 * scroll, as little as shows it, from the innermost out: lists or rows inside the content, then the
 * content. One that partly shows keeps the scroll positions people left. Returns the part of the
 * element that shows.
 */
export function revealInContent(frame: HTMLElement, element: HTMLElement) {
  const content = frame.querySelector<HTMLElement>(':scope > .env-panel-dock-content');
  if (!content?.contains(element)) return element.getBoundingClientRect();
  const scrollers: HTMLElement[] = [];
  for (let box = element.parentElement; box && box !== content; box = box.parentElement)
    if (scrollsOverflow(box)) scrollers.push(box);
  scrollers.push(content);
  if (!shownPart(element, scrollers))
    for (const scroller of scrollers) {
      const area = viewArea(scroller);
      const target = element.getBoundingClientRect();
      scroller.scrollTop += nearestScroll(target.top, target.bottom, area.top, area.bottom);
      scroller.scrollLeft += nearestScroll(target.left, target.right, area.left, area.right);
    }
  return shownPart(element, scrollers) ?? element.getBoundingClientRect();
}

/**
 * Scrolls the page alone, as little as shows it, to the part of a focused element that shows,
 * where that lies entirely outside the window, as where the dock is partly out of view, so focus
 * never goes out of sight; where some of it shows in the window, the page stays where people left
 * it.
 */
export function revealInWindow(view: Window | null, shown: Area) {
  if (!view) return;
  if (
    shown.bottom > 0 &&
    shown.top < view.innerHeight &&
    shown.right > 0 &&
    shown.left < view.innerWidth
  )
    return;
  view.scrollBy({
    top: nearestScroll(shown.top, shown.bottom, 0, view.innerHeight),
    left: nearestScroll(shown.left, shown.right, 0, view.innerWidth),
  });
}

/** Whether an element scrolls content that overflows it, on either axis. */
function scrollsOverflow(element: HTMLElement) {
  const style = getComputedStyle(element);
  const scrolls = (value: string) => value === 'auto' || value === 'scroll' || value === 'hidden';
  return (
    (scrolls(style.overflowY) && element.scrollHeight > element.clientHeight) ||
    (scrolls(style.overflowX) && element.scrollWidth > element.clientWidth)
  );
}

/** An area in the viewport, in pixels. */
export interface Area {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/** Where a scrolling element shows its content, within its scroll padding, in the viewport. */
function viewArea(scroller: HTMLElement): Area {
  const box = scroller.getBoundingClientRect();
  const style = getComputedStyle(scroller);
  const top = box.top + scroller.clientTop;
  const left = box.left + scroller.clientLeft;
  return {
    top: top + (parseFloat(style.scrollPaddingTop) || 0),
    bottom: top + scroller.clientHeight - (parseFloat(style.scrollPaddingBottom) || 0),
    left: left + (parseFloat(style.scrollPaddingLeft) || 0),
    right: left + scroller.clientWidth - (parseFloat(style.scrollPaddingRight) || 0),
  };
}

/** The part of an element that shows through every one of these scrolling elements, if any. */
function shownPart(element: HTMLElement, scrollers: readonly HTMLElement[]): Area | undefined {
  let { top, bottom, left, right } = element.getBoundingClientRect();
  for (const scroller of scrollers) {
    const area = viewArea(scroller);
    top = Math.max(top, area.top);
    bottom = Math.min(bottom, area.bottom);
    left = Math.max(left, area.left);
    right = Math.min(right, area.right);
  }
  return bottom > top && right > left ? { top, bottom, left, right } : undefined;
}

/**
 * How far to scroll on one axis so a span shows in an area: as little as shows it, and from its
 * start where it is larger than the area.
 */
function nearestScroll(start: number, end: number, areaStart: number, areaEnd: number) {
  if (start < areaStart) return start - areaStart;
  if (end > areaEnd) return Math.min(start - areaStart, end - areaEnd);
  return 0;
}

export function isShown(placement: Placement | undefined) {
  return placement === 'row' || placement === 'fill';
}

export function clampRound(value: number, min: number, max: number) {
  return Math.round(Math.min(max, Math.max(min, value)));
}

export function pixels(value: number | undefined) {
  return value === undefined ? undefined : `${value}px`;
}

/** The inline size the row has for its panels, and the gap between them, in pixels. */
export function rowRoom(rowElement: HTMLElement) {
  const style = getComputedStyle(rowElement);
  const padding =
    (parseFloat(style.paddingInlineStart) || 0) + (parseFloat(style.paddingInlineEnd) || 0);
  return { size: rowElement.clientWidth - padding, gap: parseFloat(style.columnGap) || 0 };
}

/** Whether panels of these minimum widths fit side by side in the row. */
export function fitsInRow(room: { size: number; gap: number }, widths: readonly number[]) {
  let total = -room.gap;
  for (const width of widths) total += width + room.gap;
  return total <= room.size + 1;
}

/** The narrowest a panel gets in the row, with its borders and margins. */
export function minimumWidth(frame: HTMLElement | undefined) {
  if (!frame) return 0;
  const style = getComputedStyle(frame);
  const length = (value: string) => parseFloat(value) || 0;
  const edges =
    style.boxSizing === 'border-box'
      ? 0
      : length(style.borderInlineStartWidth) +
        length(style.borderInlineEndWidth) +
        length(style.paddingInlineStart) +
        length(style.paddingInlineEnd);
  return (
    length(style.minInlineSize) +
    edges +
    length(style.marginInlineStart) +
    length(style.marginInlineEnd)
  );
}

export function overflows(rowElement: HTMLElement) {
  return rowElement.scrollWidth - rowElement.clientWidth > 1;
}

export function isAtRowEnd(rowElement: HTMLElement) {
  return rowElement.scrollWidth - rowElement.clientWidth - Math.abs(rowElement.scrollLeft) <= 1;
}

export function scrollToRowEnd(rowElement: HTMLElement) {
  const end = rowElement.scrollWidth - rowElement.clientWidth;
  rowElement.scrollLeft = getComputedStyle(rowElement).direction === 'rtl' ? -end : end;
}

/** Scrolls the row, and only the row, so the frame shows between its padding edges. */
export function reveal(rowElement: HTMLElement, frame: HTMLElement) {
  const style = getComputedStyle(rowElement);
  const area = rowElement.getBoundingClientRect();
  const start = area.left + parseFloat(style.paddingLeft);
  const end = area.right - parseFloat(style.paddingRight);
  const box = frame.getBoundingClientRect();
  if (box.right > end) rowElement.scrollLeft += box.right - end;
  else if (box.left < start) rowElement.scrollLeft -= start - box.left;
}
