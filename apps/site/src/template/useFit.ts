import { useLayoutEffect, useRef, type RefObject } from 'react';
import {
  courseOf,
  headingEvent,
  headingOf,
  holdsView,
  mustShowOf,
  type Heading,
} from '../motion/MustShow';
import { aimedElement } from '../motion/PointerPlan';

/** The least room, in px, between a preview and its stage's edges. */
const inset = 16;

/** The most a page's own tile is enlarged: written for its small window, it is drawn large. */
const most = 2;

/** The least a pattern's scene is drawn at in a gallery, so its words stay legible. */
const legibleScale = 0.8;

/** Whether a color paints anything: not transparent, nor of no alpha. */
const opaque = (color: string) =>
  color !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(color) && !/\/\s*0\)$/.test(color);

/**
 * Whether an element is clipped away whole, as a visually hidden one is (`clip-path: inset(50%)`),
 * such as a notification region's announcer, which only a screen reader reads.
 */
const clippedAway = (style: CSSStyleDeclaration) => /^inset\((50|100)%/.test(style.clipPath);

/** Whether an element is coming or going: starting its entrance, or in a transition or animation. */
const moving = (element: Element) =>
  element.closest('[data-starting-style], [data-ending-style]') !== null ||
  (element.getAnimations?.().length ?? 0) > 0;

/**
 * Whether an element is on its way somewhere: it or a box around it, inside the canvas, starting or
 * ending its entrance, or in a transition or an animation that ends, unlike a spinner's.
 */
function settling(element: Element, canvas: Element) {
  if (element.closest('[data-starting-style], [data-ending-style]')) return true;
  for (let node: Element | null = element; node && node !== canvas; node = node.parentElement) {
    const ends = (node.getAnimations?.() ?? []).some(
      (animation) =>
        animation.playState === 'running' &&
        animation.effect?.getComputedTiming().iterations !== Infinity,
    );
    if (ends) return true;
  }
  return false;
}

/** Elements that are their own picture, whatever their style. */
const pictures = /^(img|svg|canvas|video|input|textarea|select|hr)$/i;

/**
 * Whether an element paints something of its own: a fill, an image, an edge, a shadow, text, or a
 * picture such as an icon. A box that only lays out others, such as an avatar group's row, which
 * keeps the room its avatars spread into, paints nothing, so what it holds is measured instead.
 */
function paints(element: Element, style: CSSStyleDeclaration) {
  if (pictures.test(element.localName)) return true;
  if (opaque(style.backgroundColor) || style.backgroundImage !== 'none') return true;
  if (style.boxShadow !== 'none') return true;
  for (const side of ['Top', 'Right', 'Bottom', 'Left'] as const)
    if (
      parseFloat(style.getPropertyValue(`border-${side.toLowerCase()}-width`)) > 0 &&
      style.getPropertyValue(`border-${side.toLowerCase()}-style`) !== 'none' &&
      opaque(style.getPropertyValue(`border-${side.toLowerCase()}-color`))
    )
      return true;
  return [...element.childNodes].some(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
  );
}

/**
 * The boxes a preview paints, in the canvas's own px (paints), so what is centred is what shows
 * rather than the boxes that lay it out. A backdrop or a positioner over the whole canvas, such as a
 * dialog's, counts only for what it holds; what is hidden, transparent or a visually hidden pixel
 * doesn't count.
 */
function shownBoxes(canvas: HTMLElement) {
  const frame = canvas.getBoundingClientRect();
  const scale = frame.width / canvas.offsetWidth || 1;
  const area = { width: canvas.offsetWidth, height: canvas.offsetHeight };
  const found: { element: Element; box: DOMRect }[] = [];
  // What a box that clips its content, such as a scrolling list, holds outside it doesn't show:
  // each box counts as far as the boxes around it that clip show it.
  const visit = (element: Element, clip: DOMRect | null) => {
    for (const child of element.children) {
      const style = getComputedStyle(child);
      if (style.display === 'none' || clippedAway(style)) continue;
      // What is transparent doesn't show, unless it is on its way in or out, such as a popup
      // starting its entrance: the view is placed for it, rather than without it and back.
      if (style.opacity === '0' && !moving(child)) continue;
      // A row hidden past the crop's foot (trimRows) still counts, so hiding it moves nothing.
      if (style.visibility === 'hidden' && !child.closest('[data-catalogue-past]')) continue;
      const rect = child.getBoundingClientRect();
      const box = within(
        new DOMRect(
          (rect.left - frame.left) / scale,
          (rect.top - frame.top) / scale,
          rect.width / scale,
          rect.height / scale,
        ),
        clip,
      );
      const covers =
        box.width >= area.width - 1 &&
        box.height >= area.height - 1 &&
        /absolute|fixed/.test(style.position);
      if (box.width > 1 && box.height > 1 && !covers && paints(child, style))
        found.push({ element: child, box });
      // Text counts as far as it runs, also past a box narrower than it, such as a heatmap's
      // month names over columns of no width.
      for (const node of child.childNodes) {
        if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const drawn = range.getBoundingClientRect();
        const text = within(
          new DOMRect(
            (drawn.left - frame.left) / scale,
            (drawn.top - frame.top) / scale,
            drawn.width / scale,
            drawn.height / scale,
          ),
          clip,
        );
        if (text.width > 1 && text.height > 1) found.push({ element: child, box: text });
      }
      // A picture's parts are the picture; anything else may hold more that shows.
      const clips = style.overflowX !== 'visible' || style.overflowY !== 'visible';
      if (!pictures.test(child.localName)) visit(child, clips ? box : clip);
    }
  };
  visit(canvas, null);
  return found;
}

/**
 * The rows of a list, a menu, a table, a tree or a picker's column, the cards of a pager, and the
 * parts of a dialog, such as its heading, a field, a checkbox or its actions: each drawn whole or
 * not at all at a crop's foot.
 */
const rowSelector = [
  ...['menuitem', 'menuitemradio', 'menuitemcheckbox', 'option', 'row', 'treeitem'].map(
    (role) => `[role='${role}']`,
  ),
  'li',
  'tr',
  '.env-time-list-row',
  '.env-pager-link',
  '.env-dialog-content > *',
  '.env-dialog-content .env-checkbox',
].join(', ');

/** How far, in px, a row may reach past the crop's foot and still count as whole. */
const rowSlack = 2;

/**
 * Where a picture is cut off at its foot, hides each row that reaches past it and fades out only
 * below the rows that stay, so it ends on a whole row, the surface under it fading out, rather than
 * in a slice through one (Gallery.css). A row that holds others, such as a tree's branch, is left
 * to its rows.
 */
function trimRows(canvas: HTMLElement, played = false) {
  const crop = canvas.parentElement;
  if (!crop?.classList.contains('catalogue-related-crop')) return;
  if (!canvas.dataset.cut?.split(' ').includes('bottom')) {
    for (const row of canvas.querySelectorAll<HTMLElement>('[data-catalogue-past]'))
      delete row.dataset.cataloguePast;
    crop.style.removeProperty('--catalogue-crop-bottom');
    return;
  }
  const { top, height } = crop.getBoundingClientRect();
  let kept = -Infinity;
  for (const row of canvas.querySelectorAll<HTMLElement>(rowSelector)) {
    const bottom = row.getBoundingClientRect().bottom - top;
    // As a tile plays, its view drawn out for all it shows, a row it showed stays as the view
    // moves, cut off by the fade, rather than going and coming back.
    if (!row.querySelector(rowSelector) && bottom > height + rowSlack) {
      if (!played) row.dataset.cataloguePast = '';
    } else {
      delete row.dataset.cataloguePast;
      if (bottom <= height + rowSlack) kept = Math.max(kept, bottom);
    }
  }
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const fade = parseFloat(getComputedStyle(crop).getPropertyValue('--catalogue-crop-fade')) * rem;
  if (kept > height - fade)
    crop.style.setProperty('--catalogue-crop-bottom', `${Math.max(0, height - kept)}px`);
  else crop.style.removeProperty('--catalogue-crop-bottom');
}

/**
 * Marks a region of a canvas that scrolls as it plays, such as a page's body in its box, while its
 * content runs on past its foot (`data-catalogue-runs-on`), so it fades out there (Related.css),
 * as the crop does where the stage cuts a picture off, rather than ending in a slice through a
 * line. Only the foot: what stays at its top, such as a sticky header, isn't cut. A region on its
 * way open or closed, such as a panel easing to its height, isn't one, nor one that fades its own
 * edges.
 */
function markRunsOn(regions: Iterable<Element>) {
  for (const region of regions) {
    if (!(region instanceof HTMLElement)) continue;
    if (region.clientHeight < 24 || region.scrollHeight <= region.clientHeight + 1) {
      delete region.dataset.catalogueRunsOn;
      continue;
    }
    const style = getComputedStyle(region);
    // A region that fades its own edges, such as a time picker's wheel, keeps its own fade.
    const ownFade = region.dataset.catalogueRunsOn === undefined && style.maskImage !== 'none';
    const runsOn =
      region.scrollTop + region.clientHeight < region.scrollHeight - 1 &&
      style.overflowY !== 'visible' &&
      !ownFade &&
      !moving(region);
    if (runsOn) region.dataset.catalogueRunsOn = '';
    else delete region.dataset.catalogueRunsOn;
  }
}

/** The part of a box inside a clip, empty where none is, or the box where nothing clips it. */
function within(box: DOMRect, clip: DOMRect | null) {
  if (!clip) return box;
  const left = Math.max(box.left, clip.left);
  const top = Math.max(box.top, clip.top);
  const right = Math.min(box.right, clip.right);
  const bottom = Math.min(box.bottom, clip.bottom);
  return new DOMRect(left, top, Math.max(0, right - left), Math.max(0, bottom - top));
}

/**
 * Scales the preview down until what it shows fits its stage, and centres it there: CSS can't
 * size a box to what its content measures. It follows the stage's width, the preview as it loads
 * and resizes, and the overlays as they open, are placed and finish their transitions: each change
 * fits it again in the next frame, however late it comes, so no timing decides whether it fits.
 * A page's own tile is drawn at its window's scale. At rest it is centred on what it paints, and a
 * gallery's tile framed as it plays, with what its pointer heads to in view (onCourse). As it
 * plays, its view stays where it is, so what happens in it, such as notifications stacking, happens
 * in place; it moves only when something would leave the stage, easing just far enough to keep it
 * in. In a gallery, it is drawn out once for all its animation acts on and opens (playFit), and
 * eases back to centre the still at its scale once the tile rests.
 */
export function useFit(
  stage: RefObject<HTMLElement | null>,
  canvas: RefObject<HTMLElement | null>,
  on: boolean,
  whole: boolean,
  tile: boolean,
  playing: boolean,
  /** Whether it is drawn at its own size, cropped by its stage rather than drawn smaller. */
  ownSize = false,
  /**
   * Whether it is drawn no smaller than a legible scale, as a pattern's scene in a gallery is,
   * centred on what it paints and cropped by its stage where it is larger.
   */
  legible = false,
) {
  const playingNow = useRef(playing);
  const refit = useRef<(() => void) | null>(null);
  useLayoutEffect(() => {
    playingNow.current = playing;
    // Rested, it is centred again.
    refit.current?.();
  }, [playing]);
  useLayoutEffect(() => {
    const stageElement = stage.current;
    const canvasElement = canvas.current;
    if (!on || !stageElement || !canvasElement) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    refit.current = update;
    const resize = new ResizeObserver(update);
    const largest = tile ? most : 1;
    // The view: where the canvas is and the scale it is drawn at, and where it eases to. Each frame
    // closes a share of the way left, so a target that moves as the preview changes is followed
    // without restarting. `rest` is the scale it is fitted at resting, and `zoomed` whether it is
    // drawn smaller than that as it plays, or on its way back.
    const view = {
      x: 0,
      y: 0,
      scale: 1,
      toX: 0,
      toY: 0,
      toScale: 1,
      rest: 1,
      zoomed: false,
      frame: 0,
      last: 0,
    };
    // Before it shows, the frames its fit has held where it is, and when it was first fitted: a
    // popup is placed by its style a frame or two after it opens, and a preview shown before then
    // would glide to it as it fades in.
    const first = { calm: 0, start: 0 };
    // As a tile plays, what its still showed and what it has opened since (playFit).
    let run: Run | null = null;
    // Whether the canvas is a screen as large as the stage, for a modal over it (screenFit).
    let screen = false;
    const place = () => {
      const transform = `translate(${-view.x}px, ${-view.y}px) scale(${view.scale})`;
      if (canvasElement.style.transform !== transform) canvasElement.style.transform = transform;
      trimRows(canvasElement, run !== null || (screen && playingNow.current));
    };
    /**
     * Where what a preview shows reaches past the stage's edges, drawn at a view: the sides it is
     * cut off at (`data-cut`, Gallery.css).
     */
    const cutSides = (boxes: Shown[], toX: number, toY: number, scale: number) => {
      const shows = join(...boxes.map(({ box }) => box))!;
      const past = (at: number, size: number, low: number, high: number) => [
        size / 2 - at + low * scale < -1,
        size / 2 - at + high * scale > size + 1,
      ];
      const [top, bottom] = past(toY, stageElement.clientHeight, shows.top, shows.bottom);
      const [start, end] = past(toX, stageElement.clientWidth, shows.left, shows.right);
      return [top && 'top', bottom && 'bottom', start && 'start', end && 'end']
        .filter(Boolean)
        .join(' ');
    };
    /**
     * A still framed as its play is: each point its pointer heads to over its script that is
     * there at rest, in order, as many as fit together, kept in the stage as the play keeps them
     * (heading), so the pointer coming in and going moves nothing.
     */
    const onCourse = (toX: number, toY: number, scale: number) => {
      const across = stageElement.clientWidth / 2 - 4;
      const down = stageElement.clientHeight / 2 - 4;
      let held: Box | null = null;
      // What the tile names anywhere (useMustShow), such as a panel it opens in place, as far as
      // it paints (inkOf), first.
      const named = mustShowOf(canvasElement, true).flatMap((selector) => {
        const element = aimedElement(canvasElement, selector);
        return element?.checkVisibility() ? [inkOf(element, canvasElement)] : [];
      });
      const aims = courseOf(canvasElement).map(aimBox);
      for (const box of [...named, ...aims]) {
        if (!box || box.right <= box.left || box.bottom <= box.top) continue;
        const next: Box = join(held, box)!;
        if (
          (next.right - next.left) * scale > 2 * (across - margin) ||
          (next.bottom - next.top) * scale > 2 * (down - margin)
        )
          continue;
        held = next;
      }
      if (!held) return { toX, toY };
      return {
        toX: contain(toX, held.left * scale, held.right * scale, across),
        toY: contain(toY, held.top * scale, held.bottom * scale, down),
      };
    };
    /**
     * The part of the canvas a playing tile's pointer is heading to, in its own px: the element it
     * aims at, or the row it is in, such as a list's row around its link, so the crop shows it whole
     * rather than hiding it past its foot (trimRows); of an element taller than a row, such as a
     * panel's content, only the stretch around the point it aims at.
     */
    const heading = (): Box | null => {
      const aim = headingOf(canvasElement);
      return aim ? aimBox(aim) : null;
    };
    /** The part of the canvas a point the pointer heads to takes in (heading). */
    const aimBox = (aim: Heading): Box | null => {
      const element = aimedElement(canvasElement, aim.selector);
      if (!element?.checkVisibility()) return null;
      const row = element.closest(rowSelector);
      const box = partOf(row && canvasElement.contains(row) ? row : element, canvasElement);
      const reach = 3 * remSize();
      if (box.bottom - box.top <= 2 * reach && box.right - box.left <= 6 * reach) return box;
      const own = partOf(element, canvasElement);
      const x = own.left + (own.right - own.left) * aim.x;
      const y = own.top + (own.bottom - own.top) * aim.y;
      return {
        left: Math.max(box.left, x - reach),
        right: Math.min(box.right, x + reach),
        top: Math.max(box.top, y - reach / 2),
        bottom: Math.min(box.bottom, y + reach / 2),
      };
    };
    const glide = (now: number) => {
      const elapsed = Math.min(64, now - (view.last || now - 16));
      view.last = now;
      // As a tile plays, it keeps pace with what opens, which takes the room as it comes in.
      const share = 1 - Math.exp(-elapsed / (run ? 70 : 110));
      view.x += (view.toX - view.x) * share;
      view.y += (view.toY - view.y) * share;
      view.scale += (view.toScale - view.scale) * share;
      const settled =
        Math.abs(view.toX - view.x) < 0.25 &&
        Math.abs(view.toY - view.y) < 0.25 &&
        Math.abs(view.toScale - view.scale) < 0.001;
      if (settled) {
        view.x = view.toX;
        view.y = view.toY;
        view.scale = view.toScale;
      }
      place();
      view.frame = settled ? 0 : requestAnimationFrame(glide);
    };
    const still = matchMedia('(prefers-reduced-motion: reduce)');
    /** Eases the view to where it goes, or with motion reduced, places it there at once. */
    const glideTo = () => {
      if (still.matches) {
        cancelAnimationFrame(view.frame);
        view.frame = 0;
        view.x = view.toX;
        view.y = view.toY;
        view.scale = view.toScale;
        place();
      } else if (!view.frame) {
        view.last = 0;
        view.frame = requestAnimationFrame(glide);
      }
    };
    /**
     * As a gallery's tile plays, its view stays where it rested, as the pointer comes in and while
     * what it does stays in its still, such as a tree's branch opening in place. Only once it opens
     * something that needs more room, a popup or what grows in one, such as a palette's results,
     * is it drawn out, as that opens: about the trigger that opened it, which stays where it is, or
     * moves only as far as the popup needs, no smaller than `least`, easing there. It is drawn no
     * larger again until it rests, so what closes and opens again doesn't move it in and out, and
     * every time it plays it does the same. What still doesn't fit is shown from its start, cut
     * off past the stage's edge, where it fades out.
     */
    const playFit = (boxes: Shown[], least: number, stepped: (scale: number) => number) => {
      const across = stageElement.clientWidth;
      const down = stageElement.clientHeight;
      const shownPart = (element: Element) => partOf(element, canvasElement);
      const layered = (element: Element) => element.closest('.catalogue-overlay-layer') !== null;
      run ??= {
        rested: boxes.reduce(
          (rested, { element, box }) =>
            rested.set(element, join(rested.get(element) ?? null, box)!),
          new Map<Element, Box>(),
        ),
        scale: view.toScale,
        pending: null,
        at: { x: view.toX, y: view.toY, scale: view.toScale },
        cut: canvasElement.dataset.cut?.split(' ') ?? [],
        moved: false,
      };
      const current = run;
      // What the script acts on in a popup, such as a select's options, and what the tile names
      // anywhere, such as a panel it opens (MustShow.ts).
      const query = (selector: string) => {
        try {
          return [...canvasElement.querySelectorAll(selector)];
        } catch {
          return [];
        }
      };
      const named = [
        ...mustShowOf(canvasElement).flatMap(query).filter(layered),
        ...mustShowOf(canvasElement, true).flatMap(query),
      ]
        .filter((element) => element.checkVisibility({ visibilityProperty: true }))
        .map((element) => inkOf(element, canvasElement))
        .filter((box) => box.right > box.left && box.bottom > box.top);
      // What opens, a popup, and what grows in one, such as a palette's results: a popup on its
      // way in is measured by the box that places it, untransformed, as it ends.
      const opened = boxes
        .filter(({ element, box }) => {
          // What is closing needs no room.
          if (!layered(element) || element.closest('[data-ending-style]')) return false;
          const still = current.rested.get(element);
          return !still || !covers(still, box);
        })
        .map(({ element, box }) => {
          const holder =
            !current.rested.has(element) && settling(element, canvasElement)
              ? element.closest(
                  '.env-popup-positioner, .env-menu-positioner, .env-tooltip-positioner',
                )
              : null;
          return holder && canvasElement.contains(holder) ? shownPart(holder) : box;
        });
      const must = join(...named, ...opened);
      const at = { x: view.toX, y: view.toY, scale: view.toScale };
      // Where a point of the canvas is in the stage, along an axis `size` long.
      const screen = (point: number, to: number, size: number) => size / 2 - to + point * at.scale;
      // What the view shows already, such as a popup that closes and opens again, moves nothing.
      const shown =
        must &&
        screen(must.left, at.x, across) >= -1 &&
        screen(must.right, at.x, across) <= across + 1 &&
        screen(must.top, at.y, down) >= -1 &&
        screen(must.bottom, at.y, down) <= down + 1;
      // What opens is placed by its style a frame or two after it shows: the view follows it once
      // it has held its place from one frame to the next, not to where it first showed.
      const placed =
        must &&
        current.pending !== null &&
        covers(current.pending, must) &&
        covers(must, current.pending);
      // A tile that holds its view, its still written as its largest state, moves for nothing.
      const holds = holdsView(canvasElement);
      current.pending = must && !shown && !placed && !holds ? must : null;
      if (current.pending) update();
      if (must && !shown && placed && !holds) {
        // The trigger, outside the popups, with its field's label, which floats over its edge,
        // where the stage shows it.
        const trigger = [...canvasElement.querySelectorAll(triggers)].find(
          (element) =>
            !layered(element) &&
            element.checkVisibility({ opacityProperty: true, visibilityProperty: true }),
        );
        const label = trigger?.closest('.env-field')?.querySelector('.env-field-label');
        const anchor = trigger ? join(shownPart(trigger), label ? shownPart(label) : null) : null;
        // The trigger is never panned out of view: where it shows whole, it stays where it is;
        // where it reaches past an edge, the view takes it in with what it opened.
        const inView =
          anchor &&
          screen(anchor.left, at.x, across) >= 0 &&
          screen(anchor.right, at.x, across) <= across &&
          screen(anchor.top, at.y, down) >= 0 &&
          screen(anchor.bottom, at.y, down) <= down;
        const needed = join(must, anchor)!;
        const middle = inView
          ? { x: (anchor.left + anchor.right) / 2, y: (anchor.top + anchor.bottom) / 2 }
          : null;
        // Along an axis `size` long, the largest scale that holds what is needed, from `low` to
        // `high`, with the anchor's `point` where it is.
        const holding = (size: number, to: number, point: number, low: number, high: number) => {
          const place = screen(point, to, size);
          return Math.min(
            low < point ? (place - playMargin) / (point - low) : Infinity,
            high > point ? (size - playMargin - place) / (high - point) : Infinity,
          );
        };
        // About the trigger, as much smaller as keeps it where it is; without one in view, as
        // small as all of it needs; either way, no smaller than `least`.
        const wanted = middle
          ? Math.min(
              holding(across, at.x, middle.x, needed.left, needed.right),
              holding(down, at.y, middle.y, needed.top, needed.bottom),
            )
          : Math.min(
              (across - 2 * playMargin) / (needed.right - needed.left),
              (down - 2 * playMargin) / (needed.bottom - needed.top),
            );
        // What reaches a little into the margin, such as a time a word longer, keeps the scale.
        const scale =
          wanted >= current.scale * zoomSlack
            ? current.scale
            : stepped(Math.min(current.scale, Math.max(least, wanted)));
        current.scale = scale;
        // Along an axis: the anchor where it was, else what is needed centred, then just far
        // enough to keep that in; where it doesn't fit, shown from its start, but never so far
        // that the trigger, from `keepLow` to `keepHigh`, leaves the view.
        const along = (
          size: number,
          to: number,
          point: number | undefined,
          low: number,
          high: number,
          keepLow?: number,
          keepHigh?: number,
        ) => {
          if ((high - low) * scale > size - 2 * playMargin + 0.5) {
            const start = size / 2 + low * scale - playMargin;
            if (keepLow === undefined || keepHigh === undefined) return start;
            return Math.min(
              Math.max(start, size / 2 + keepHigh * scale - size + playMargin),
              size / 2 + keepLow * scale - playMargin,
            );
          }
          const held =
            point === undefined
              ? ((low + high) / 2) * scale
              : size / 2 + point * scale - screen(point, to, size);
          return Math.min(
            Math.max(held, size / 2 + high * scale - size + playMargin),
            size / 2 + low * scale - playMargin,
          );
        };
        view.toX = along(
          across,
          at.x,
          middle?.x,
          needed.left,
          needed.right,
          anchor?.left,
          anchor?.right,
        );
        view.toY = along(
          down,
          at.y,
          middle?.y,
          needed.top,
          needed.bottom,
          anchor?.top,
          anchor?.bottom,
        );
        view.zoomed = scale < view.rest;
        view.toScale = scale;
        glideTo();
      }
      // What the pointer heads to, such as a row below the stage's foot, is brought into the stage
      // before it gets there, easing just far enough; a tile that holds its view is framed on it.
      const box = holds ? null : heading();
      if (box) {
        const toX = contain(
          view.toX,
          box.left * view.toScale,
          box.right * view.toScale,
          across / 2 - 4,
        );
        const toY = contain(
          view.toY,
          box.top * view.toScale,
          box.bottom * view.toScale,
          down / 2 - 4,
        );
        if (Math.hypot(toX - view.toX, toY - view.toY) >= 1) {
          view.toX = toX;
          view.toY = toY;
          glideTo();
        }
      }
      // What reaches past the stage's edges, where the view is drawn, is cut off there; until its
      // view moves, also where its still was, so the pointer coming in changes nothing.
      current.moved ||=
        Math.abs(view.toX - current.at.x) >= 0.5 ||
        Math.abs(view.toY - current.at.y) >= 0.5 ||
        Math.abs(view.toScale - current.at.scale) >= 0.0005;
      const sides = new Set(cutSides(boxes, view.toX, view.toY, view.toScale).split(' '));
      if (!current.moved) for (const side of current.cut) sides.add(side);
      sides.delete('');
      if (sides.size) canvasElement.dataset.cut = [...sides].join(' ');
      else delete canvasElement.dataset.cut;
      trimRows(canvasElement, true);
      for (const { element } of boxes) resize.observe(element);
    };
    const fit = () => {
      // Rested, it plays from its still again the next time.
      if (run && !playingNow.current) run = null;
      const boxes = shownBoxes(canvasElement);
      if (!boxes.length) return;
      // At rest, what scrolls shows its still as it was written, ending on a whole line.
      if (!playingNow.current)
        for (const region of canvasElement.querySelectorAll<HTMLElement>(
          '[data-catalogue-runs-on]',
        ))
          delete region.dataset.catalogueRunsOn;
      // At rest, a tile in place waits for what is still coming or going, such as a popup rising
      // into place, and fits once it ends (transitionend): measured on the way, the view would
      // ease toward it and back.
      if (
        tile &&
        !playingNow.current &&
        canvasElement.dataset.fitted !== undefined &&
        boxes.some(({ element }) => settling(element, canvasElement))
      )
        return;
      const left = Math.min(...boxes.map(({ box }) => box.left));
      const top = Math.min(...boxes.map(({ box }) => box.top));
      const right = Math.max(...boxes.map(({ box }) => box.right));
      const bottom = Math.max(...boxes.map(({ box }) => box.bottom));
      const width = stageElement.clientWidth - 2 * inset;
      const height = stageElement.clientHeight - 2 * inset;
      // A window that counts whole, a gallery's or a tile's, sets the scale, so every tile of its
      // kind is drawn at one scale; a gallery's draws what overflows it smaller. A page's own tile
      // is written for its window, so its scale is the window's alone: one that followed its
      // popups would move them, as they are placed again at each scale, and never settle. Either
      // way, what the preview paints is centred, not its window.
      const windowScale = Math.min(
        largest,
        width / canvasElement.offsetWidth,
        height / canvasElement.offsetHeight,
      );
      // At its own size, unless the stage's room is smaller than the least box it is drawn whole
      // in, `--catalogue-own-least` across, as five to a row, and `--catalogue-own-least-block`
      // down, as a menu open under its button (Gallery.css): then drawn smaller, by one scale for
      // every tile, as every stage is as large, so nothing reaches the stage's edge. On a phone,
      // each is drawn at one of a few scales (phoneSteps): its own size where it fits its stage's
      // width and that height, else `--catalogue-own-floor`, and what is larger still is cut off.
      const canvasStyle = getComputedStyle(canvasElement);
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const least = parseFloat(canvasStyle.getPropertyValue('--catalogue-own-least')) * rem;
      const leastBlock =
        parseFloat(canvasStyle.getPropertyValue('--catalogue-own-least-block')) * rem || 0;
      const downScale = leastBlock > 0 ? height / leastBlock : 1;
      const floor = parseFloat(canvasStyle.getPropertyValue('--catalogue-own-floor'));
      const phone = floor > 0;
      // A popup shown open, such as a menu beside its button, lays out in its tile's own window
      // (`data-popup`, Gallery.css), as wide as it was written for, also in a pattern's scene. It
      // is drawn whole, its edges and corners in view, where that takes a scale no smaller than
      // the least every popup is drawn at, `--catalogue-own-popup-least` (Gallery.css), or a
      // scene's legible one: its words stay legible beside the other tiles'. A larger one, such
      // as a picker, is a window onto it from its top, cut off at its foot after its last whole
      // row, drawn whole across where that scale allows, else at the one scale and cut off at its
      // end. A modal, such as a dialog, has the stage for its screen (screenFit). As it plays, it
      // is drawn smaller only where what opens needs it (playFit).
      const popup = boxes.some(({ element }) => element.closest('.catalogue-overlay-layer'));
      if ((ownSize || legible) && popup && canvasElement.dataset.fitted === undefined)
        canvasElement.dataset.popup = '';
      const popupLeast =
        parseFloat(canvasStyle.getPropertyValue('--catalogue-own-popup-least')) || legibleScale;
      // On a phone, the largest of its scales a picture fits at, no smaller than `low`.
      const steps = phoneSteps(floor, popupLeast);
      const step = (scale: number, low: number) =>
        steps.find((each) => each >= low - 0.0005 && each <= scale + 0.0005) ?? low;
      const own = phone
        ? step(Math.min(1, width / (right - left), downScale), floor)
        : Math.min(1, width / least, downScale);
      // A component's modal, such as a dialog, a sheet or a command palette, over its backdrop:
      // the stage is its screen, decided on its still, so it stays one as the modal closes.
      if (ownSize && tile && !playingNow.current && canvasElement.querySelector(modal))
        screen = true;
      if (screen) {
        screenFit(boxes, phone ? 1 : own, (scale) =>
          phone ? step(scale, popupLeast) : Math.max(Math.min(own, popupLeast), scale),
        );
        return;
      }
      const wholeScale = Math.min(width / (right - left), height / (bottom - top));
      // A popup a little larger than the inset leaves room for, such as a menu bar with its menu
      // open, is drawn whole in the stage, a margin from its edges, where that scale allows, rather
      // than as a window cut off through its last row. A larger one, such as a picker, stays a
      // window onto it from its top.
      const dialog =
        canvasElement.querySelector('.catalogue-overlay-layer .env-dialog-backdrop') !== null;
      const room = {
        width: stageElement.clientWidth - 2 * margin,
        height: stageElement.clientHeight - 2 * margin,
      };
      // A component's own popup, or a dialog in a scene too.
      const roomy = dialog || (ownSize && popup);
      const roomScale = roomy
        ? Math.min(room.width / (right - left), room.height / (bottom - top))
        : 0;
      // A tile that holds its view is framed once on its still, the largest it shows: what its
      // script acts on there, such as a time picker's chosen hour under its field, shows in it from
      // its top, drawn smaller for that down to the popup's least.
      const keep = holdsView(canvasElement)
        ? join(
            ...mustShowOf(canvasElement)
              .flatMap((selector) => {
                try {
                  return [...canvasElement.querySelectorAll(selector)];
                } catch {
                  return [];
                }
              })
              .filter((element) => element.checkVisibility())
              .map((element) => partOf(element, canvasElement))
              .filter((box) => box.right > box.left && box.bottom > box.top),
          )
        : null;
      const keepScale = keep
        ? (stageElement.clientHeight - 2 * margin) / (keep.bottom - top)
        : Infinity;
      const popupScale = (atMost: number) => {
        const lowest = Math.min(atMost, popupLeast);
        const across = width / (right - left);
        const fits =
          wholeScale >= lowest
            ? wholeScale
            : roomScale >= lowest
              ? roomScale
              : across >= lowest
                ? Math.max(lowest, Math.min(across, keepScale))
                : phone
                  ? lowest
                  : atMost;
        return phone ? step(Math.min(atMost, fits), lowest) : Math.min(atMost, fits);
      };
      const scene = Math.max(legibleScale, Math.min(1, windowScale));
      // As a gallery's tile plays, its view is drawn out for all it shows (playFit), never below
      // the least it is drawn at (its popup's or a scene's), so its words stay legible.
      if (
        (ownSize || legible) &&
        tile &&
        playingNow.current &&
        canvasElement.dataset.fitted !== undefined
      ) {
        const low = Math.min(view.rest, ownSize ? popupLeast : legibleScale);
        playFit(boxes, low, (scale) => (phone && ownSize ? step(scale, low) : scale));
        return;
      }
      const fitted = ownSize
        ? popup
          ? popupScale(phone ? 1 : own)
          : own
        : legible
          ? popup
            ? popupScale(scene)
            : scene
          : tile
            ? windowScale
            : Math.min(whole ? windowScale : 1, width / (right - left), height / (bottom - top));
      // Measured again, a box may come out a hair larger or smaller, a ten-millionth of the scale:
      // that is the same scale, so the view holds still and a tile shows as soon as it is fitted.
      const scale = Math.abs(fitted - view.rest) < 0.0005 ? view.rest : fitted;
      let toX = ((left + right) / 2) * scale;
      let toY = ((top + bottom) / 2) * scale;
      // Drawn at its own size, what is larger than the stage shows from its start, as a window
      // onto it, and what reaches past the stage's own edge, beyond the inset, is cut off there
      // and fades out (`data-cut`, Gallery.css).
      const across = (right - left) * scale;
      const down = (bottom - top) * scale;
      // What fits the stage's room, a margin from its edges, such as a popup drawn whole there or
      // a component a little taller than the inset leaves room for, is centred on it, cut off
      // nowhere.
      const inRoom = down <= room.height + 0.5 && across <= room.width + 0.5;
      // So is a component a little wider than the inset leaves room for, such as a strip of tabs,
      // across: it is cut off at its foot alone, as every other one is, not at its side.
      const acrossRoom = across <= room.width + 0.5;
      // It starts at the component's own start, rather than its popups': a popup shifts to stay
      // in the window, and a view that followed it would shift it again. A dialog, over its
      // backdrop, is placed by the window alone and covers what opens it: it starts at its own.
      if (ownSize && across > width && !inRoom && !acrossRoom) {
        const own = boxes.filter(
          ({ element }) => dialog || !element.closest('.catalogue-overlay-layer'),
        );
        const start = own.length ? Math.min(...own.map(({ box }) => box.left)) : left;
        toX = start * scale + width / 2;
      }
      // A scene drawn at a legible scale shows from its top too, where it starts, such as a search
      // above the results it filters, and stays centred across.
      // A tile that holds its view starts a margin from the stage's top rather than the inset, so
      // what its script acts on further down, such as a picker's chosen row, shows whole.
      if ((ownSize || legible) && down > height && !inRoom)
        toY = keep
          ? keepWhole(top * scale, keep.bottom * scale, stageElement.clientHeight)
          : top * scale + height / 2;
      // At rest, a tile is framed as it plays, on what its pointer heads to (onCourse); moved
      // for it, it is cut off where it reaches past the stage's edges.
      const course =
        (ownSize || legible) && tile && !playingNow.current && !keep
          ? onCourse(toX, toY, scale)
          : null;
      const shifted =
        course !== null && (Math.abs(course.toX - toX) >= 0.5 || Math.abs(course.toY - toY) >= 0.5);
      if (course) ({ toX, toY } = course);
      if (ownSize || legible) {
        // Drawn at a legible scale, a scene wider than the stage is cut off on both sides, fading
        // out there too.
        const cut = shifted
          ? [cutSides(boxes, toX, toY, scale)]
          : [
              down > height + inset && !inRoom ? 'bottom' : '',
              !legible && across > width + inset && !inRoom && !acrossRoom ? 'end' : '',
              legible && across > stageElement.clientWidth ? 'start end' : '',
            ];
        const sides = cut.filter(Boolean).join(' ');
        if (sides) canvasElement.dataset.cut = sides;
        else delete canvasElement.dataset.cut;
        trimRows(canvasElement, run !== null);
      }
      // As a page's own tile plays, the view stays where it is while what it shows stays in the
      // stage, else moves just far enough to keep it in.
      if (tile && playingNow.current && view.scale === scale) {
        toX = contain(view.toX, left * scale, right * scale, stageElement.clientWidth / 2 - inset);
        toY = contain(view.toY, top * scale, bottom * scale, stageElement.clientHeight / 2 - inset);
      }
      settle(scale, toX, toY, boxes);
    };
    /**
     * Places the view at a scale and a point, `toX` and `toY`: until the preview shows, at once,
     * and from then on, in place, easing there.
     */
    const settle = (scale: number, toX: number, toY: number, boxes: Shown[]) => {
      // A tile in place eases to where it is fitted next; anything else is placed at once.
      const eases = tile && canvasElement.dataset.fitted !== undefined && !still.matches;
      // Until it shows, it is placed at once, and shows only once its place has held for a few
      // frames, or after a quarter of a second, whatever is still moving, such as a popup placed again
      // against the stage's edges as the view moves: it appears in place, as every preview does,
      // by fading in. A quarter of a second, not a count of frames: on a busy page, as a gallery is while
      // its tiles load, frames come slowly, and a count would keep it hidden for seconds.
      if (canvasElement.dataset.fitted === undefined) {
        const held =
          first.calm > 0 &&
          view.scale === scale &&
          Math.abs(view.x - toX) < 0.5 &&
          Math.abs(view.y - toY) < 0.5;
        first.calm = held ? first.calm + 1 : 1;
        first.start ||= performance.now();
        view.x = view.toX = toX;
        view.y = view.toY = toY;
        view.scale = view.toScale = view.rest = scale;
        place();
        for (const { element } of boxes) resize.observe(element);
        if (first.calm >= 3 || performance.now() - first.start >= 250)
          canvasElement.dataset.fitted = '';
        else update();
        return;
      }
      // It follows only a change of a pixel or more: a popup is placed again as the view moves,
      // a fraction away, which would move the view again, in a tremble.
      if (
        eases &&
        playingNow.current &&
        view.toScale === scale &&
        Math.hypot(toX - view.toX, toY - view.toY) < 1
      )
        return;
      view.rest = scale;
      // Drawn smaller as it played, it eases back to its still's scale, unless motion is reduced;
      // any other change of scale, such as the stage's, is placed at once.
      const zooms = scale !== view.toScale && view.zoomed;
      view.zoomed = false;
      view.toX = toX;
      view.toY = toY;
      if (eases && (view.toScale === scale || zooms)) {
        view.toScale = scale;
        if (!view.frame) {
          view.last = 0;
          view.frame = requestAnimationFrame(glide);
        }
      } else {
        cancelAnimationFrame(view.frame);
        view.frame = 0;
        view.x = view.toX;
        view.y = view.toY;
        view.scale = view.toScale = scale;
        place();
      }
      canvasElement.dataset.fitted = '';
      for (const { element } of boxes) resize.observe(element);
    };
    /**
     * A component's modal over its backdrop, such as a dialog, a sheet or a command palette, has
     * the stage for its screen, as an application's has the window: the canvas is laid out as large
     * as the stage shows at its scale, from the stage's corner, so the backdrop covers the stage
     * as it covers a screen and the modal is placed in it by its own style. It is drawn at the one
     * scale, `atMost`, or smaller as far as the modal needs to show whole, down to the least a
     * popup is drawn at (`stepped`). Taller than the stage still, the screen is as tall as the
     * modal needs and shows from its top; as the tile plays, the view pans down it, easing, to
     * what the pointer heads to, so what it presses is in view before the press.
     */
    const screenFit = (boxes: Shown[], atMost: number, stepped: (scale: number) => number) => {
      const across = stageElement.clientWidth;
      const down = stageElement.clientHeight;
      const px = (value: string) => parseFloat(value) || 0;
      // The room each modal needs: as tall as its content and the gutters around it, a sheet as
      // tall as the screen it spans, and as wide where it is wider than the screen.
      let needHeight = 0;
      let needWidth = 0;
      for (const surface of canvasElement.querySelectorAll<HTMLElement>(modalSurfaces)) {
        if (!surface.checkVisibility() || surface.closest('[data-ending-style]')) continue;
        const holder = surface.closest<HTMLElement>(modalPositioners) ?? surface.parentElement!;
        const itself = getComputedStyle(surface);
        const around = getComputedStyle(holder);
        if (!surface.matches('.env-sheet'))
          needHeight = Math.max(
            needHeight,
            surface.scrollHeight +
              surface.offsetHeight -
              surface.clientHeight +
              px(itself.marginTop) +
              px(itself.marginBottom) +
              px(around.paddingTop) +
              px(around.paddingBottom),
          );
        const wide =
          surface.offsetWidth +
          px(itself.marginLeft) +
          px(itself.marginRight) +
          px(around.paddingLeft) +
          px(around.paddingRight);
        if (wide > canvasElement.offsetWidth + 0.5) needWidth = Math.max(needWidth, wide);
      }
      const fits = Math.min(
        atMost,
        needHeight ? down / needHeight : Infinity,
        needWidth ? across / needWidth : Infinity,
      );
      // As it plays, the screen stays as it was at rest, as the modal closes and opens again.
      const plays = playingNow.current && canvasElement.dataset.fitted !== undefined;
      const scale = plays ? view.rest : stepped(fits);
      const style = canvasElement.style;
      const tall = plays ? canvasElement.offsetHeight : Math.max(down / scale, needHeight);
      const size = (value: number) => `${Math.round(value * 100) / 100}px`;
      if (!plays) {
        if (style.inlineSize !== size(across / scale)) style.inlineSize = size(across / scale);
        if (style.blockSize !== size(tall)) style.blockSize = size(tall);
        style.minBlockSize = '0px';
      }
      // From the screen's top to its foot: where the stage's middle is along it.
      const highest = down / 2;
      const lowest = Math.max(highest, tall * scale - down / 2);
      const along = (y: number) => Math.min(Math.max(y, highest), lowest);
      // At rest, framed as it plays, on what its pointer heads to (onCourse).
      let toY = plays ? view.toY : along(onCourse(across / 2, highest, scale).toY);
      if (plays) {
        toY = along(toY);
        const box = heading();
        if (box) toY = along(contain(toY, box.top * scale, box.bottom * scale, down / 2 - 4));
      }
      // What it shows past the stage's top or foot, the screen's own fill aside, is cut off there.
      const shows = join(...boxes.map(({ box }) => box));
      const sides = [
        shows && shows.top * scale - toY < -down / 2 - 1 ? 'top' : '',
        shows && shows.bottom * scale - toY > down / 2 + 1 ? 'bottom' : '',
      ]
        .filter(Boolean)
        .join(' ');
      if (sides) canvasElement.dataset.cut = sides;
      else delete canvasElement.dataset.cut;
      settle(scale, across / 2, toY, boxes);
      trimRows(canvasElement, playingNow.current);
    };
    resize.observe(stageElement);
    resize.observe(canvasElement);
    // The example renders once its module loads, and its overlays open into a canvas that keeps
    // its size; a popup is placed by its style a frame or two later, without changing size. The
    // canvas's own attributes are the fit's; what is added to it or removed from it, such as the
    // example as its module loads, is the preview's, and fits it again.
    // As a tile plays, only what settles moves its view: what is added or removed, a transition or
    // an animation that ends, a resize. Not each step of a motion, such as a notification sliding
    // in from the edge, nor a popup placed again as the view moves.
    const changes = new MutationObserver((records) => {
      const added = records.some((record) => record.type === 'childList');
      if (tile && playingNow.current && !added) return;
      if (added || records.some((record) => record.target !== canvasElement)) update();
    });
    changes.observe(canvasElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden'],
    });
    // A region that scrolls as the tile plays fades at its foot while its content runs on past it.
    const scrolled = (event: Event) => markRunsOn([event.target as Element]);
    canvasElement.addEventListener('scroll', scrolled, true);
    // An overlay that opens with a transition measures its final box once it ends.
    canvasElement.addEventListener('transitionend', update);
    canvasElement.addEventListener('animationend', update);
    // As the pointer heads somewhere else, the view keeps where it goes in the stage.
    canvasElement.addEventListener(headingEvent, update);
    void document.fonts?.ready.then(update);
    // An overlay may size to the window, such as a sheet as tall as it.
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('resize', update);
      canvasElement.removeEventListener('scroll', scrolled, true);
      canvasElement.removeEventListener('transitionend', update);
      canvasElement.removeEventListener('animationend', update);
      canvasElement.removeEventListener(headingEvent, update);
      for (const property of ['inline-size', 'block-size', 'min-block-size'])
        canvasElement.style.removeProperty(property);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(view.frame);
      changes.disconnect();
      resize.disconnect();
      refit.current = null;
    };
  }, [stage, canvas, on, whole, tile, ownSize, legible]);
}

