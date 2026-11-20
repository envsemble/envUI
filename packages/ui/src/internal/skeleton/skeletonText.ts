import { roundToHundredth } from '../dom/lengths.js';
import { observeResize } from '../dom/observeResize.js';
import '../../styles/Base.css';
import '../../styles/Skeleton.css';

const skeletonTextAttribute = 'data-env-skeleton-text';

interface Tracked {
  stopResizing: () => void;
  mutations: MutationObserver;
  inlinePositionToRestore: string | undefined;
}

const tracked = new Map<HTMLElement, Tracked>();
let retained = 0;
let frame = 0;

const barHeightOfFontSize = 0.8;
const joinGapOfFontSize = 0.4;

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

const scrollInsideAnyElement = true;

function listen(on: boolean) {
  const method = on ? 'addEventListener' : 'removeEventListener';
  window[method]('resize', schedule);
  document[method]('scroll', schedule, scrollInsideAnyElement);
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
  const fresh = roots.filter((root) => !tracked.has(root));
  const staticReadBeforeAnyWrite = fresh.map(
    (root) => getComputedStyle(root).position === 'static',
  );
  fresh.forEach((root, index) => track(root, staticReadBeforeAnyWrite[index]));
  const measuredBeforeAnyIsSet = roots.map((root) => [root, measureBars(root)] as const);
  for (const [root, values] of measuredBeforeAnyIsSet)
    for (const [property, value] of Object.entries(values))
      if (root.style.getPropertyValue(property) !== value) root.style.setProperty(property, value);
}

function track(root: HTMLElement, isStatic: boolean) {
  root.setAttribute(skeletonTextAttribute, '');
  const inlinePositionToRestore = isStatic ? becomeContainingBlockForBars(root) : undefined;
  const stopResizing = observeResize(root, schedule);
  const mutations = new MutationObserver((records) => {
    const onlyOwnBarsChanged = records.every(
      (record) => record.target === root && record.attributeName === 'style',
    );
    if (!onlyOwnBarsChanged) schedule();
  });
  mutations.observe(root, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'hidden', 'data-env-skeleton'],
  });
  tracked.set(root, { stopResizing, mutations, inlinePositionToRestore });
}

function becomeContainingBlockForBars(root: HTMLElement) {
  const inlinePosition = root.style.position;
  root.style.position = 'relative';
  return inlinePosition;
}

function untrack(root: HTMLElement, state: Tracked) {
  state.stopResizing();
  state.mutations.disconnect();
  tracked.delete(root);
  root.removeAttribute(skeletonTextAttribute);
  for (const property of layerProperties) root.style.removeProperty(property);
  if (state.inlinePositionToRestore !== undefined)
    root.style.position = state.inlinePositionToRestore;
}

const layerProperties = [
  '--_skeleton-text-bars',
  '--_skeleton-text-left',
  '--_skeleton-text-top',
  '--_skeleton-text-width',
  '--_skeleton-text-height',
];

interface Bar {
  x: number;
  y: number;
  width: number;
  height: number;
  gap: number;
}

function partLeftVisibleByClippingAncestors(element: Element, root: HTMLElement, rect: DOMRect) {
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

function measureBars(root: HTMLElement): Record<string, string> {
  const box = root.getBoundingClientRect();
  const originX = box.left + root.clientLeft - root.scrollLeft;
  const originY = box.top + root.clientTop - root.scrollTop;
  const bars: Bar[] = [];
  const range = document.createRange();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text;
    if (!text.data.trim()) continue;
    const parent = text.parentElement;
    if (!parent) continue;
    const drawnByNestedSkeleton = parent.closest('[data-env-skeleton]') !== root;
    const readNotShown = parent.closest('.env-skeleton-status') !== null;
    if (drawnByNestedSkeleton || readNotShown) continue;
    const style = getComputedStyle(parent);
    const insideFilledShape = style.getPropertyValue('--_skeleton-shape').trim() === '1';
    if (insideFilledShape) continue;
    if (style.visibility !== 'visible') continue;
    const fontSize = Number.parseFloat(style.fontSize) || 16;
    range.selectNodeContents(text);
    for (const rect of range.getClientRects()) {
      if (rect.width < 1 || rect.height < 1) continue;
      const { left, right, top, bottom } = partLeftVisibleByClippingAncestors(parent, root, rect);
      if (right - left < 1 || bottom - top < 1) continue;
      const height = Math.min(rect.height, fontSize * barHeightOfFontSize);
      bars.push({
        x: left - originX,
        y: rect.top + (rect.height - height) / 2 - originY,
        width: right - left,
        height,
        gap: fontSize * joinGapOfFontSize,
      });
    }
  }
  range.detach();
  const joined = joinNearlyTouchingBarsOnALine(bars);
  const { left, top, right, bottom } = layerReachingEveryBarOfScrolledContent(root, joined);
  const layers = joined.map(
    (bar) =>
      `var(--_skeleton-rect) ${roundToHundredth(bar.x - left)}px ${roundToHundredth(bar.y - top)}px / ${roundToHundredth(bar.width)}px ${roundToHundredth(bar.height)}px no-repeat`,
  );
  return {
    '--_skeleton-text-bars':
      layers.length > 0 ? layers.join(', ') : 'linear-gradient(transparent 0 0)',
    '--_skeleton-text-left': `${roundToHundredth(left)}px`,
    '--_skeleton-text-top': `${roundToHundredth(top)}px`,
    '--_skeleton-text-width': `${roundToHundredth(right - left)}px`,
    '--_skeleton-text-height': `${roundToHundredth(bottom - top)}px`,
  };
}

function joinNearlyTouchingBarsOnALine(bars: Bar[]): Bar[] {
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
  return joined;
}

function layerReachingEveryBarOfScrolledContent(root: HTMLElement, bars: Bar[]) {
  const rootStyle = getComputedStyle(root);
  const scrollsX = rootStyle.overflowX !== 'visible';
  const scrollsY = rootStyle.overflowY !== 'visible';
  let left = 0;
  let top = 0;
  let right = root.clientWidth;
  let bottom = root.clientHeight;
  for (const bar of bars) {
    if (scrollsX) {
      left = Math.min(left, bar.x);
      right = Math.max(right, bar.x + bar.width);
    }
    if (scrollsY) {
      top = Math.min(top, bar.y);
      bottom = Math.max(bottom, bar.y + bar.height);
    }
  }
  return { left, top, right, bottom };
}
