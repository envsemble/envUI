import { useEffect, useState } from 'react';
import { Pagination } from '@envsemble/envui';

export default function PagesOfAList() {
  const [page, setPage] = useState(1);
  const [requested, setRequested] = useState(1);
  // A page takes a moment to load, as from a server.
  useEffect(() => {
    if (requested === page) return;
    const timer = setTimeout(() => setPage(requested), 700);
    return () => clearTimeout(timer);
  }, [requested, page]);
  return (
    <Pagination
      aria-label="Report pages"
      page={page}
      pageSize={60}
      total={245}
      pending={requested !== page}
      onPageChange={setRequested}
    />
  );
}
