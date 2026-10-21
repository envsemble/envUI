import {
  startTransition,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { Link, PortalContainer, Text, Theme, useTheme } from '@envsemble/envui';
import { Article } from '@envsemble/envui/icons/Article';
import type { DocumentationMetadata, StageFill } from '../DocumentationTypes';
import { routeHref } from '../navigation/Address';
import { pageHref, referencePages, routeOfDocument } from '../navigation/DocumentationRoutes';
import { Documentation } from '../pages/Documentation';
import { documents, type Documentation as Document } from '../Reference';
import { ExampleRender } from './LiveExample';

/**
 * The page that documents a component, for the alternatives a page suggests and the exports a
 * pattern combines: a part such as Menu.Item is documented on the page of its namespace.
 */
export function pageOf(component: string) {
  const namespace = component.split('.')[0];
  return referencePages.find((page) => page.reference.metadata?.components.includes(namespace));
}

/** The address of a related page: a reference page's overview, or any other page's route. */
export function relatedHref(id: string) {
  const page = referencePages.find((item) => item.reference.id === id);
  if (page) return pageHref(page, 'overview');
  const route = routeOfDocument(id);
  return route && routeHref(route);
}

/** The example a tile previews: a page's file, and whether its overlays are shown open. */
interface Preview {
  page: string;
  name: string;
  open: boolean;
  /** The fill its figure's stage takes, where the page's would hide it. */
  stage?: StageFill;
}

/** Letters alone, lower case, to match an export's name with a figure's heading or file. */
const squash = (text: string) => text.toLowerCase().replace(/[^a-z\d]/g, '');

/**
 * What a tile shows of a page: where its component floats over the page, such as a dialog or a
 * menu, its anatomy figure, which shows it open; else the Overview's first example, its lead
 * example. For an export that isn't the page's first, such as Textarea on the TextField page, the
 * first example named after it, where there is one.
 */
export function previewOf(document: Document, component?: string): Preview | undefined {
  const blocks = (document.sections ?? []).flatMap((section) =>
    section.blocks.flatMap((block) => (block.kind === 'example' ? [block] : [])),
  );
  const anatomy = blocks.find((block) => block.role === 'anatomy');
  const own = component && document.metadata?.components[0] !== component.split('.')[0];
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
  if (!chosen || chosen.kind !== 'example') return undefined;
  return {
    page: document.id,
    name: chosen.name,
    open: Boolean(chosen.open),
    stage: chosen.stage,
  };
}

/** One alternative a page suggests, with the situations that call for it. */
interface Alternative {
  key: string;
  name: string;
  href?: string;
  preview?: Preview;
  lines: string[];
}

/**
 * The alternatives of a page's `avoidWhen`, one for each component or page it names, in the order
 * it names them; the situations that name none are left over.
 */
export function alternativesOf(metadata: DocumentationMetadata) {
  const alternatives: Alternative[] = [];
  const rest: string[] = [];
  for (const { text, use, see } of metadata.avoidWhen) {
    const key = use ?? (see && `page:${see}`);
    if (!key) {
      rest.push(text);
      continue;
    }
    const found = alternatives.find((item) => item.key === key);
    if (found) {
      found.lines.push(text);
      continue;
    }
    if (use) {
      const page = pageOf(use);
      alternatives.push({
        key,
        name: use,
        href: page && pageHref(page, 'overview'),
        preview: page && previewOf(page.reference, use),
        lines: [text],
      });
    } else if (see) {
      const document = documents.find((item) => item.id === see);
      alternatives.push({
        key,
        name: document?.title ?? see,
        href: relatedHref(see),
        preview: document && previewOf(document),
        lines: [text],
      });
    }
  }
  return { alternatives, rest };
}

/** The least room, in px, between a preview and its stage's edges. */
const inset = 16;

/**
 * The boxes a preview shows, in the canvas's own px: each outermost box that has a size and isn't
 * a scrim or a positioner over the whole canvas, such as a dialog's.
 */
function shownBoxes(canvas: HTMLElement) {
  const frame = canvas.getBoundingClientRect();
  const scale = frame.width / canvas.offsetWidth || 1;
  const area = { width: canvas.offsetWidth, height: canvas.offsetHeight };
  const found: { element: HTMLElement; box: DOMRect }[] = [];
  const visit = (element: Element) => {
    for (const child of element.children) {
      if (!(child instanceof HTMLElement)) continue;
      const rect = child.getBoundingClientRect();
      // Content that overflows its box, such as a long label, counts too.
      const box = new DOMRect(
        (rect.left - frame.left) / scale,
        (rect.top - frame.top) / scale,
        Math.max(rect.width / scale, child.scrollWidth),
        Math.max(rect.height / scale, child.scrollHeight),
      );
      const covers =
        box.width >= area.width - 1 &&
        box.height >= area.height - 1 &&
        /absolute|fixed/.test(getComputedStyle(child).position);
      if (box.width > 1 && box.height > 1 && !covers) found.push({ element: child, box });
      else visit(child);
    }
  };
  visit(canvas);
  return found;
}

/**
 * Scales the preview down until what it shows fits its stage, and centres it there: CSS can't
 * size a box to what its content measures. It follows the stage's width, the preview as it loads
 * and resizes, and the overlays as they open and are placed.
 */
function useFit(
  stage: RefObject<HTMLElement | null>,
  canvas: RefObject<HTMLElement | null>,
  on: boolean,
) {
  useLayoutEffect(() => {
    const stageElement = stage.current;
    const canvasElement = canvas.current;
    if (!on || !stageElement || !canvasElement) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    const resize = new ResizeObserver(update);
    const fit = () => {
      const boxes = shownBoxes(canvasElement);
      if (!boxes.length) return;
      const left = Math.min(...boxes.map(({ box }) => box.left));
      const top = Math.min(...boxes.map(({ box }) => box.top));
      const right = Math.max(...boxes.map(({ box }) => box.right));
      const bottom = Math.max(...boxes.map(({ box }) => box.bottom));
      const scale = Math.min(
        1,
        (stageElement.clientWidth - 2 * inset) / (right - left),
        (stageElement.clientHeight - 2 * inset) / (bottom - top),
      );
      const x = ((left + right) / 2) * scale;
      const y = ((top + bottom) / 2) * scale;
      const transform = `translate(${-x}px, ${-y}px) scale(${scale})`;
      if (canvasElement.style.transform !== transform) canvasElement.style.transform = transform;
      canvasElement.dataset.fitted = '';
      for (const { element } of boxes) resize.observe(element);
    };
    resize.observe(stageElement);
    resize.observe(canvasElement);
    // Popups are placed a frame or two after they render, without changing size.
    const timers = [100, 400, 1200].map((delay) => setTimeout(update, delay));
    void document.fonts?.ready.then(update);
    // An overlay may size to the window, such as a sheet as tall as it.
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('resize', update);
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      resize.disconnect();
    };
  }, [stage, canvas, on]);
}

