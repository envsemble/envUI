import { useState } from 'react';
import { Grid, Pagination, SearchField, Surface } from '@envsemble/envui';

export default function SmallToolbar() {
  const [page, setPage] = useState(1);
  return (
    // A toolbar row: the field takes the room the pager leaves.
    <Surface
      background="muted"
      padding={2}
      radius="sm"
      style={{ inlineSize: 'min(100%, 32rem)' }}
      render={<Grid columns="minmax(0, 1fr) auto" align="center" gap={3} />}
    >
      <SearchField label="Search invoices" placeholder="Search invoices" size="sm" />
      <Pagination
        aria-label="Invoice pages"
        page={page}
        pageSize={25}
        total={112}
        variant="text"
        size="sm"
        onPageChange={setPage}
      />
    </Surface>
  );
}
