import { useState } from 'react';
import { Grid, Pagination, SearchField } from '@envsemble/envui';

export default function MismatchedSize() {
  const [page, setPage] = useState(1);
  return (
    // A small field beside a large pager: the row's controls don't line up.
    <Grid
      columns="minmax(0, 1fr) auto"
      align="center"
      gap={3}
      style={{ inlineSize: 'min(100%, 22rem)' }}
    >
      <SearchField label="Search invoices" size="sm" />
      <Pagination
        aria-label="Invoice pages"
        page={page}
        pageSize={25}
        total={112}
        size="lg"
        onPageChange={setPage}
      />
    </Grid>
  );
}