/**
 * A phone's scales, largest first: a component's own size, the phone's floor where it is larger
 * (`--catalogue-own-floor`), and for an open popup the least a popup is drawn at
 * (`--catalogue-own-popup-least`, Gallery.css), so neighbouring tiles are drawn at one of a few.
 */
const phoneSteps = (floor: number, popupLeast: number) =>
  [...new Set([1, floor, popupLeast])].filter((step) => step > 0).sort((a, b) => b - a);

/** A component's modal over its backdrop, open in its tile's overlay layer (screenFit). */
const modal = '.catalogue-overlay-layer .env-dialog-backdrop';

/** A modal's surface, what it shows over its backdrop: a dialog's, a sheet's or a palette's. */
const modalSurfaces =
  '.catalogue-overlay-layer :is(.env-dialog-surface, .env-command-palette, .env-sheet)';

/** The box that places a modal's surface over the screen, with its gutters. */
const modalPositioners =
  '.env-dialog-positioner, .env-command-palette-positioner, .env-sheet-viewport';

/**
 * What shows of an element, in its canvas's own px, inside the boxes around it that clip it, such
 * as a scrolling column's: a row scrolled out of it doesn't count.
 */
function partOf(element: Element, canvas: HTMLElement): Box {
  const frame = canvas.getBoundingClientRect();
  const ratio = frame.width / canvas.offsetWidth || 1;
  const ownBox = (node: Element): Box => {
    const rect = node.getBoundingClientRect();
    return {
      left: (rect.left - frame.left) / ratio,
      top: (rect.top - frame.top) / ratio,
      right: (rect.right - frame.left) / ratio,
      bottom: (rect.bottom - frame.top) / ratio,
    };
  };
  let box = ownBox(element);
  for (let node = element.parentElement; node && node !== canvas; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.overflowX === 'visible' && style.overflowY === 'visible') continue;
    const clip = ownBox(node);
    box = {
      left: Math.max(box.left, clip.left),
      top: Math.max(box.top, clip.top),
      right: Math.min(box.right, clip.right),
      bottom: Math.min(box.bottom, clip.bottom),
    };
  }
  return box;
}

