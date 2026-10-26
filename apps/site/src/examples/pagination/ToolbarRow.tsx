import { useState } from 'react';
import { Grid, Pagination, SearchField } from '@envsemble/envui';

export default function ToolbarRow() {
  const [page, setPage] = useState(1);
  return (
    // The field shrinks first; the pager wraps its buttons only where it can't fit by itself.
    <Grid columns="minmax(0, 1fr) auto" align="center" gap={3}>
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
