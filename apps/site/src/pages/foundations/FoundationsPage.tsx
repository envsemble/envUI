import type { ComponentType } from 'react';
import { Column, SegmentedControl, Text } from '@envsemble/envui';
import { PageHeader } from '../../layout/PageHeader';
import { navigate } from '../../navigation/Address';
import { catalogueTrail } from '../../navigation/CatalogueTrail';
import type { RoutePage } from '../../navigation/SiteRoutes';
import { useSiteRoute } from '../../navigation/useSiteRoute';
import { DesignGallery } from './DesignGallery';
import { DesignOverview } from './DesignOverview';
import { DesignScreen } from './DesignScreen';
import { DesignSheet } from './DesignSheet';

/**
 * The proposals for the page of all foundations, for choosing one: each by the letter ?design=
 * takes. The switcher above them is for the choice alone and goes with the proposals not chosen.
 */
const designs: { value: string; label: string; render: ComponentType }[] = [
  { value: 'a', label: 'Gallery', render: DesignGallery },
  { value: 'b', label: 'Overview', render: DesignOverview },
  { value: 'c', label: 'At a glance', render: DesignSheet },
  { value: 'd', label: 'One screen', render: DesignScreen },
];

/** Every foundation, the way the rail's Foundations opens. */
export function FoundationsPage({ page }: { page: RoutePage }) {
  const route = useSiteRoute();
  const asked = new URLSearchParams(route.split('?')[1] ?? '').get('design');
  const design = designs.find((entry) => entry.value === asked) ?? designs[0]!;
  const Design = design.render;
  return (
    <>
      <PageHeader
        title={page.title}
        trail={catalogueTrail(page)}
        description={page.summary}
        subject="foundations"
      />
      <Column gap={7} className="site-article catalogue-foundations" data-design={design.value}>
        <div className="catalogue-foundations-proposals">
          <Text variant="caption" emphasis="muted">
            Proposal
          </Text>
          <SegmentedControl
            aria-label="Proposal"
            size="sm"
            value={design.value}
            onValueChange={(value) =>
              navigate(`${page.path}?${new URLSearchParams({ design: value })}`, { replace: true })
            }
            items={designs.map(({ value }) => ({ value, label: value.toUpperCase() }))}
          />
          <Text variant="caption" emphasis="muted">
            {design.label}
          </Text>
        </div>
        <Design />
      </Column>
    </>
  );
}
