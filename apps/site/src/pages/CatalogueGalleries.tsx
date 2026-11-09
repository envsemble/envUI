import { Column } from '@envsemble/envui';
import { SiteBanner } from '../banner/SiteBanner';
import { catalogueTrail } from '../routes/Trails';
import type { RoutePage } from '../routes/SiteRoutes';
import { Catalogue } from './Catalogue';
import { FoundationCatalogue } from './FoundationCatalogue';
import { PatternCatalogue } from './PatternCatalogue';

/*
 * The catalogue's galleries: its foundations, components and patterns, each as tiles that lead to
 * their pages.
 */

/** Every foundation at a glance, each a way to its page. */
export function FoundationsPage({ page }: { page: RoutePage }) {
  return (
    <>
      <SiteBanner
        title={page.title}
        trail={catalogueTrail(page)}
        description={page.summary}
        subject="foundations"
      />
      <Column gap={7} className="site-article catalogue-overview">
        <FoundationCatalogue />
      </Column>
    </>
  );
}

/** Every component, by what it is for. */
export function ComponentsPage({ page }: { page: RoutePage }) {
  return (
    <>
      <SiteBanner
        title={page.title}
        trail={catalogueTrail(page)}
        description={page.summary}
        subject="components"
      />
      <Column gap={7} className="site-article catalogue-overview">
        <Catalogue />
      </Column>
    </>
  );
}

/** Every pattern, by what people are doing. */
export function PatternsPage({ page }: { page: RoutePage }) {
  return (
    <>
      <SiteBanner
        title={page.title}
        trail={catalogueTrail(page)}
        description={page.summary}
        subject="patterns"
      />
      <Column gap={7} className="site-article catalogue-overview">
        <PatternCatalogue />
      </Column>
    </>
  );
}
