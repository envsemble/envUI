import { Column } from '@envsemble/envui';
import { SiteBanner } from '../../frame/SiteBanner';
import { catalogueTrail } from '../../routes/Trails';
import type { RoutePage } from '../../routes/SiteRoutes';
import { Catalogue } from './Catalogue';
import { FoundationCatalogue } from './FoundationCatalogue';

export function FoundationsPage({ page }: { page: RoutePage }) {
  return (
    <>
      <SiteBanner
        page={page}
        title={page.title}
        trail={catalogueTrail(page)}
        description={page.summary}
      />
      <Column gap={7} className="site-article catalogue-overview">
        <FoundationCatalogue />
      </Column>
    </>
  );
}

export function ComponentsPage({ page }: { page: RoutePage }) {
  return (
    <>
      <SiteBanner
        page={page}
        title={page.title}
        trail={catalogueTrail(page)}
        description={page.summary}
      />
      <Column gap={7} className="site-article catalogue-overview">
        <Catalogue />
      </Column>
    </>
  );
}
