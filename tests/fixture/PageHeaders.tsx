import { useState, type CSSProperties } from 'react';
import {
  Badge,
  Breadcrumbs,
  Button,
  Page,
  PageHeader,
  SearchField,
  Column,
  Row,
  Text,
} from '@envsemble/envui';

const trail = [
  { label: 'Workspace', href: '#workspace' },
  { label: 'Projects', href: '#projects' },
  { label: 'Northwind launch' },
];

/**
 * Page headers for the layout checks: one in a container the test narrows, one at heading level 2
 * with small controls, and a sticky one on a page under a frame header 48 px tall, with content
 * that sticks below both.
 */
export function PageHeadersFixture() {
  const [width, setWidth] = useState('48rem');
  return (
    <Column gap={5}>
      <section aria-label="Responsive" className="fixture-section">
        <Row gap={2}>
          <Button variant="secondary" onClick={() => setWidth('48rem')}>
            Wide header
          </Button>
          <Button variant="secondary" onClick={() => setWidth('20rem')}>
            Narrow header
          </Button>
        </Row>
        <div style={{ inlineSize: width }}>
          <PageHeader
            data-testid="responsive"
            title="Northwind launch"
            description="Everything the launch needs, from the press kit to the venue."
            breadcrumbs={<Breadcrumbs items={trail} wrap={false} />}
            meta={<Badge tone="success">On track</Badge>}
            actions={
              <>
                <Button variant="secondary">Share</Button>
                <Button>New task</Button>
              </>
            }
          />
        </div>
      </section>
      <section aria-label="Small" className="fixture-section">
        <PageHeader
          data-testid="small"
          title="Members"
          headingLevel={2}
          controlSize="sm"
          actions={<Button>Invite</Button>}
          toolbar={
            <Row gap={4} wrap align="center" justify="between">
              <SearchField label="Search members" size="sm" />
              <Button variant="secondary">Export</Button>
            </Row>
          }
        />
      </section>
      <div style={{ '--env-frame-sticky-top': '48px' } as CSSProperties}>
        <div
          data-testid="frame-header"
          style={{
            position: 'sticky',
            insetBlockStart: 0,
            blockSize: '48px',
            zIndex: 'var(--env-z-sticky)',
            background: 'var(--env-color-bg-raised)',
          }}
        />
        <Page
          data-testid="page"
          width="md"
          header={<PageHeader data-testid="sticky" title="Annual report" sticky />}
        >
          <div
            data-testid="sticky-content"
            style={{
              position: 'sticky',
              insetBlockStart:
                'calc(var(--env-frame-sticky-top) + var(--env-page-header-block-size, 0px))',
            }}
          >
            Section heading that sticks below both
          </div>
          <div style={{ blockSize: '200vh' }}>
            <Text>Long page content.</Text>
          </div>
        </Page>
      </div>
    </Column>
  );
}
