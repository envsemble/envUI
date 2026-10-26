import { useState } from 'react';
import { Pagination } from '@envsemble/envui';

export default function PaginationAnatomy() {
  const [page, setPage] = useState(2);
  return (
    <Pagination
      aria-label="Report pages"
      page={page}
      pageSize={60}
      total={245}
      onPageChange={setPage}
    />
  );
}
