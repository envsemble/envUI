import { Button, Tabs } from '@envsemble/envui';
import { Code } from '@envsemble/envui/icons/Code';
import { useRef, type ReactElement, type ReactNode } from 'react';
import type { ReferenceView, ViewOption } from '../navigation/DocumentationRoutes';
import { replaceRoute } from '../navigation/useDocumentationRoute';
import { PageHeader } from './PageHeader';

/** Keys that move between tabs, which select as they move. */
const movingKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']);

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
  // Whether the view changes because the arrow keys moved through the tabs, rather than a click.
  const moving = useRef(false);
  return (
    <Tabs
      aria-label={`${title} reference views`}
      className="docs-reference-tabs"
      value={view}
      onKeyDownCapture={(event) => {
        moving.current = movingKeys.has(event.key);
      }}
      onPointerDownCapture={() => {
        moving.current = false;
      }}
      onValueChange={(next) => {
        if (!next) return;
        const query = new URLSearchParams(location.hash.split('?')[1]);
        query.delete('section');
        const route = `${path}/${next}${query.size ? `?${query}` : ''}`;
        // A view chosen is a step in the history; views passed on the way with the arrows are not.
        if (moving.current) replaceRoute(route);
        else location.hash = `/${route}`;
      }}
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
