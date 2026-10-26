import {
  Component,
  startTransition,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { Column, Link, PortalContainer, Text, Theme, useTheme } from '@envsemble/envui';
import { Article } from '@envsemble/envui/icons/Article';
import type { DocumentationMetadata, StageFill } from '../DocumentationTypes';
import { routeHref } from '../navigation/Address';
import { pageHref, referencePages, routeOfDocument } from '../navigation/SiteRoutes';
import { Documentation } from '../pages/Documentation';
import { Playback, usePlaying } from '../previews/Motion';
import { useDisplaySettings } from '../theme/DisplaySettings';
import { tileOf, tileWindows } from '../tiles/Tiles';
import { documents, type Documentation as Document } from '../Reference';
import { ExampleRender } from './LiveExample';
import { hasPageSpecimen, PageSpecimen } from './PageSpecimens';

/**
 * The page that documents a component, for the components a page relates to and the exports a
 * pattern combines: a part such as Menu.Item is documented on the page of its namespace, and an
 * export such as Icon on the foundation's page that names it.
 */
export function pageOf(component: string) {
  const namespace = component.split('.')[0];
  return referencePages.find((page) =>
    (page.reference.metadata?.components ?? page.reference.components)?.includes(namespace),
  );
}

/** The address of a related page: a component's or foundation's page, or any other page's route. */
export function relatedHref(id: string) {
  const page = referencePages.find((item) => item.reference.id === id);
  if (page) return pageHref(page);
  const route = routeOfDocument(id);
  return route && routeHref(route);
}

/** The example a tile previews: a page's file, and whether its overlays are shown open. */
export interface Preview {
  page: string;
  name: string;
  open: boolean;
  /** The fill its figure's stage takes, where the page's would hide it. */
  stage?: StageFill;
  /** A page without an example, such as a foundation's: the id of its specimen (PageSpecimens.tsx). */
  specimen?: string;
  /**
   * A composition drawn for the tile instead of an example: the page's own tile (tiles/Tiles.ts).
   */
  composition?: ComponentType;
  /** Whether the composition is the page's own tile, drawn in the tiles' window (Related.css). */
  tile?: boolean;
  /** The window a tile lays out in, in rem, where it needs a larger one than the tiles'. */
  window?: { width: number; height: number };
}

/** Letters alone, lower case, to match an export's name with a figure's heading or file. */
const squash = (text: string) => text.toLowerCase().replace(/[^a-z\d]/g, '');

/**
 * What a tile shows of a page: its own tile, where it has one (tiles/Tiles.ts); else where its
 * component floats over the page, such as a dialog or a menu, its anatomy figure, which shows it
 * open; else the Overview's first example, its lead example. For an export that isn't the page's
 * first, such as Textarea on the TextField page, the first example named after it, where there is
 * one. A page without one, such as a foundation's, shows its specimen.
 */
export function previewOf(document: Document, component?: string): Preview | undefined {
  const own = component && document.metadata?.components[0] !== component.split('.')[0];
  const tile = !own && tileOf(document.id);
  // A tile's popups, such as a menu it opens as it plays, open inside its canvas.
  if (tile)
    return {
      page: document.id,
      name: document.id,
      open: true,
      composition: tile,
      tile: true,
      window: tileWindows[document.id],
    };
  const blocks = (document.sections ?? []).flatMap((section) =>
    section.blocks.flatMap((block) => (block.kind === 'example' ? [block] : [])),
  );
  const anatomy = blocks.find((block) => block.role === 'anatomy');
  const named =
    own &&
    blocks.find(
      (block) =>
        !block.role &&
        !block.widths &&
        [block.name, block.heading].some((text) => squash(text).includes(squash(component))),
    );
  const lead = document.sections
    ?.find((section) => section.id === 'overview')
    ?.blocks.find((block) => block.kind === 'example' && !block.role);
  const chosen = named || (!own && anatomy?.open ? anatomy : lead);
  if (!chosen || chosen.kind !== 'example')
    return hasPageSpecimen(document.id)
      ? { page: document.id, name: document.id, open: false, specimen: document.id }
      : undefined;
  return {
    page: document.id,
    name: chosen.name,
    open: Boolean(chosen.open),
    stage: chosen.stage,
  };
}

/** One component or page a page relates to, with when to pick it instead. */
interface Alternative {
  key: string;
  name: string;
  href?: string;
  preview?: Preview;
  line: string;
}

/**
 * The page's related components and pages, from its `avoidWhen`, one for each export or page it
 * names, in its order.
 */
export function alternativesOf(metadata: DocumentationMetadata): Alternative[] {
  return metadata.avoidWhen.map(({ text, use, see }) => {
    if (use) {
      const page = pageOf(use);
      return {
        key: use,
        name: use,
        href: page && pageHref(page),
        preview: page && previewOf(page.reference, use),
        line: text,
      };
    }
    const document = documents.find((item) => item.id === see);
    return {
      key: `page:${see}`,
      name: document?.title ?? see ?? '',
      href: see && relatedHref(see),
      preview: document && previewOf(document),
      line: text,
    };
  });
}

/**
 * Keeps a tile that fails to render to itself: it shows nothing, and the gallery around it its
 * other tiles, rather than the page failing.
 */
class TileBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** The least room, in px, between a preview and its stage's edges. */
const inset = 16;

/** The most a page's own tile is enlarged: written for its small window, it is drawn large. */
const most = 2;

/** Whether a color paints anything: not transparent, nor of no alpha. */
const opaque = (color: string) =>
  color !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(color) && !/\/\s*0\)$/.test(color);

