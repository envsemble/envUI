import { Button, Tabs } from '@envsemble/envui';
import { Code } from '@envsemble/envui/icons/Code';
import type { ReactElement, ReactNode } from 'react';
import type { ReferenceView, ViewOption } from '../navigation/DocumentationRoutes';
import { currentRouteQuery, useViewTabs } from '../navigation/useDocumentationRoute';
import { PageHeader } from './PageHeader';

/** A page's views as tabs in its banner: Preview and Usage, or the template's views. */
export function PageViews({
  path,
  title,
  breadcrumb,
  description,
  meta,
  symbol,
  view,
  views,
  content,
  renderBanner,
}: {
  path: string;
  title: string;
  breadcrumb?: string;
  description?: string;
  meta?: ReactNode;
  symbol?: ReactNode;
  view: ReferenceView;
  views: readonly ViewOption[];
  content: Partial<Record<ReferenceView, ReactNode>>;
  renderBanner?: (tabs: ReactElement) => ReactNode;
}) {
  const viewTabs = useViewTabs((next) => {
    const query = currentRouteQuery();
    query.delete('section');
    return `${path}/${next}${query.size ? `?${query}` : ''}`;
  });
  return (
    <Tabs
      aria-label={`${title} reference views`}
      className="docs-reference-tabs"
      value={view}
      {...viewTabs}
      renderList={
        renderBanner ??
        ((tabs) => (
          <PageHeader
            title={title}
            breadcrumb={breadcrumb}
            description={description}
            meta={meta}
            symbol={symbol}
          >
            {tabs}
          </PageHeader>
        ))
      }
      items={views.map(({ id, title }) => ({
        value: id,
        button: (
          <Button startIcon={id === 'usage' || id === 'props' ? <Code /> : undefined}>
            {title}
          </Button>
        ),
        content: content[id],
      }))}
    />
  );
}
