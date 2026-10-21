import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { PortalContainer } from '@envsemble/envui';

/** The least room a dialog, a sheet or a toast keeps from the stage's edges, in px. */
const gutter = 16;

export interface Edges {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const union = (boxes: Edges[]): Edges => ({
  top: Math.min(...boxes.map((box) => box.top)),
  right: Math.max(...boxes.map((box) => box.right)),
  bottom: Math.max(...boxes.map((box) => box.bottom)),
  left: Math.min(...boxes.map((box) => box.left)),
});

/**
 * The box that places the figure's dialogs, sheets and toasts: the stage, or in an anatomy figure,
 * the room, which keeps them clear of the stage's padding, where the callouts go.
 */
const stageOf = (element: HTMLElement) => {
  const room = element.closest<HTMLElement>('.docs-open-example');
  if (room && getComputedStyle(room).contain.includes('layout')) return room;
  return (
    element.closest<HTMLElement>('.docs-live-example, .docs-verdict-stage, .docs-anatomy-stage') ??
    element
  );
};

/**
 * The overlays in the layer: each outermost box that isn't a scrim or a positioner over the whole
 * stage.
 */
function overlays(layer: HTMLElement) {
  const stage = stageOf(layer);
  const area = { width: stage.clientWidth, height: stage.clientHeight };
  const found: HTMLElement[] = [];
  const visit = (element: Element) => {
    for (const child of element.children) {
      if (!(child instanceof HTMLElement)) continue;
      const box = child.getBoundingClientRect();
      // A scrim or a positioner is fixed and covers the stage; what it holds is the overlay, even
      // where that fills the stage too, such as a sheet in a narrow figure.
      const covers =
        box.width >= area.width - 1 &&
        box.height >= area.height - 1 &&
        getComputedStyle(child).position === 'fixed';
      if (box.width > 1 && box.height > 1 && !covers) found.push(child);
      else visit(child);
    }
  };
  visit(layer);
  return found;
}

/**
 * Whether an overlay is placed on the stage, as a dialog, a sheet or a toast is, rather than
 * beside its anchor, as a popup is: its nearest positioned box within the layer is fixed.
 */
function placedOnStage(element: HTMLElement, layer: HTMLElement) {
  for (let node: HTMLElement | null = element; node && node !== layer; node = node.parentElement) {
    const position = getComputedStyle(node).position;
    if (position === 'fixed') return true;
    if (position === 'absolute') return false;
  }
  return false;
}

/**
 * How much taller an overlay would be at its content's height: a dialog's height may be capped at
 * the stage's, and a list in it scrolls there. The figure grows again until nothing is cut off.
 */
function cutOff(overlay: HTMLElement) {
  const cut = (element: HTMLElement) => Math.max(0, element.scrollHeight - element.clientHeight);
  let inner = 0;
  for (const element of overlay.querySelectorAll<HTMLElement>('*'))
    if (/auto|scroll/.test(getComputedStyle(element).overflowY))
      inner = Math.max(inner, cut(element));
  return cut(overlay) + inner;
}

/** The fixed box that places an overlay, such as a dialog's positioner, if another does. */
function placerOf(overlay: HTMLElement, layer: HTMLElement) {
  for (let node = overlay.parentElement; node && node !== layer; node = node.parentElement)
    if (getComputedStyle(node).position === 'fixed') return node;
  return undefined;
}

/**
 * Where on the stage an overlay is placed: by the alignment of the box that places it, or where
 * it places itself, such as toasts, by its placement attribute, else by the nearer edge.
 */
function placement(overlay: HTMLElement, placer: HTMLElement | undefined, gaps: [number, number]) {
  if (!placer) {
    const named = overlay.dataset.placement ?? overlay.dataset.side ?? '';
    if (/bottom/.test(named)) return 'end';
    if (/top/.test(named)) return 'start';
    return gaps[1] < gaps[0] ? 'end' : 'start';
  }
  const align = getComputedStyle(placer).alignItems;
  if (/end/.test(align)) return 'end';
  if (/start/.test(align)) return 'start';
  return /stretch|normal/.test(align) ? 'stretch' : 'center';
}

/**
 * How much taller the stage must grow for an overlay placed on it: room for its content, and the
 * stage's padding, at least a gutter, on each side of a centred one, or on the far side of one
 * placed at an edge, such as a palette near the top or a toast at the bottom, which keeps its own
 * gap there; a sheet as tall as the stage needs only its content. A toast, which covers no page,
 * leaves the room's content, centred, clear of it.
 */
function shortfall(overlay: HTMLElement, layer: HTMLElement, stage: HTMLElement, content: number) {
  const box = overlay.getBoundingClientRect();
  const area = stage.getBoundingClientRect();
  const space = Math.max(gutter, parseFloat(getComputedStyle(stage).paddingTop));
  const above = box.top - area.top;
  const below = area.bottom - box.bottom;
  const height = box.height + cutOff(overlay);
  const placer = placerOf(overlay, layer);
  const side = placement(overlay, placer, [above, below]);
  let needed = {
    start: above + height + space,
    end: space + height + below,
    center: height + 2 * space,
    stretch: height,
  }[side];
  if (!placer && content && (side === 'start' || side === 'end'))
    needed = Math.max(needed, content + 2 * (space + height + Math.min(above, below)));
  return needed - area.height;
}

/** What opens the overlays, in the flow: not the layer, nor the focus guards beside a trigger. */
function inFlow(room: HTMLElement, layer: Element) {
  return [...room.children]
    .filter((child) => child !== layer && !/absolute|fixed/.test(getComputedStyle(child).position))
    .map((child) => child.getBoundingClientRect())
    .filter((box) => box.width || box.height);
}

/**
 * The box of what opens a figure's popups, such as a select's field, where its popups open beside
 * it rather than over it: an anatomy figure's callouts keep clear of it.
 */
export function openerBox(subject: HTMLElement): Edges | undefined {
  const room = subject.querySelector<HTMLElement>('.docs-open-example');
  const layer = room?.querySelector('.docs-overlay-layer');
  if (!room || !layer) return undefined;
  const found = overlays(layer as HTMLElement);
  if (!found.length || found.some((overlay) => placedOnStage(overlay, layer as HTMLElement)))
    return undefined;
  const content = inFlow(room, layer);
  return content.length ? union(content) : undefined;
}

/**
 * Makes room in the figure for its open overlays, and centres them with what opens them: a popup
 * beside its trigger widens the room on its side, so the two together sit in the middle of the
 * stage; a dialog, a sheet or a toast, placed on the stage, makes the room as tall as it needs.
 */
function fit(room: HTMLElement, layer: HTMLElement) {
  const style = getComputedStyle(room);
  const padding = {
    top: parseFloat(style.paddingTop),
    right: parseFloat(style.paddingRight),
    bottom: parseFloat(style.paddingBottom),
    left: parseFloat(style.paddingLeft),
  };
  const content = inFlow(room, layer);
  const anchored: Edges[] = [];
  let grow: number | undefined;
  for (const overlay of overlays(layer)) {
    if (placedOnStage(overlay, layer)) {
      const height = content.length ? union(content).bottom - union(content).top : 0;
      grow = Math.max(grow ?? -Infinity, shortfall(overlay, layer, stageOf(room), height));
    } else anchored.push(overlay.getBoundingClientRect());
  }
  const next = { top: 0, right: 0, bottom: 0, left: 0 };
  if (content.length && anchored.length) {
    const own = union(content);
    const all = union(anchored);
    next.top = Math.max(0, own.top - all.top);
    next.right = Math.max(0, all.right - own.right);
    next.bottom = Math.max(0, all.bottom - own.bottom);
    next.left = Math.max(0, own.left - all.left);
  }
  for (const side of ['top', 'right', 'bottom', 'left'] as const)
    if (Math.abs(next[side] - padding[side]) > 0.5)
      room.style.setProperty(`padding-${side}`, `${next[side]}px`);
  // The room grows, or shrinks back, by what the stage lacks or has to spare.
  if (grow !== undefined && Math.abs(grow) > 0.5) {
    const height = room.getBoundingClientRect().height + grow;
    const next = `${Math.max(0, Math.ceil(height))}px`;
    if (room.style.minBlockSize !== next) room.style.minBlockSize = next;
  } else if (grow === undefined && room.style.minBlockSize) room.style.minBlockSize = '';
}

/**
 * An example shown with its overlays open, as a picture: its dialogs, menus, tooltips and toasts
 * render into a layer of the figure through envUI's PortalContainer, contained, so they neither
 * lock the page's scroll, take focus nor close when the reader presses elsewhere, and sit inside
 * the stage, centred with what opens them. The example opens them itself, such as with
 * `defaultOpen`. The whole is inert: a picture people read, not a control they use.
 */
export function OpenExample({ name, children }: { name: string; children: ReactNode }) {
  const room = useRef<HTMLDivElement>(null);
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const roomElement = room.current;
    if (!roomElement || !layer) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => fit(roomElement, layer));
    };
    update();
    // The room follows the overlays as they open, are placed and resize, and the stage's width.
    const resize = new ResizeObserver(update);
    resize.observe(roomElement);
    const mutation = new MutationObserver(update);
    mutation.observe(roomElement, {
      childList: true,
      subtree: true,
      attributeFilter: ['class', 'style', 'data-side', 'hidden'],
    });
    void document.fonts?.ready.then(update);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
    };
  }, [layer]);
  return (
    <div ref={room} className="docs-open-example" data-open-example={name} inert>
      <PortalContainer container={layer} contained>
        {children}
      </PortalContainer>
      <div ref={setLayer} className="docs-overlay-layer" />
    </div>
  );
}
