import { useState } from 'react';
import { Grid, Pagination, SearchField } from '@envsemble/envui';

export default function MatchingSize() {
  const [page, setPage] = useState(1);
  return (
    // The pager takes the size of the field beside it.
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
        size="sm"
        onPageChange={setPage}
      />
    </Grid>
  );
}