/**
 * Whether an element is clipped away whole, as a visually hidden one is (`clip-path: inset(50%)`),
 * such as a notification region's announcer, which only a screen reader reads.
 */
export const clippedAway = (style: CSSStyleDeclaration) => /^inset\((50|100)%/.test(style.clipPath);

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
 * rather than the boxes that lay it out. A scrim or a positioner over the whole canvas, such as a
 * dialog's, counts only for what it holds; what is hidden, transparent or a visually hidden pixel
 * doesn't count.
 */
function shownBoxes(canvas: HTMLElement) {
  const frame = canvas.getBoundingClientRect();
  const scale = frame.width / canvas.offsetWidth || 1;
  const area = { width: canvas.offsetWidth, height: canvas.offsetHeight };
  const found: { element: Element; box: DOMRect }[] = [];
  // The canvas hides until it is first fitted, and what it holds with it: only what hides by
  // itself is hidden.
  const shown = getComputedStyle(canvas).visibility;
  // What a box that clips its content, such as a scrolling list, holds outside it doesn't show:
  // each box counts as far as the boxes around it that clip show it.
  const visit = (element: Element, clip: DOMRect | null) => {
    for (const child of element.children) {
      const style = getComputedStyle(child);
      if (style.display === 'none' || clippedAway(style)) continue;
      // What is transparent doesn't show, unless it is on its way in or out, such as a popup
      // starting its entrance: the view is placed for it, rather than without it and back.
      if (style.opacity === '0' && !moving(child)) continue;
      if (style.visibility === 'hidden' && shown !== 'hidden') continue;
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
function useFit(
  stage: RefObject<HTMLElement | null>,
  canvas: RefObject<HTMLElement | null>,
  on: boolean,
  whole: boolean,
  tile: boolean,
  playing: boolean,
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
    const place = () => {
      const transform = `translate(${-view.x}px, ${-view.y}px) scale(${view.scale})`;
      if (canvasElement.style.transform !== transform) canvasElement.style.transform = transform;
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
      const scale = tile
        ? windowScale
        : Math.min(whole ? windowScale : 1, width / (right - left), height / (bottom - top));
      // A tile in place eases to where it is fitted next; anything else is placed at once.
      const eases = tile && canvasElement.dataset.fitted !== undefined && !still.matches;
      let toX = ((left + right) / 2) * scale;
      let toY = ((top + bottom) / 2) * scale;
      if (tile && playingNow.current && view.scale === scale) {
        toX = contain(view.toX, left * scale, right * scale, stageElement.clientWidth / 2 - inset);
        toY = contain(view.toY, top * scale, bottom * scale, stageElement.clientHeight / 2 - inset);
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
  }, [stage, canvas, on, whole, tile]);
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

/**
 * A tiny live picture of an alternative on the recessed canvas: its example, inert and scaled down
 * to fit, rendered once the tiles near the viewport; for a page without one, its specimen, in the
 * same way. Without either, a page icon. A page's own tile, or a gallery's composition, takes the
 * example's place. A gallery's tile passes its own stage class. While `playing`, unless the
 * sidebar paused every animation, its animation plays (previews/Motion.tsx), and it rests at its
 * still once that ends.
 */
export function TilePreview({
  preview,
  near,
  playing = false,
  className = 'catalogue-related-stage',
  whole = false,
}: {
  preview?: Preview;
  near: boolean;
  /** Whether the pointer or the keyboard is on the tile, which plays its animation. */
  playing?: boolean;
  className?: string;
  /** Whether the window it lays out in counts whole as it is fitted, as a gallery's does. */
  whole?: boolean;
}) {
  const Composition = preview?.composition;
  const theme = useTheme();
  const { motionPaused } = useDisplaySettings();
  const plays = playing && !motionPaused;
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  // The canvas, for the pointer no one sees, which finds the preview's elements in it.
  const [canvasElement, setCanvasElement] = useState<HTMLDivElement | null>(null);
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  const shown = Boolean(preview && near);
  const subject =
    preview &&
    (Composition ? (
      <TileBoundary>
        <Suspense fallback={null}>
          <Playback playing={plays} rest="start" root={canvasElement}>
            <Composition />
          </Playback>
        </Suspense>
      </TileBoundary>
    ) : preview.specimen ? (
      <PageSpecimen id={preview.specimen} />
    ) : (
      <ExampleRender page={preview.page} name={preview.name} fallback={null} />
    ));
  const tile = Boolean(preview?.tile);
  useFit(stage, canvas, shown, whole || tile, tile, plays);
  return (
    <Theme
      {...theme}
      ref={stage}
      className={className}
      data-example={preview?.specimen || Composition ? undefined : preview?.name}
      data-specimen={preview?.specimen}
      data-stage={preview?.stage}
      data-empty={preview ? undefined : ''}
    >
      {!preview ? (
        <Article className="catalogue-related-placeholder" aria-hidden />
      ) : (
        shown && (
          <div
            ref={(element) => {
              canvas.current = element;
              setCanvasElement(element);
            }}
            className="catalogue-related-canvas"
            data-tile={preview.tile ? '' : undefined}
            style={
              preview.window &&
              ({
                '--catalogue-tile-width': `${preview.window.width}rem`,
                '--catalogue-tile-height': `${preview.window.height}rem`,
              } as CSSProperties)
            }
            inert
            aria-hidden
          >
            {preview.open ? (
              <PortalContainer container={layer} contained>
                {subject}
              </PortalContainer>
            ) : (
              subject
            )}
            {preview.open && <div ref={setLayer} className="catalogue-overlay-layer" />}
          </div>
        )
      )}
    </Theme>
  );
}

/** Whether an element is near the viewport, once: the tiles render their examples from then on. */
export function useNear(element: RefObject<HTMLElement | null>) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const target = element.current;
    if (!target || near) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        // The examples load and render without holding up what the reader is doing.
        startTransition(() => setNear(true));
      },
      { rootMargin: '600px 0px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [element, near]);
  return near;
}

/** One alternative's tile, whose preview plays while the pointer or the keyboard is on it. */
function RelatedTile({
  preview,
  near,
  children,
}: {
  preview?: Preview;
  near: boolean;
  children: ReactNode;
}) {
  const [playing, playOn] = usePlaying();
  return (
    <li className="catalogue-related-tile" {...playOn}>
      <TilePreview preview={preview} near={near} playing={playing} />
      {children}
    </li>
  );
}

/** The alternatives as tiles of one size: a preview on its stage, the name and its situations. */
function Tiles({ alternatives, path }: { alternatives: Alternative[]; path: string }) {
  const list = useRef<HTMLUListElement>(null);
  const near = useNear(list);
  return (
    <ul ref={list} className="catalogue-related-tiles" data-count={alternatives.length}>
      {alternatives.map(({ key, name, href, preview, line }) => (
        <RelatedTile key={key} preview={preview} near={near}>
          {/* The name is the link; it stretches over the picture, so a pointer can follow it from
              there too without a link around the preview, whose example may hold links itself. */}
          <Text render={<span />} className="catalogue-related-name">
            {href ? (
              <Link href={href} className="catalogue-related-link">
                {name}
              </Link>
            ) : (
              name
            )}
          </Text>
          <div className="catalogue-related-line">
            <Documentation markdown={line} path={path} />
          </div>
        </RelatedTile>
      ))}
    </ul>
  );
}

/**
 * Related, the last section of a component or pattern page: a tile for each component or page its
 * frontmatter names, with when to pick it instead. It ends the page (TemplateContent.tsx).
 */
export function Related({ metadata, path }: { metadata: DocumentationMetadata; path: string }) {
  const alternatives = alternativesOf(metadata);
  if (!alternatives.length) return null;
  return (
    <Column render={<section />} gap={4} className="catalogue-related" data-section="related">
      <Text render={<h2 />} variant="headline" id="related">
        Related
      </Text>
      <Tiles alternatives={alternatives} path={path} />
    </Column>
  );
}
