import {
  startTransition,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type RefObject,
} from 'react';
import { Column, Link, PortalContainer, Text, Theme, useTheme } from '@envsemble/envui';
import { Article } from '@envsemble/envui/icons/Article';
import type { DocumentationMetadata, StageFill } from '../DocumentationTypes';
import { routeHref } from '../navigation/Address';
import { pageHref, referencePages, routeOfDocument } from '../navigation/DocumentationRoutes';
import { Documentation } from '../pages/Documentation';
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
  /** A composition drawn for the tile instead of an example, such as a gallery's (GalleryPreviews.tsx). */
  composition?: ComponentType;
}

/** Letters alone, lower case, to match an export's name with a figure's heading or file. */
const squash = (text: string) => text.toLowerCase().replace(/[^a-z\d]/g, '');

/**
 * What a tile shows of a page: where its component floats over the page, such as a dialog or a
 * menu, its anatomy figure, which shows it open; else the Overview's first example, its lead
 * example. For an export that isn't the page's first, such as Textarea on the TextField page, the
 * first example named after it, where there is one. A page without one, such as a foundation's,
 * shows its specimen.
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
 * and resizes, and the overlays as they open, are placed and finish their transitions: each change
 * fits it again in the next frame, however late it comes, so no timing decides whether it fits.
 */
function useFit(
  stage: RefObject<HTMLElement | null>,
  canvas: RefObject<HTMLElement | null>,
  on: boolean,
  whole: boolean,
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
      // A gallery's window counts whole, so every tile of it is drawn at one scale, and only what
      // overflows it is scaled further.
      if (whole)
        boxes.push({
          element: canvasElement,
          box: new DOMRect(0, 0, canvasElement.offsetWidth, canvasElement.offsetHeight),
        });
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
    // The example renders once its module loads, and its overlays open into a canvas that keeps
    // its size; a popup is placed by its style a frame or two later, without changing size. The
    // canvas's own attributes are the fit's; what is added to it or removed from it, such as the
    // example as its module loads, is the preview's, and fits it again.
    const changes = new MutationObserver((records) => {
      if (records.some((record) => record.type === 'childList' || record.target !== canvasElement))
        update();
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
      changes.disconnect();
      resize.disconnect();
    };
  }, [stage, canvas, on, whole]);
}

/**
 * A tiny live picture of an alternative on the recessed canvas: its example, inert and scaled down
 * to fit, rendered once the tiles near the viewport; for a page without one, its specimen, in the
 * same way. Without either, a page icon. A gallery's tile passes its own stage class and, where a
 * composition of its own reads better than the page's example, that composition.
 */
export function TilePreview({
  preview,
  near,
  className = 'docs-related-stage',
  whole = false,
}: {
  preview?: Preview;
  near: boolean;
  className?: string;
  /** Whether the window it lays out in counts whole as it is fitted, as a gallery's does. */
  whole?: boolean;
}) {
  const Composition = preview?.composition;
  const theme = useTheme();
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  const shown = Boolean(preview && near);
  const subject =
    preview &&
    (Composition ? (
      <Composition />
    ) : preview.specimen ? (
      <PageSpecimen id={preview.specimen} />
    ) : (
      <ExampleRender page={preview.page} name={preview.name} fallback={null} />
    ));
  useFit(stage, canvas, shown, whole);
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
        <Article className="docs-related-placeholder" aria-hidden />
      ) : (
        shown && (
          <div ref={canvas} className="docs-related-canvas" inert aria-hidden>
            {preview.open ? (
              <PortalContainer container={layer} contained>
                {subject}
              </PortalContainer>
            ) : (
              subject
            )}
            {preview.open && <div ref={setLayer} className="docs-overlay-layer" />}
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

/** The alternatives as tiles of one size: a preview on its stage, the name and its situations. */
function Tiles({ alternatives, path }: { alternatives: Alternative[]; path: string }) {
  const list = useRef<HTMLUListElement>(null);
  const near = useNear(list);
  return (
    <ul ref={list} className="docs-related-tiles" data-count={alternatives.length}>
      {alternatives.map(({ key, name, href, preview, line }) => (
        <li key={key} className="docs-related-tile">
          <TilePreview preview={preview} near={near} />
          {/* The name is the link; it stretches over the picture, so a pointer can follow it from
              there too without a link around the preview, whose example may hold links itself. */}
          <Text render={<span />} className="docs-related-name">
            {href ? (
              <Link href={href} className="docs-related-link">
                {name}
              </Link>
            ) : (
              name
            )}
          </Text>
          <div className="docs-related-line">
            <Documentation markdown={line} path={path} />
          </div>
        </li>
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
    <Column render={<section />} gap={4} className="docs-related" data-section="related">
      <Text render={<h2 />} variant="headline" id="related">
        Related
      </Text>
      <Tiles alternatives={alternatives} path={path} />
    </Column>
  );
}