/**
 * What shows of an element as far as it paints, in its canvas's own px: of one that holds text,
 * such as a heading as wide as its pane, the text's own extent, not its box's.
 */
function inkOf(element: Element, canvas: HTMLElement): Box {
  const box = partOf(element, canvas);
  if (!element.textContent?.trim()) return box;
  const frame = canvas.getBoundingClientRect();
  const ratio = frame.width / canvas.offsetWidth || 1;
  const range = document.createRange();
  range.selectNodeContents(element);
  const text = range.getBoundingClientRect();
  return {
    left: Math.max(box.left, (text.left - frame.left) / ratio),
    top: Math.max(box.top, (text.top - frame.top) / ratio),
    right: Math.min(box.right, (text.right - frame.left) / ratio),
    bottom: Math.min(box.bottom, (text.bottom - frame.top) / ratio),
  };
}

/**
 * Where a held view's middle goes down a stage `size` tall, for what it shows from `top` and what
 * it acts on down to `bottom`, drawn at its scale: a margin from the stage's top, or where what it
 * acts on would end just past the foot, as a picker's chosen row, as much nearer the top as keeps it
 * whole (trimRows), its top still inside.
 */
function keepWhole(top: number, bottom: number, size: number) {
  const atMargin = top + size / 2 - margin;
  const whole = bottom - size / 2 - rowSlack + 0.25;
  // Its top may reach as far past the stage's top as a row past its foot, its leading clear.
  return whole > atMargin && whole <= top + size / 2 + rowSlack ? whole : atMargin;
}

