import { useState } from 'react';
import { EnvUIProvider, Pagination } from '@envsemble/envui';

// The application's own strings for every pager inside the provider, in the page's language; an
// application that translates passes the strings of the reader's language. The numbers follow the
// locale the provider inherits from the page.
const messages = {
  pagination: {
    label: 'Result pages',
    previous: 'Previous results',
    next: 'More results',
    range: ({ start, end, total }: { start: string; end: string; total?: string }) =>
      total === undefined ? `${start}–${end}` : `${start}–${end} of ${total} results`,
  },
};

export default function ApplicationStrings() {
  const [page, setPage] = useState(2);
  return (
    <EnvUIProvider messages={messages}>
      <Pagination page={page} pageSize={20} total={1234} onPageChange={setPage} />
    </EnvUIProvider>
  );
}
