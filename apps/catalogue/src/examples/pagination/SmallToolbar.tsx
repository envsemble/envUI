import { useState } from 'react';
import { Pagination, SearchField, Surface } from '@envsemble/envui';

export default function SmallToolbar() {
  const [page, setPage] = useState(1);
  return (
    <Surface background="muted" padding={2} radius="sm" style={{ inlineSize: 'min(100%, 32rem)' }}>
      {/* A toolbar row: the field takes the room the pager leaves. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ flex: '1 1 auto', minInlineSize: 0 }}>
          <SearchField label="Search invoices" size="sm" />
        </div>
        <Pagination
          aria-label="Invoice pages"
          page={page}
          pageSize={25}
          total={112}
          variant="text"
          size="sm"
          onPageChange={setPage}
        />
      </div>
    </Surface>
  );
}
