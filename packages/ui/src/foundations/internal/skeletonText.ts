import { roundToHundredth } from '../../internal/dom/lengths.js';
import '../../styles/Base.css';
import '../../styles/Skeleton.css';
// Text that is there in a skeleton, such as a heading that doesn't wait for data, drawn as bars like
// the rest: a rounded bar over each line of it, which pulses with the other bars. CSS alone draws
// such text as a line through it, square and in one color, which stays as the fallback until this
// runs, as on a server. Here, a skeleton's root draws every bar in one pseudo-element over its
// content (Skeleton.css, [data-env-skeleton-text]::after), masked by a rounded rectangle at each
// line box of its text, which the script measures and sets as --env-skeleton-text-bars. Nothing is
// added to the content, so its layout and selectors don't change.

/** The attribute that marks a root whose text bars the script draws, which hides the line through. */
const skeletonTextAttribute = 'data-env-skeleton-text';

interface Tracked {
  resize: ResizeObserver | undefined;
  mutations: MutationObserver;
  /** The inline position the root had, where the script made it a containing block. */
  position: string | undefined;
}

const tracked = new Map<HTMLElement, Tracked>();
let retained = 0;
let frame = 0;

/** How thick a bar is, of its text's font size, and the gap two bars on a line close. */
const barHeight = 0.8;
const joinGap = 0.4;

/**
 * Draws the bars of every skeleton on the page while at least one SkeletonScope that is a skeleton
 * is mounted; the function it returns lets go.
 */
export function retainSkeletonText(): () => void {
  if (typeof window === 'undefined') return () => {};
  retained += 1;
  if (retained === 1) listen(true);
  schedule();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    retained -= 1;
    if (retained === 0) listen(false);
    schedule();
  };
}

function listen(on: boolean) {
  const method = on ? 'addEventListener' : 'removeEventListener';
  window[method]('resize', schedule);
  // Scrolling inside a skeleton moves its text against its root.
  document[method]('scroll', schedule, true);
  document.fonts?.[method]('loadingdone', schedule);
}

function schedule() {
  if (frame || typeof requestAnimationFrame === 'undefined') return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    sync();
  });
}

function sync() {
  const roots =
    retained > 0 ? [...document.querySelectorAll<HTMLElement>('[data-env-skeleton]')] : [];
  for (const [root, state] of tracked)
    if (!root.isConnected || !roots.includes(root)) untrack(root, state);
  // Every root is tracked, then every one measured, then every one's bars set: setting a root's bars
  // between measuring two would make the browser work out the page again for each.
  for (const root of roots) if (!tracked.has(root)) track(root);
  const drawn = roots.map((root) => [root, barsOf(root)] as const);
  for (const [root, values] of drawn)
    for (const [property, value] of Object.entries(values))
      if (root.style.getPropertyValue(property) !== value) root.style.setProperty(property, value);
}

function track(root: HTMLElement) {
  root.setAttribute(skeletonTextAttribute, '');
  // The bars are laid out over the root's padding box, which a static root can't hold.
  let position: string | undefined;
  if (getComputedStyle(root).position === 'static') {
    position = root.style.position;
    root.style.position = 'relative';
  }
  const resize = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(schedule);
  resize?.observe(root);
  const mutations = new MutationObserver((records) => {
    // The bars the script sets on the root's style change nothing to measure.
    if (records.some((record) => !(record.target === root && record.attributeName === 'style')))
      schedule();
  });
  mutations.observe(root, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'hidden', 'data-env-skeleton'],
  });
  tracked.set(root, { resize, mutations, position });
}

function untrack(root: HTMLElement, state: Tracked) {
  state.resize?.disconnect();
  state.mutations.disconnect();
  tracked.delete(root);
  root.removeAttribute(skeletonTextAttribute);
  for (const property of layerProperties) root.style.removeProperty(property);
  if (state.position !== undefined) root.style.position = state.position;
}

/** The properties the script sets on a root: the bars, and the layer's place and size. */
const layerProperties = [
  '--env-skeleton-text-bars',
  '--env-skeleton-text-left',
  '--env-skeleton-text-top',
  '--env-skeleton-text-width',
  '--env-skeleton-text-height',
];

interface Bar {
  x: number;
  y: number;
  width: number;
  height: number;
  gap: number;
}

/** The part of a rectangle that the element's clipping ancestors, up to the root, leave visible,
    across and down: a closed section, kept in the page at no height, clips its text away. */
