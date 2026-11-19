import { useState } from 'react';
import {
  Badge,
  Breadcrumbs,
  Button,
  Page,
  PageHeader,
  SearchField,
  Column,
  Row,
  Scaffold,
  Text,
} from '@envsemble/envui';

export const mount = 'standalone';

const trail = [
  { label: 'Workspace', href: '#workspace' },
  { label: 'Projects', href: '#projects' },
  { label: 'Northwind launch' },
];

export default function PageHeaderFixture() {
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
      <section aria-label="Extra rows" className="fixture-section">
        <PageHeader
          data-testid="extra"
          title="Import"
          headingLevel={2}
          toolbar={<Button variant="secondary">Filter</Button>}
        >
          <div data-testid="extra-row">Importing 3 of 12 files</div>
        </PageHeader>
      </section>
      <div className="fixture-scaffold-frame" data-testid="frame">
        <Scaffold scroll="body" landmarks={false}>
          <Page
            data-testid="page"
            width="md"
            header={
              <PageHeader
                data-testid="sticky"
                title="Annual report for the board and every shareholder"
                sticky
                actions={<Button>Share</Button>}
                toolbar={<Button variant="secondary">Filter</Button>}
              />
            }
          >
            <div style={{ blockSize: '60rem' }}>
              <Text>Long page content.</Text>
            </div>
            <label>
              Far field <input data-testid="far-field" />
            </label>
            <div style={{ blockSize: '20rem' }} />
          </Page>
        </Scaffold>
      </div>
    </Column>
  );
}
