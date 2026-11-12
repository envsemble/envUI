import { IconCode } from '@envsemble/envui/icons/Code';
import { IconMenuBook } from '@envsemble/envui/icons/MenuBook';
import { replaceAddress, revealSection, routeHref } from './Address';
import { isAnchor, readingAnchor } from './ScrollRestoration';
import { counterpartOf } from './Counterparts';
import type { Area, RoutePage } from './SiteRoutes';
import { flag } from '../shared/Attributes';
import { useLinkComponent } from '@envui-internal/internal/provider/LinkComponentContext';

/**
 * The other part from a page of one, by its name and icon: the Docs, in code, from the catalogue,
 * and the catalogue from the Docs.
 */
export function otherPart(area: Area) {
  return area === 'docs'
    ? { label: 'Catalogue', Icon: IconMenuBook }
    : { label: 'Docs', Icon: IconCode };
}

/** The section the reader was in when they switched, which the page switched to shows if it has it. */
let keptSection: string | undefined;

/**
 * Keeps the section the reader is in for the page of the other part a link is about to open: the
 * one they have scrolled to, or, at the top of the page, where the switch in its banner is, the one
 * the address names, such as a contents link wrote.
 */
export function keepSection() {
  let named: string | undefined;
  try {
    named = decodeURIComponent(location.hash.slice(1)) || undefined;
  } catch {
    named = undefined;
  }
  keptSection = readingAnchor() ?? named;
}

/**
 * Shows the page a switch between the two parts opened: at the section the reader was in, which the
 * address then names, where this page has it too, else at its top. The page's sections may still be
 * rendering, so its section is looked for until they have. Returns the cleanup; undefined when no
 * switch opened the page.
 */
export function showKeptSection(main: HTMLElement, path: string): (() => void) | undefined {
  const kept = keptSection;
  keptSection = undefined;
  if (kept === undefined) return undefined;
  main.scrollTo({ top: 0 });
  const deadline = performance.now() + 3000;
  let frame = 0;
  let reveal: (() => void) | undefined;
  const attempt = () => {
    if (isAnchor(document.getElementById(kept))) {
      replaceAddress(`${path}?section=${kept}`);
      reveal = revealSection(kept);
      return;
    }
    const rendering = main.querySelector(
      '.site-page-skeleton, .site-section-groups[aria-busy], .docs-api[aria-busy]',
    );
    if (rendering && performance.now() < deadline) frame = requestAnimationFrame(attempt);
  };
  attempt();
  return () => {
    cancelAnimationFrame(frame);
    reveal?.();
  };
}

/**
 * The switch in a page's banner between the two pages of one subject: Design, its page in the
 * catalogue, and Code, its page in the Docs. Two links drawn as a small segmented control, the
 * page shown marked current with the control's check; following the other keeps the reader's
 * section where that page has it too. A page without a page in the other part shows none. Its
 * links are the site's link component (LinkProvider in App.tsx), as envUI's own links are.
 */
export function PartSwitch({ page }: { page: RoutePage }) {
  const LinkComponent = useLinkComponent();
  const route = counterpartOf(page);
  if (!route) return null;
  const parts = [
    { area: 'catalogue', label: 'Design' },
    { area: 'docs', label: 'Code' },
  ] as const;
  return (
    <nav aria-label="Design or code" className="site-part-switch">
      <div className="env-segmented-control" data-size="sm">
        {parts.map(({ area, label }) => {
          const current = area === page.area;
          return (
            <LinkComponent
              key={area}
              href={routeHref(current ? page.path : route)}
              aria-current={current ? 'page' : undefined}
              data-checked={flag(current)}
              className="env-segmented-control-item"
              onClick={() => {
                if (!current) keepSection();
              }}
            >
              <span className="env-segmented-control-item-label">{label}</span>
            </LinkComponent>
          );
        })}
      </div>
    </nav>
  );
}
