import { useEffect, useState } from 'react';
import { Pagination, SearchField, Surface } from '@envsemble/envui';
import { Example } from './Example';
import { Preview } from './Preview';

/** A page that takes a moment to load, as from a server. */
function useLoadedPage() {
  const [page, setPage] = useState(1);
  const [requested, setRequested] = useState(1);
  useEffect(() => {
    if (requested === page) return;
    const timer = setTimeout(() => setPage(requested), 700);
    return () => clearTimeout(timer);
  }, [requested, page]);
  return { page, pending: requested !== page, request: setRequested };
}

export function PaginationPreview() {
  const reports = useLoadedPage();
  const [batch, setBatch] = useState(1);
  const [toolbarPage, setToolbarPage] = useState(1);
  const [localizedPage, setLocalizedPage] = useState(1);
  return (
    <Preview>
      <Example
        title="Pages of a list"
        caption="The button pressed shows a spinner while the page loads, and the new range is announced."
      >
        <Pagination
          aria-label="Report pages"
          page={reports.page}
          pageSize={60}
          total={245}
          pending={reports.pending}
          onPageChange={reports.request}
        />
      </Example>
      <Example
        title="Without a known total"
        caption="The range shows the items on the page; hasNextPage says when the list ends."
      >
        <Pagination
          aria-label="Batches"
          page={batch}
          pageSize={50}
          hasNextPage={batch < 4}
          onPageChange={setBatch}
        />
      </Example>
      <Example title="In a compact toolbar" size="field">
        <Surface tone="row" padding={2} corners="standard" density="compact">
          <div className="docs-compact-toolbar">
            <div className="docs-compact-toolbar-title">
              <SearchField label="Search reports" />
            </div>
            <Pagination
              aria-label="Toolbar pages"
              page={toolbarPage}
              pageSize={25}
              total={112}
              variant="text"
              onPageChange={setToolbarPage}
            />
          </div>
        </Surface>
      </Example>
      <Example title="In another language">
        <Pagination
          aria-label="Seiten"
          page={localizedPage}
          pageSize={20}
          total={1234}
          previousLabel="Vorherige Seite"
          nextLabel="Nächste Seite"
          formatRange={({ start, end, total }) =>
            `${start.toLocaleString('de')}–${end.toLocaleString('de')} von ${total?.toLocaleString('de')}`
          }
          onPageChange={setLocalizedPage}
        />
      </Example>
    </Preview>
  );
}
