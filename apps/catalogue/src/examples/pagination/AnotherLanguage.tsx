import { useState } from 'react';
import { EnvUIProvider, Pagination } from '@envsemble/envui';

// The application's strings in German, for every pager inside the provider; the numbers follow the
// provider's locale.
const messages = {
  pagination: {
    label: 'Seiten',
    previous: 'Vorherige Seite',
    next: 'Nächste Seite',
    range: ({ start, end, total }: { start: string; end: string; total?: string }) =>
      total === undefined ? `${start}–${end}` : `${start}–${end} von ${total}`,
  },
};

export default function AnotherLanguage() {
  const [page, setPage] = useState(2);
  return (
    <EnvUIProvider locale="de" messages={messages}>
      <Pagination lang="de" page={page} pageSize={20} total={1234} onPageChange={setPage} />
    </EnvUIProvider>
  );
}
