import { useState } from 'react';
import {
  IconButton,
  Page,
  PageHeader,
  Scaffold,
  TopBar,
  type ScaffoldForms,
} from '@envsemble/envui';
import { IconMenu } from '@envsemble/envui/icons/Menu';
import { IconSearch } from '@envsemble/envui/icons/Search';
import { IconSettings } from '@envsemble/envui/icons/Settings';

export const mount = 'standalone';

const params = () => new URLSearchParams(location.search);

function Destinations({ form }: { form: string }) {
  return (
    <nav aria-label={`Main ${form}`} data-testid={`${form}-form`} className="fixture-destinations">
      <button type="button">Inbox</button>
      <button type="button" aria-current="page">
        Settings
      </button>
    </nav>
  );
}

const navigation = {
  bar: <Destinations form="bar" />,
  rail: <Destinations form="rail" />,
  drawer: <Destinations form="drawer" />,
};

export function TallPage({ paragraphs = 200 }: { paragraphs?: number }) {
  return (
    <div className="fixture-tall-page">
      <p tabIndex={-1} data-testid="page-start">
        Start of the page
      </p>
      {Array.from({ length: paragraphs }, (_, index) => (
        <p key={index}>Paragraph {index + 1}</p>
      ))}
    </div>
  );
}

export default function ScaffoldFixture() {
  const query = params();
  const [width, setWidth] = useState(query.get('width') ?? '80rem');
  const formsParameter = query.get('forms');
  const forms = formsParameter ? (JSON.parse(formsParameter) as ScaffoldForms) : undefined;
  const only = query.get('only')?.split(',');
  const scroll = query.get('scroll') === 'document' ? 'document' : 'body';
  const given = only
    ? Object.fromEntries(Object.entries(navigation).filter(([form]) => only.includes(form)))
    : navigation;
  return (
    <div dir={query.get('dir') ?? undefined}>
      <div className="fixture-actions" data-testid="widths">
        {['30rem', '45rem', '60rem', '80rem'].map((value) => (
          <button key={value} type="button" onClick={() => setWidth(value)}>
            Width {value}
          </button>
        ))}
      </div>
      <div
        className="fixture-scaffold-frame"
        data-testid="frame"
        data-scroll={scroll}
        style={{ inlineSize: width }}
      >
        <Scaffold
          className="fixture-scaffold"
          scroll={scroll}
          name="app"
          topBarSpan={query.get('span') === 'full' ? 'full' : 'body'}
          landmarks={query.get('landmarks') !== 'off'}
          navigationForms={forms}
          navigation={given}
          aside={
            query.has('aside') ? (
              <aside aria-label="Inspector" data-testid="inspector" className="fixture-inspector">
                <p>Inspector</p>
                <div style={{ blockSize: '60rem' }} />
              </aside>
            ) : undefined
          }
          bottomBar={
            query.has('status') ? (
              <div role="status" data-testid="status-bar">
                Synced
              </div>
            ) : undefined
          }
          topBar={
            <TopBar
              start={<IconButton icon={<IconMenu />} aria-label="Open navigation" />}
              title="Inbox"
              end={
                <>
                  <IconButton icon={<IconSearch />} aria-label="Search" />
                  <IconButton icon={<IconSettings />} aria-label="Settings" />
                </>
              }
            />
          }
        >
          {query.get('header') === 'sticky' ? (
            <Page header={<PageHeader title="Messages" sticky />}>
              <TallPage />
            </Page>
          ) : (
            <TallPage />
          )}
        </Scaffold>
      </div>
    </div>
  );
}
