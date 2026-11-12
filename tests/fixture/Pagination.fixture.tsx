import { useEffect, useState } from 'react';
import { Button, Pagination, Theme, type ColorScheme } from '@envsemble/envui';

export const themes = true;

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

export default function PaginationFixture({ theme }: { theme: ColorScheme }) {
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
    </Theme>
  );
}
