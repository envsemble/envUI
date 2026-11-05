import { useLayoutEffect, useRef, type RefObject } from 'react';

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
function trimRows(canvas: HTMLElement) {
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
    if (!row.querySelector(rowSelector) && bottom > height + rowSlack)
      row.dataset.cataloguePast = '';
    else {
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
 * A page's own tile is drawn at its window's scale. At rest it is centred on what it paints. As it
 * plays, its view stays where it is, so what happens in it, such as notifications stacking, happens
 * in place; it moves only when something would leave the stage, easing just far enough to keep it
 * in, and it eases back to centre the still once the tile rests.
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
    // The view: where the canvas is, and where it eases to. Each frame closes a share of the way
    // left, so a target that moves as the preview changes is followed without restarting.
    const view = { x: 0, y: 0, scale: 1, toX: 0, toY: 0, frame: 0, last: 0 };
    // Before it shows, the frames its fit has held where it is, and the frames it has been fitted
    // in: a popup is placed by its style a frame or two after it opens, and a preview shown before
    // then would glide to it as it fades in.
    const first = { calm: 0, tries: 0 };
    const place = () => {
      const transform = `translate(${-view.x}px, ${-view.y}px) scale(${view.scale})`;
      if (canvasElement.style.transform !== transform) canvasElement.style.transform = transform;
      trimRows(canvasElement);
    };
    const glide = (now: number) => {
      const elapsed = Math.min(64, now - (view.last || now - 16));
      view.last = now;
      const share = 1 - Math.exp(-elapsed / 110);
      view.x += (view.toX - view.x) * share;
      view.y += (view.toY - view.y) * share;
      const settled = Math.abs(view.toX - view.x) < 0.25 && Math.abs(view.toY - view.y) < 0.25;
      if (settled) {
        view.x = view.toX;
        view.y = view.toY;
      }
      place();
      view.frame = settled ? 0 : requestAnimationFrame(glide);
    };
    const still = matchMedia('(prefers-reduced-motion: reduce)');
    const fit = () => {
      const boxes = shownBoxes(canvasElement);
      if (!boxes.length) return;
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
      // each is drawn as small as fits its stage's width and that height, but no smaller than
      // `--catalogue-own-floor`: what is larger still is cut off.
      const canvasStyle = getComputedStyle(canvasElement);
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const least = parseFloat(canvasStyle.getPropertyValue('--catalogue-own-least')) * rem;
      const leastBlock =
        parseFloat(canvasStyle.getPropertyValue('--catalogue-own-least-block')) * rem || 0;
      const downScale = leastBlock > 0 ? height / leastBlock : 1;
      const floor = parseFloat(canvasStyle.getPropertyValue('--catalogue-own-floor'));
      // A popup shown open, such as a menu beside its button, lays out in its tile's own window
      // (`data-popup`, Gallery.css), as wide as it was written for, also in a pattern's scene. It
      // is drawn whole, its edges and corners in view, where that takes a scale no smaller than
      // the least a popup is drawn at, `--catalogue-own-popup-least` (Gallery.css), or a scene's
      // legible one: its words stay legible beside the other tiles'. A larger one, such as a
      // dialog, is a window onto it from its top, cut off at its foot after its last whole row,
      // drawn whole across where that scale allows, else at the one scale and cut off at its end.
      // Once fitted, a tile keeps its scale as it plays, so a popup that closes and opens again
      // doesn't resize it.
      const popup = boxes.some(({ element }) => element.closest('.catalogue-overlay-layer'));
      if ((ownSize || legible) && popup && canvasElement.dataset.fitted === undefined)
        canvasElement.dataset.popup = '';
      const wholeScale = Math.min(width / (right - left), height / (bottom - top));
      // A dialog a little larger than the inset leaves room for, such as a confirm dialog's
      // question and actions, is drawn whole in the stage, a margin from its edges, where that
      // scale allows, rather than as a window cut off through its actions. A menu stays a window
      // onto it from its top.
      const dialog =
        canvasElement.querySelector('.catalogue-overlay-layer .env-dialog-backdrop') !== null;
      const room = {
        width: stageElement.clientWidth - 2 * margin,
        height: stageElement.clientHeight - 2 * margin,
      };
      const roomScale = dialog
        ? Math.min(room.width / (right - left), room.height / (bottom - top))
        : 0;
      const popupLeast =
        parseFloat(canvasStyle.getPropertyValue('--catalogue-own-popup-least')) || legibleScale;
      const popupScale = (atMost: number) => {
        const lowest = Math.min(atMost, popupLeast);
        if (wholeScale >= lowest) return Math.min(atMost, wholeScale);
        if (roomScale >= lowest) return Math.min(atMost, roomScale);
        const across = width / (right - left);
        return across >= lowest ? Math.min(atMost, across) : atMost;
      };
      const own =
        floor > 0
          ? Math.max(floor, Math.min(1, width / (right - left), downScale))
          : Math.min(1, width / least, downScale);
      const scene = Math.max(legibleScale, Math.min(1, windowScale));
      const scale =
        (ownSize || legible) &&
        tile &&
        playingNow.current &&
        canvasElement.dataset.fitted !== undefined
          ? view.scale
          : ownSize
            ? popup
              ? popupScale(own)
              : own
            : legible
              ? popup
                ? popupScale(scene)
                : scene
              : tile
                ? windowScale
                : Math.min(
                    whole ? windowScale : 1,
                    width / (right - left),
                    height / (bottom - top),
                  );
      // A tile in place eases to where it is fitted next; anything else is placed at once.
      const eases = tile && canvasElement.dataset.fitted !== undefined && !still.matches;
      let toX = ((left + right) / 2) * scale;
      let toY = ((top + bottom) / 2) * scale;
      // Drawn at its own size, what is larger than the stage shows from its start, as a window
      // onto it, and what reaches past the stage's own edge, beyond the inset, is cut off there
      // and fades out (`data-cut`, Gallery.css).
      const across = (right - left) * scale;
      const down = (bottom - top) * scale;
      // A dialog drawn whole in the stage's room is centred on it, cut off nowhere.
      const inRoom = dialog && down <= room.height + 0.5 && across <= room.width + 0.5;
      // It starts at the component's own start, rather than its popups': a popup shifts to stay
      // in the window, and a view that followed it would shift it again. A dialog, over its
      // backdrop, is placed by the window alone and covers what opens it: it starts at its own.
      if (ownSize && across > width && !inRoom) {
        const own = boxes.filter(
          ({ element }) => dialog || !element.closest('.catalogue-overlay-layer'),
        );
        const start = own.length ? Math.min(...own.map(({ box }) => box.left)) : left;
        toX = start * scale + width / 2;
      }
      // A scene drawn at a legible scale shows from its top too, where it starts, such as a search
      // above the results it filters, and stays centred across.
      if ((ownSize || legible) && down > height && !inRoom) toY = top * scale + height / 2;
      // Drawn at a legible scale, a scene wider than the stage is cut off on both sides, fading
      // out there too.
      if (ownSize || legible) {
        const cut = [
          down > height + inset && !inRoom ? 'bottom' : '',
          !legible && across > width + inset && !inRoom ? 'end' : '',
          legible && across > stageElement.clientWidth ? 'start end' : '',
        ];
        const sides = cut.filter(Boolean).join(' ');
        if (sides) canvasElement.dataset.cut = sides;
        else delete canvasElement.dataset.cut;
        trimRows(canvasElement);
      }
      if (tile && playingNow.current && view.scale === scale) {
        toX = contain(view.toX, left * scale, right * scale, stageElement.clientWidth / 2 - inset);
        toY = contain(view.toY, top * scale, bottom * scale, stageElement.clientHeight / 2 - inset);
      }
      // Until it shows, it is placed at once, and shows only once its place has held for a few
      // frames, or after half a second, whatever is still moving: it appears in place, as every
      // preview does, by fading in.
      if (canvasElement.dataset.fitted === undefined) {
        const held =
          first.calm > 0 &&
          view.scale === scale &&
          Math.abs(view.x - toX) < 0.5 &&
          Math.abs(view.y - toY) < 0.5;
        first.calm = held ? first.calm + 1 : 1;
        first.tries += 1;
        view.x = view.toX = toX;
        view.y = view.toY = toY;
        view.scale = scale;
        place();
        for (const { element } of boxes) resize.observe(element);
        if (first.calm >= 3 || first.tries >= 30) canvasElement.dataset.fitted = '';
        else update();
        return;
      }
      // It follows only a change of a pixel or more: a popup is placed again as the view moves,
      // a fraction away, which would move the view again, in a tremble.
      if (
        eases &&
        playingNow.current &&
        view.scale === scale &&
        Math.hypot(toX - view.toX, toY - view.toY) < 1
      )
        return;
      view.toX = toX;
      view.toY = toY;
      if (eases && view.scale === scale) {
        if (!view.frame) {
          view.last = 0;
          view.frame = requestAnimationFrame(glide);
        }
      } else {
        view.x = view.toX;
        view.y = view.toY;
        view.scale = scale;
        place();
      }
      canvasElement.dataset.fitted = '';
      for (const { element } of boxes) resize.observe(element);
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
    // An overlay that opens with a transition measures its final box once it ends.
    canvasElement.addEventListener('transitionend', update);
    canvasElement.addEventListener('animationend', update);
    void document.fonts?.ready.then(update);
    // An overlay may size to the window, such as a sheet as tall as it.
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('resize', update);
      canvasElement.removeEventListener('transitionend', update);
      canvasElement.removeEventListener('animationend', update);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(view.frame);
      changes.disconnect();
      resize.disconnect();
      refit.current = null;
    };
  }, [stage, canvas, on, whole, tile, ownSize, legible]);
}

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
