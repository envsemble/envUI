import { useEffect, useState } from 'react';
import {
  Button,
  Pagination,
  SearchField,
  Surface,
  Theme,
  type ColorScheme,
} from '@envsemble/envui';

const ignore = () => undefined;

/**
 * Pages whose loading starts in an effect once the page changes, as with a query keyed by the page:
 * pending follows a page later than the press. The fixture finishes loading on request.
 */
function EffectLoadedPages({ theme }: { theme: ColorScheme }) {
  const [page, setPage] = useState(1);
  const [loaded, setLoaded] = useState(1);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (page !== loaded) setLoading(true);
  }, [page, loaded]);
  return (
    <>
      <Pagination
        aria-label={`Effect pages ${theme}`}
        page={page}
        pageSize={20}
        total={100}
        pending={loading}
        onPageChange={setPage}
      />
      <Button
        variant="secondary"
        onClick={() => {
          setLoaded(page);
          setLoading(false);
        }}
      >
        Finish effect loading {theme}
      </Button>
      <Button variant="secondary" onClick={() => setLoading(true)}>
        Reload effect pages {theme}
      </Button>
    </>
  );
}

export function PaginationsFixture({ theme }: { theme: ColorScheme }) {
  const [page, setPage] = useState(1);
  // The page asked for while it loads; the fixture finishes loading on request.
  const [requested, setRequested] = useState<number | null>(null);
  const [changes, setChanges] = useState<number[]>([]);
  const [batch, setBatch] = useState(1);
  // A load for another reason, such as a refresh, while the batches page without loading.
  const [refreshing, setRefreshing] = useState(false);
  return (
    <Theme theme={theme} data-testid={`paginations-${theme}`} className="fixture-section">
      <Pagination
        aria-label={`Report pages ${theme}`}
        page={page}
        pageSize={60}
        total={245}
        pending={requested !== null}
        onPageChange={(next) => {
          setRequested(next);
          setChanges((current) => [...current, next]);
        }}
      />
      <Button
        variant="secondary"
        onClick={() => {
          if (requested === null) return;
          setPage(requested);
          setRequested(null);
        }}
      >
        Finish loading {theme}
      </Button>
      <output data-testid="changes">{changes.join(',')}</output>
      <Pagination
        aria-label={`Batches ${theme}`}
        page={batch}
        pageSize={50}
        hasNextPage={batch < 3}
        pending={refreshing}
        onPageChange={setBatch}
      />
      <Button variant="secondary" onClick={() => setRefreshing((current) => !current)}>
        Refresh batches {theme}
      </Button>
      <EffectLoadedPages theme={theme} />
      <Pagination
        aria-label="Hidden single page"
        page={1}
        pageSize={60}
        total={40}
        hideWhenSinglePage
        onPageChange={ignore}
      />
      <Pagination
        aria-label="Single page"
        page={1}
        pageSize={60}
        total={40}
        onPageChange={ignore}
      />
      <Pagination aria-label="No items" page={1} pageSize={60} total={0} onPageChange={ignore} />
      <Pagination aria-label="Last item" page={5} pageSize={60} total={241} onPageChange={ignore} />
      <Pagination
        aria-label="Beyond the end"
        page={9}
        pageSize={60}
        total={245}
        onPageChange={ignore}
      />
      <Pagination
        aria-label="Last batch"
        page={3}
        pageSize={50}
        hasNextPage={false}
        hideWhenSinglePage
        onPageChange={ignore}
      />
      <Pagination
        aria-label="Seiten"
        page={2}
        pageSize={20}
        total={1234}
        previousLabel="Vorherige Seite"
        nextLabel="Nächste Seite"
        formatRange={({ start, end, total }) =>
          `${start.toLocaleString('de')}–${end.toLocaleString('de')} von ${total?.toLocaleString('de')}`
        }
        onPageChange={ignore}
      />
      <Pagination page={1} pageSize={10} total={30} onPageChange={ignore} />
      {/* A small toolbar: a search field that shrinks, and the pager on one line beside it. */}
      <Surface
        background="muted"
        padding={2}
        radius="sm"
        className="fixture-toolbar fixture-pager-toolbar"
        data-testid="toolbar"
      >
        <span className="fixture-shrink-label">
          <SearchField size="sm" label="Search reports" />
        </span>
        <Pagination
          aria-label="Toolbar pages"
          page={1}
          pageSize={25}
          total={112}
          variant="text"
          size="sm"
          onPageChange={ignore}
        />
      </Surface>
      <div className="fixture-toolbar">
        <Pagination
          aria-label="Standard pages"
          page={2}
          pageSize={10}
          total={30}
          onPageChange={ignore}
        />
        <Pagination
          aria-label="Compact pages"
          size="sm"
          page={2}
          pageSize={10}
          total={30}
          onPageChange={ignore}
        />
      </div>
      <div className="fixture-narrow-pager" data-testid="narrow">
        <Pagination
          aria-label="Narrow pages"
          page={2}
          pageSize={100}
          total={12345}
          onPageChange={ignore}
        />
      </div>
      <div dir="rtl">
        <Pagination
          aria-label="Right-to-left pages"
          page={2}
          pageSize={10}
          total={30}
          onPageChange={ignore}
        />
      </div>
    </Theme>
  );
}
