import { Fragment, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { PortalContainer } from '@envsemble/envui';
import { sitePopupOpen } from '../motion/SitePopup';

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
 * the room, which keeps them clear of the stage's padding, where the callouts go, or on a do or
 * don't figure's square, the box over it that is drawn smaller to fit it (VerdictFit.ts).
 */
const stageOf = (element: HTMLElement) => {
  const room = element.closest<HTMLElement>('.catalogue-open-example');
  if (room && getComputedStyle(room).contain.includes('layout')) return room;
  return (
    element.closest<HTMLElement>('.site-verdict[data-shape="square"] .site-verdict-fit') ??
    element.closest<HTMLElement>('.site-live-example, .site-verdict-stage, .site-anatomy-stage') ??
    element
  );
};

/**
 * The scale a box is drawn at, such as a do or don't figure's box drawn smaller to fit its square:
 * what the viewport measures, divided by it, is in the box's own px.
 */
const scaleOf = (element: HTMLElement) =>
  (element.offsetWidth && element.getBoundingClientRect().width / element.offsetWidth) || 1;

/**
 * The overlays in the layer: each outermost box that isn't a backdrop or a positioner over the whole
 * stage.
 */
function overlays(layer: HTMLElement) {
  const stage = stageOf(layer);
  const scale = scaleOf(stage);
  const area = { width: stage.clientWidth * scale, height: stage.clientHeight * scale };
  const found: HTMLElement[] = [];
  const visit = (element: Element) => {
    for (const child of element.children) {
      if (!(child instanceof HTMLElement)) continue;
      const box = child.getBoundingClientRect();
      // A backdrop or a positioner is fixed and covers the stage; what it holds is the overlay, even
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
 * gap there; a sheet as tall as the stage needs only its content. On that far side the box that
 * places it may keep a gap of its own, such as a bottom sheet's room above it, which the stage
 * makes room for too. A toast, which covers no page, leaves the room's content, centred, clear of
 * it.
 */
function shortfall(overlay: HTMLElement, layer: HTMLElement, stage: HTMLElement, content: number) {
  const box = overlay.getBoundingClientRect();
  const area = stage.getBoundingClientRect();
  const space = Math.max(gutter, parseFloat(getComputedStyle(stage).paddingTop)) * scaleOf(stage);
  const above = box.top - area.top;
  const below = area.bottom - box.bottom;
  const height = box.height + cutOff(overlay);
  const placer = placerOf(overlay, layer);
  const side = placement(overlay, placer, [above, below]);
  const placerStyle = placer && getComputedStyle(placer);
  const far = (gap: string | undefined) =>
    Math.max(space, (parseFloat(gap ?? '') || 0) * scaleOf(stage));
  let needed = {
    start: above + height + far(placerStyle?.paddingBottom),
    end: far(placerStyle?.paddingTop) + height + below,
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
  const room = subject.querySelector<HTMLElement>('.catalogue-open-example');
  const layer = room?.querySelector('.catalogue-overlay-layer');
  if (!room || !layer) return undefined;
  const found = overlays(layer as HTMLElement);
  if (!found.length || found.some((overlay) => placedOnStage(overlay, layer as HTMLElement)))
    return undefined;
  const content = inFlow(room, layer);
  return content.length ? union(content) : undefined;
}

/**
 * Whether an overlay is on its way in or out: starting or ending its entrance, or in a transition
 * or an animation that ends, unlike a spinner's turn. Its box is then on the way, not where it
 * rests.
 */
const moving = (overlay: HTMLElement) =>
  overlay.closest('[data-starting-style], [data-ending-style]') !== null ||
  overlay.querySelector('[data-starting-style], [data-ending-style]') !== null ||
  overlay
    .getAnimations({ subtree: true })
    .some(
      (animation) =>
        animation.playState === 'running' &&
        animation.effect?.getComputedTiming().iterations !== Infinity,
    );

/**
 * Makes room in the figure for its open overlays, and centres them with what opens them: a popup
 * beside its trigger widens the room on its side, so the two together sit in the middle of the
 * stage; a dialog, a sheet or a toast, placed on the stage, makes the room as tall as it needs.
 * It measures the overlays only where they rest, never on their way in or out. With `hold`, a live
 * figure's, the room the overlays rest open in stays while they are closed, so what opens them
 * stays where it is as they close and open again. Returns whether the room was already made for
 * them, as they rest open: nothing changed.
 */
function fit(room: HTMLElement, layer: HTMLElement, hold: boolean) {
  const found = overlays(layer);
  if (found.some(moving) || (hold && !found.length)) return false;
  const style = getComputedStyle(room);
  // What the viewport measures is drawn at the stage's scale; the room's padding and height are
  // in its own px.
  const scale = scaleOf(stageOf(room));
  const padding = {
    top: parseFloat(style.paddingTop),
    right: parseFloat(style.paddingRight),
    bottom: parseFloat(style.paddingBottom),
    left: parseFloat(style.paddingLeft),
  };
  const content = inFlow(room, layer);
  const anchored: Edges[] = [];
  let grow: number | undefined;
  for (const overlay of found) {
    if (placedOnStage(overlay, layer)) {
      const height = content.length ? union(content).bottom - union(content).top : 0;
      grow = Math.max(grow ?? -Infinity, shortfall(overlay, layer, stageOf(room), height));
    } else anchored.push(overlay.getBoundingClientRect());
  }
  const next = { top: 0, right: 0, bottom: 0, left: 0 };
  if (content.length && anchored.length) {
    const own = union(content);
    const all = union(anchored);
    next.top = Math.max(0, own.top - all.top) / scale;
    next.right = Math.max(0, all.right - own.right) / scale;
    next.bottom = Math.max(0, all.bottom - own.bottom) / scale;
    next.left = Math.max(0, own.left - all.left) / scale;
    // The room's padding at its sides narrows what opens the popups: text, such as a sentence with
    // a link that opens a hover card, would wrap to it, move its link and the popup with it, and be
    // padded narrower again, down to a column of a word or two. What opens them keeps at least
    // the widest popup's width, so a popup about as wide as the stage leaves the text as wide.
    // What is narrower than the room has left it, such as a menu's trigger, is at its own width
    // and keeps only that, with a pixel to spare, so a popup wider than it still centres with it
    // on a narrow stage.
    const widest = Math.max(...anchored.map((box) => box.right - box.left)) / scale;
    const ownWidth = (own.right - own.left) / scale;
    const available = room.clientWidth - padding.left - padding.right;
    const keep = ownWidth < available - 1 ? Math.min(widest, ownWidth + 2) : widest;
    const spare = Math.max(0, room.clientWidth - keep);
    const sides = next.left + next.right;
    if (sides > spare) {
      next.left *= spare / sides;
      next.right *= spare / sides;
    }
  }
  // A popup is placed at whole pixels, and moving the room by a fraction of one can round it to
  // the next: padding that followed every such step would set it trembling, a pixel each frame.
  // Within a pixel, the room stays as it is.
  let changed = false;
  for (const side of ['top', 'right', 'bottom', 'left'] as const)
    if (Math.abs(next[side] - padding[side]) > 1) {
      room.style.setProperty(`padding-${side}`, `${next[side]}px`);
      changed = true;
    }
  // The room grows, or shrinks back, by what the stage lacks or has to spare.
  if (grow !== undefined && Math.abs(grow) > 0.5) {
    const height = (room.getBoundingClientRect().height + grow) / scale;
    const next = `${Math.max(0, Math.ceil(height))}px`;
    if (room.style.minBlockSize !== next) {
      room.style.minBlockSize = next;
      changed = true;
    }
  } else if (grow === undefined && room.style.minBlockSize) {
    room.style.minBlockSize = '';
    changed = true;
  }
  return found.length > 0 && !changed;
}

/**
 * How long a figure's room may wait, in ms, for overlays to rest open in before it shows anyway,
 * such as for an example that opens none.
 */
const placeWait = 600;

/**
 * How far a box scrolls to show an item it holds, by the item's `block` alignment as
 * scrollIntoView takes it; `nearest` scrolls only as far as the item needs.
 */
function scrollDelta(item: DOMRect, box: HTMLElement, block: ScrollLogicalPosition) {
  const top = item.top - box.getBoundingClientRect().top - box.clientTop;
  const bottom = top + item.height;
  if (block === 'start') return top;
  if (block === 'end') return bottom - box.clientHeight;
  if (block === 'center') return (top + bottom - box.clientHeight) / 2;
  if (top < 0) return top;
  return Math.max(0, bottom - box.clientHeight);
}

/**
 * Keeps an open example's scrolling inside it. A popup shown open scrolls its chosen item into view
 * as it opens, as a select's list does, and the browser's scrollIntoView scrolls every box around
 * the item, the page's body included: a page with such a picture opened partway down, wherever the
 * picture was, and a gallery tile scrolled the page as it rendered. Within an open example, or an
 * animated figure, whose menus highlight their items as the pointer no one sees runs down them,
 * scrollIntoView scrolls only the boxes inside it, such as the popup's list.
 */
function keepScrollingInOpenExamples() {
  if (typeof Element === 'undefined') return;
  const native = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = function (
    this: Element,
    options?: boolean | ScrollIntoViewOptions,
  ) {
    const example = this.closest('.catalogue-open-example, .catalogue-motion-subject');
    if (!example) return native.call(this, options);
    const block =
      typeof options === 'object'
        ? (options.block ?? 'start')
        : options === false
          ? 'end'
          : 'start';
    for (let box = this.parentElement; box && box !== example; box = box.parentElement) {
      if (box.scrollHeight <= box.clientHeight) continue;
      if (!/auto|scroll/.test(getComputedStyle(box).overflowY)) continue;
      box.scrollTop += scrollDelta(this.getBoundingClientRect(), box, block);
    }
  };
}
keepScrollingInOpenExamples();

/**
 * Keeps a live example's focus to itself until the reader reaches for it. An overlay pressed open
 * as the page loads, such as a select's list, moves focus to its chosen item as an opened list
 * does, which would take focus from the page, and scroll it, wherever the reader was; until a
 * pointer or the keyboard reaches the example (`data-touched`), a call to focus an element in it
 * does nothing.
 */
function keepFocusOutOfUntouchedExamples() {
  if (typeof HTMLElement === 'undefined') return;
  const native = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function (this: HTMLElement, options?: FocusOptions) {
    if (this.closest('.catalogue-open-example[data-live]:not([data-touched])')) return;
    native.call(this, options);
  };
}
keepFocusOutOfUntouchedExamples();

/**
 * What opens an example's overlay: its trigger, which names the popup it opens, or else, as for a
 * palette a plain button opens, its first button.
 */
const triggerOf = (room: HTMLElement) =>
  room.querySelector<HTMLElement>('[aria-haspopup]:not([aria-expanded="true"])') ??
  room.querySelector<HTMLElement>('button:not(:disabled)');

/**
 * Opens a live example's overlay as a press on its trigger would, without taking focus: the
 * events a pointer's press sends, in order, at the trigger's middle.
 */
function press(trigger: HTMLElement) {
  const box = trigger.getBoundingClientRect();
  const init = {
    bubbles: true,
    cancelable: true,
    composed: true,
    clientX: box.left + box.width / 2,
    clientY: box.top + box.height / 2,
    view: window,
  };
  const pointer = { ...init, pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0 };
  trigger.dispatchEvent(new PointerEvent('pointerdown', { ...pointer, buttons: 1 }));
  trigger.dispatchEvent(new MouseEvent('mousedown', { ...init, buttons: 1, detail: 1 }));
  trigger.dispatchEvent(new PointerEvent('pointerup', pointer));
  trigger.dispatchEvent(new MouseEvent('mouseup', { ...init, detail: 1 }));
  trigger.dispatchEvent(new MouseEvent('click', { ...init, detail: 1 }));
}

/**
 * Opens a live example's overlay once, as it first renders, where the example doesn't open it
 * itself: pressed open, its trigger stays what it is in the code, closed until used.
 */
function useOpenOnce(
  room: HTMLElement | null,
  layer: HTMLElement | null,
  live: boolean,
  round: number,
) {
  useLayoutEffect(() => {
    if (!live || !room || !layer) return;
    let frame = 0;
    let done = false;
    const attempt = () => {
      if (done) return;
      // The example may still be loading, or open its overlay itself, such as with defaultOpen.
      if (layer.childElementCount && overlays(layer).length) return finish();
      const trigger = triggerOf(room);
      if (!trigger) return;
      // A frame later, once the example has laid out, so its popup is placed beside it.
      frame = requestAnimationFrame(() => {
        if (done) return;
        if (!overlays(layer).length) press(trigger);
        finish();
      });
    };
    const changes = new MutationObserver(attempt);
    const finish = () => {
      done = true;
      changes.disconnect();
    };
    changes.observe(room, { childList: true, subtree: true });
    attempt();
    return () => {
      cancelAnimationFrame(frame);
      finish();
    };
  }, [room, layer, live, round]);
}

/** How long, in ms, a live example's closed overlay waits, with the reader gone, to rest open. */
const restDelay = 800;

/**
 * Brings a live example back to rest, its overlay open, once the reader has closed it and left: a
 * while after the pointer has left the example and focus is outside it, the example is drawn anew,
 * as it first rendered, and opened again (useOpenOnce), without taking focus, so an overview never
 * stays a lone trigger in an empty stage. Returns the round, which keys the example.
 */
function useRestOpen(room: HTMLElement | null, layer: HTMLElement | null, live: boolean) {
  const [round, setRound] = useState(0);
  useLayoutEffect(() => {
    if (!live || !room || !layer) return;
    let timer = 0;
    let shown = false;
    const open = () => layer.childElementCount > 0 && overlays(layer).length > 0;
    // Another popup open on the page, such as the Display menu: opening the example's own would
    // close it, so the example waits until it has closed.
    const elsewhere = sitePopupOpen;
    const away = () =>
      !room.matches(':hover') && !room.contains(document.activeElement) && !elsewhere();
    const rest = () => {
      timer = 0;
      if (open()) return;
      if (!away()) {
        // Still near it, or another popup is open: look again a while later.
        timer = window.setTimeout(rest, restDelay);
        return;
      }
      // At rest again, it keeps its focus to itself until the reader reaches for it once more.
      delete room.dataset.touched;
      shown = false;
      setRound((current) => current + 1);
    };
    const check = () => {
      if (open()) {
        shown = true;
        window.clearTimeout(timer);
        timer = 0;
        return;
      }
      if (!shown || timer) return;
      timer = window.setTimeout(rest, restDelay);
    };
    const changes = new MutationObserver(check);
    changes.observe(layer, { childList: true, subtree: true });
    room.addEventListener('pointerleave', check);
    room.addEventListener('focusout', check);
    check();
    return () => {
      window.clearTimeout(timer);
      changes.disconnect();
      room.removeEventListener('pointerleave', check);
      room.removeEventListener('focusout', check);
    };
  }, [room, layer, live]);
  return round;
}

/**
 * An example shown with its overlays open, as a picture: its dialogs, menus, tooltips and toasts
 * render into a layer of the figure through envUI's PortalContainer, contained, so they neither
 * lock the page's scroll, take focus nor close when the reader presses elsewhere, and sit inside
 * the stage, centred with what opens them. The example opens them itself, such as with
 * `defaultOpen`. The whole is inert: a picture people read, not a control they use. A `live` one,
 * a page's overview, is the component at rest open, which people can use: it isn't inert, and
 * where the example doesn't open its overlay itself, it is pressed open once as it first renders;
 * closed by the reader, it comes back to rest open once they leave it (useRestOpen).
 */
export function OpenExample({
  name,
  live = false,
  children,
}: {
  name: string;
  /** Whether people can use it, its overlay pressed open where the example doesn't open it. */
  live?: boolean;
  children: ReactNode;
}) {
  const room = useRef<HTMLDivElement>(null);
  const [roomElement, setRoomElement] = useState<HTMLDivElement | null>(null);
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  const round = useRestOpen(roomElement, layer, live);
  useOpenOnce(roomElement, layer, live, round);
  // The reader reaching for it, by a pointer or the keyboard, lets it take focus from then on.
  useLayoutEffect(() => {
    if (!live || !roomElement) return;
    const touch = (event: Event) => {
      if (event.isTrusted) roomElement.dataset.touched = '';
    };
    const kinds = ['pointerdown', 'keydown', 'focusin'] as const;
    for (const kind of kinds) roomElement.addEventListener(kind, touch, true);
    return () => {
      for (const kind of kinds) roomElement.removeEventListener(kind, touch, true);
    };
  }, [live, roomElement]);
  useLayoutEffect(() => {
    const roomElement = room.current;
    if (!roomElement || !layer) return;
    let frame = 0;
    let timer = 0;
    // The figure shows once its room is made for its overlays resting open, fading in, so nothing
    // in it moves as it appears (Stage.css): or a while after its example has loaded, whatever
    // they do. While the example loads, its skeleton shows in the room.
    const place = () => {
      roomElement.dataset.placed = '';
    };
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (fit(roomElement, layer, live)) place();
        else if (!timer && !roomElement.querySelector('.site-loading'))
          timer = window.setTimeout(place, placeWait);
      });
    };
    update();
    // The room follows the overlays as they open, are placed, come to rest and resize, and the
    // stage's width.
    const resize = new ResizeObserver(update);
    resize.observe(roomElement);
    const mutation = new MutationObserver(update);
    mutation.observe(roomElement, {
      childList: true,
      subtree: true,
      attributeFilter: [
        'class',
        'style',
        'data-side',
        'hidden',
        'data-starting-style',
        'data-ending-style',
      ],
    });
    roomElement.addEventListener('transitionend', update);
    roomElement.addEventListener('animationend', update);
    void document.fonts?.ready.then(update);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      resize.disconnect();
      mutation.disconnect();
      roomElement.removeEventListener('transitionend', update);
      roomElement.removeEventListener('animationend', update);
    };
  }, [layer, live]);
  return (
    <div
      ref={(element) => {
        room.current = element;
        setRoomElement(element);
      }}
      className="catalogue-open-example"
      data-open-example={name}
      data-live={live ? '' : undefined}
      inert={!live}
    >
      <PortalContainer container={layer} contained>
        <Fragment key={round}>{children}</Fragment>
      </PortalContainer>
      <div ref={setLayer} className="catalogue-overlay-layer" />
    </div>
  );
}
