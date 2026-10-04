import { Button, Tabs } from '@envsemble/envui';
import { Code } from '@envsemble/envui/icons/Code';
import type { ReactElement, ReactNode } from 'react';
import { referenceViews, type ReferenceView } from './Documentation';
import { PageHeader } from './PageHeader';

/** Foundation and component pages share Preview and Usage banner views. */
export function PageViews({
  path,
  title,
  breadcrumb,
  description,
  symbol,
  view,
  preview,
  usage,
  renderBanner,
}: {
  path: string;
  title: string;
  breadcrumb?: string;
  description?: string;
  symbol?: ReactNode;
  view: ReferenceView;
  preview: ReactNode;
  usage: ReactNode;
  renderBanner?: (tabs: ReactElement) => ReactNode;
}) {
  const content = { preview, usage };
  return (
    <Tabs
      aria-label={`${title} reference views`}
      className="docs-reference-tabs"
      value={view}
      onValueChange={(next) => {
        if (!next) return;
        const query = new URLSearchParams(location.hash.split('?')[1]);
        query.delete('section');
        location.hash = `/${path}/${next}${query.size ? `?${query}` : ''}`;
      }}
      renderList={
        renderBanner ??
        ((tabs) => (
          <PageHeader
            title={title}
            breadcrumb={breadcrumb}
            description={description}
            symbol={symbol}
          >
            {tabs}
          </PageHeader>
        ))
      }
      items={referenceViews.map(({ id, title }) => ({
        value: id,
        button: <Button startIcon={id === 'usage' ? <Code /> : undefined}>{title}</Button>,
        content: content[id],
      }))}
    />
  );
}
