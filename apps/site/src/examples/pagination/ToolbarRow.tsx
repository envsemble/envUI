import { useState } from 'react';
import { Grid, Pagination, SearchField } from '@envsemble/envui';

export default function ToolbarRow() {
  const [page, setPage] = useState(1);
  return (
    // The field shrinks first, to 6 rem; then the pager wraps its buttons below its range.
    <Grid columns="minmax(6rem, 1fr) auto" align="center" gap={3}>
      <SearchField label="Search invoices" size="sm" />
      <Pagination
        aria-label="Invoice pages, toolbar row"
        page={page}
        pageSize={25}
        total={112}
        size="sm"
        onPageChange={setPage}
      />
    </Grid>
  );
}
