import { IconCode } from '@envsemble/envui/icons/Code';
import { IconMenuBook } from '@envsemble/envui/icons/MenuBook';
import { replaceAddress, revealSection, routeHref } from './Address';
import { isAnchor, readingAnchor } from './ScrollRestoration';
import { counterpartOf } from './Counterparts';
import type { Area, RoutePage } from './SiteRoutes';
import { flag } from '../shared/Attributes';
import { useLinkComponent } from '@envui-internal/internal/provider/LinkComponentContext';
import '@envui-internal/styles/SegmentedControl.css';

export function otherPart(area: Area) {
  return area === 'docs'
    ? { label: 'Gallery', Icon: IconMenuBook }
    : { label: 'Docs', Icon: IconCode };
}

let keptSection: string | undefined;
const keptSectionSearchMs = 3000;

export function keepSection() {
  let named: string | undefined;
  try {
    named = decodeURIComponent(location.hash.slice(1)) || undefined;
  } catch {
    named = undefined;
  }
  keptSection = readingAnchor() ?? named;
}

export function showKeptSection(main: HTMLElement, path: string): (() => void) | undefined {
  const kept = keptSection;
  keptSection = undefined;
  if (kept === undefined) return undefined;
  main.scrollTo({ top: 0 });
  const deadline = performance.now() + keptSectionSearchMs;
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

export function PartSwitch({ page }: { page: RoutePage }) {
  const LinkComponent = useLinkComponent();
  const route = counterpartOf(page);
  if (!route) return null;
  const parts = [
    { area: 'catalogue', label: 'Gallery' },
    { area: 'docs', label: 'Docs' },
  ] as const;
  return (
    <nav aria-label="Gallery or docs" className="site-part-switch">
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