/** The share of its scale a playing tile's content may need before it is drawn smaller. */
const zoomSlack = 0.97;

/** How far ahead of a stage's edge a tile's view keeps what it shows, once it has to move. */
const margin = 6;

/**
 * Where a tile's view goes along one axis while it plays: where it is, while what it shows, from
 * `low` to `high` around the view's `at`, is inside the stage's `half` either side of its middle;
 * else just far enough, and a margin, to bring it in; and centred where it can't fit.
 */
function contain(at: number, low: number, high: number, half: number) {
  if (high - low > 2 * (half - margin)) return (low + high) / 2;
  if (low - at >= -half - 1 && high - at <= half + 1) return at;
  return Math.min(Math.max(at, high - half + margin), low + half - margin);
}

/** A box in a canvas's own px. */
interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** A box a preview paints, and its element (shownBoxes). */
type Shown = ReturnType<typeof shownBoxes>[number];

/**
 * A playing tile's run (playFit): the elements its still showed, in the canvas's own px; the
 * scale it is drawn at, which only falls until it rests; and what opened outside the view, until
 * it has held its place.
 */
interface Run {
  rested: Map<Element, Box>;
  scale: number;
  pending: Box | null;
  /** Where its view rested, the sides it was cut off at, and whether it has moved since. */
  at: { x: number; y: number; scale: number };
  cut: string[];
  moved: boolean;
}

/**
 * The trigger of what a playing tile opens, such as a select's or a menu's button or a combobox's
 * input: its view is drawn out about it (playFit).
 */
const triggers =
  "[data-popup-open], [aria-haspopup][aria-expanded='true'], [role='combobox'][aria-expanded='true']";

/** How far, in px, from a stage's edges a playing tile's view keeps what it opens and its trigger. */
const playMargin = 10;

/** The root's font size, in px, which rem lengths follow. */
const remSize = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

/** The least box around boxes, or nothing for none. */
function join(...boxes: (Box | null)[]): Box | null {
  const some = boxes.filter((box): box is Box => box !== null);
  if (!some.length) return null;
  return {
    left: Math.min(...some.map((box) => box.left)),
    top: Math.min(...some.map((box) => box.top)),
    right: Math.max(...some.map((box) => box.right)),
    bottom: Math.max(...some.map((box) => box.bottom)),
  };
}

/** Whether a box holds another, to a couple of px, as a popup ends its entrance. */
const covers = (outer: Box, inner: Box) =>
  inner.left >= outer.left - 2 &&
  inner.top >= outer.top - 2 &&
  inner.right <= outer.right + 2 &&
  inner.bottom <= outer.bottom + 2;
