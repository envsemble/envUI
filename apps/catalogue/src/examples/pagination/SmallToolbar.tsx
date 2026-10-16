import { useState } from 'react';
import { Pagination, SearchField, Surface } from '@envsemble/envui';

export default function CompactToolbar() {
  const [page, setPage] = useState(1);
  return (
    <Surface
      tone="row"
      padding={2}
      corners="standard"
      density="compact"
      style={{ inlineSize: 'min(100%, 32rem)' }}
    >
      {/* A toolbar row: the field takes the room the pager leaves. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ flex: '1 1 auto', minInlineSize: 0 }}>
          <SearchField label="Search invoices" />
        </div>
        <Pagination
          aria-label="Invoice pages"
          page={page}
          pageSize={25}
          total={112}
          variant="text"
          onPageChange={setPage}
        />
      </div>
    </Surface>
  );
}
