import { useEffect, useState } from 'react';
import { Pagination } from '@envsemble/envui';

export default function PagesOfAList() {
  const [page, setPage] = useState(1);
  const [requested, setRequested] = useState(1);
  useEffect(() => {
    if (requested === page) return;
    const pageLoaded = setTimeout(() => setPage(requested), 700);
    return () => clearTimeout(pageLoaded);
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