/**
 * A tiny live picture of an alternative on the dotted stage: its example, inert and scaled down
 * to fit, rendered once the tiles near the viewport. Without an example, a page icon.
 */
function TilePreview({ preview, near }: { preview?: Preview; near: boolean }) {
  const theme = useTheme();
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  const shown = Boolean(preview && near);
  useFit(stage, canvas, shown);
  return (
    <Theme
      {...theme}
      ref={stage}
      className="docs-when-stage"
      data-example={preview?.name}
      data-stage={preview?.stage}
      data-empty={preview ? undefined : ''}
    >
      {!preview ? (
        <Article className="docs-when-placeholder" aria-hidden />
      ) : (
        shown && (
          <div ref={canvas} className="docs-when-canvas" inert aria-hidden>
            {preview.open ? (
              <PortalContainer container={layer} contained>
                <ExampleRender page={preview.page} name={preview.name} fallback={null} />
              </PortalContainer>
            ) : (
              <ExampleRender page={preview.page} name={preview.name} fallback={null} />
            )}
            {preview.open && <div ref={setLayer} className="docs-overlay-layer" />}
          </div>
        )
      )}
    </Theme>
  );
}

/** Whether an element is near the viewport, once: the tiles render their examples from then on. */
function useNear(element: RefObject<HTMLElement | null>) {
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

/** The alternatives as tiles of one size: a preview on its stage, the name and its situations. */
function Tiles({ alternatives, path }: { alternatives: Alternative[]; path: string }) {
  const list = useRef<HTMLUListElement>(null);
  const near = useNear(list);
  return (
    <ul ref={list} className="docs-when-tiles" data-count={alternatives.length}>
      {alternatives.map(({ key, name, href, preview, lines }) => (
        <li key={key} className="docs-when-tile">
          {href ? (
            // The picture leads to the page too, for a pointer; the name is the link to read.
            <a href={href} className="docs-when-picture" tabIndex={-1} aria-hidden>
              <TilePreview preview={preview} near={near} />
            </a>
          ) : (
            <TilePreview preview={preview} near={near} />
          )}
          <Text render={<span />} className="docs-when-name">
            {href ? <Link href={href}>{name}</Link> : name}
          </Text>
          <div className="docs-when-line">
            <Documentation markdown={lines.join(' ')} path={path} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * The start of When to use on a page on the figure template, from its frontmatter: a short list of
 * what it is for, then a tile for each component or page to use instead, and what it is built from.
 */
export function WhenToUse({
  metadata,
  path,
  exportLink,
}: {
  metadata: DocumentationMetadata;
  path: string;
  /** An export as a Markdown link to the page that documents it. */
  exportLink: (name: string) => string;
}) {
  const { alternatives, rest } = alternativesOf(metadata);
  const list = (items: string[]) => items.map((text) => `- ${text}`).join('\n');
  return (
    <div className="docs-when">
      <Documentation markdown={`### Use it when\n\n${list(metadata.useWhen)}`} path={path} />
      {(alternatives.length > 0 || rest.length > 0) && (
        <div className="docs-when-else">
          <Documentation markdown="### Use something else" path={path} />
          {alternatives.length > 0 && <Tiles alternatives={alternatives} path={path} />}
          {rest.length > 0 && <Documentation markdown={list(rest)} path={path} />}
        </div>
      )}
      {metadata.composes?.length ? (
        <Documentation
          markdown={`### Built from\n\n${metadata.composes.map(exportLink).join(', ')}`}
          path={path}
        />
      ) : null}
    </div>
  );
}