function visibleRect(element: Element, root: HTMLElement, rect: DOMRect) {
  let { left, right, top, bottom } = rect;
  for (let at: Element | null = element; at && at !== root; at = at.parentElement) {
    const style = getComputedStyle(at);
    const clipsX = style.overflowX !== 'visible';
    const clipsY = style.overflowY !== 'visible';
    if (!clipsX && !clipsY) continue;
    const box = at.getBoundingClientRect();
    if (clipsX) {
      left = Math.max(left, box.left);
      right = Math.min(right, box.right);
    }
    if (clipsY) {
      top = Math.max(top, box.top);
      bottom = Math.min(bottom, box.bottom);
    }
  }
  return { left, right, top, bottom };
}

/** Measures the root's text: the bars it draws, as the properties that draw them. */
function barsOf(root: HTMLElement): Record<string, string> {
  const box = root.getBoundingClientRect();
  const originX = box.left + root.clientLeft - root.scrollLeft;
  const originY = box.top + root.clientTop - root.scrollTop;
  const bars: Bar[] = [];
  const range = document.createRange();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    // The walker shows text nodes only.
    const text = node as Text;
    if (!text.data.trim()) continue;
    const parent = text.parentElement;
    // A nested skeleton draws its own text, and the status beside a list is read, not shown.
    if (!parent || parent.closest('[data-env-skeleton]') !== root) continue;
    if (parent.closest('.env-skeleton-status')) continue;
    const style = getComputedStyle(parent);
    // A shape, such as a button or a badge, is filled, and what it holds isn't drawn.
    if (style.getPropertyValue('--env-skeleton-shape').trim() === '1') continue;
    if (style.visibility !== 'visible') continue;
    const fontSize = Number.parseFloat(style.fontSize) || 16;
    range.selectNodeContents(text);
    for (const rect of range.getClientRects()) {
      if (rect.width < 1 || rect.height < 1) continue;
      const { left, right, top, bottom } = visibleRect(parent, root, rect);
      if (right - left < 1 || bottom - top < 1) continue;
      const height = Math.min(rect.height, fontSize * barHeight);
      bars.push({
        x: left - originX,
        y: rect.top + (rect.height - height) / 2 - originY,
        width: right - left,
        height,
        gap: fontSize * joinGap,
      });
    }
  }
  range.detach();
  // Bars on one line that nearly touch, such as words in two elements, join into one.
  bars.sort((a, b) => Math.round(a.y) - Math.round(b.y) || a.x - b.x);
  const joined: Bar[] = [];
  for (const bar of bars) {
    const last = joined.at(-1);
    if (
      last &&
      Math.abs(last.y - bar.y) < 1 &&
      Math.abs(last.height - bar.height) < 1 &&
      bar.x <= last.x + last.width + Math.max(last.gap, bar.gap)
    )
      last.width = Math.max(last.width, bar.x + bar.width - last.x);
    else joined.push({ ...bar });
  }
  // The layer is placed from the start of the root's scrolled content. A root that scrolls, such as
  // a table's region or a tall dialog, holds content beyond its box, and along the axis it scrolls
  // the layer reaches every bar, so none past the first screen is cut off. It spans the bars and the
  // box, never more, so it doesn't add to what the root scrolls; leftwards of the start, as under
  // dir=rtl, it starts at the first bar. A root that doesn't scroll keeps the layer to its box.
  const rootStyle = getComputedStyle(root);
  const scrollsX = rootStyle.overflowX !== 'visible';
  const scrollsY = rootStyle.overflowY !== 'visible';
  let left = 0;
  let top = 0;
  let right = root.clientWidth;
  let bottom = root.clientHeight;
  for (const bar of joined) {
    if (scrollsX) {
      left = Math.min(left, bar.x);
      right = Math.max(right, bar.x + bar.width);
    }
    if (scrollsY) {
      top = Math.min(top, bar.y);
      bottom = Math.max(bottom, bar.y + bar.height);
    }
  }
  const layers = joined.map(
    (bar) =>
      `var(--env-skeleton-rect) ${roundToHundredth(bar.x - left)}px ${roundToHundredth(bar.y - top)}px / ${roundToHundredth(bar.width)}px ${roundToHundredth(bar.height)}px no-repeat`,
  );
  return {
    '--env-skeleton-text-bars':
      layers.length > 0 ? layers.join(', ') : 'linear-gradient(transparent 0 0)',
    '--env-skeleton-text-left': `${roundToHundredth(left)}px`,
    '--env-skeleton-text-top': `${roundToHundredth(top)}px`,
    '--env-skeleton-text-width': `${roundToHundredth(right - left)}px`,
    '--env-skeleton-text-height': `${roundToHundredth(bottom - top)}px`,
  };
}
