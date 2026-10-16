import { useState } from 'react';
import { Pagination } from '@envsemble/envui';

const numbers = new Intl.NumberFormat('de');

export default function AnotherLanguage() {
  const [page, setPage] = useState(2);
  return (
    <Pagination
      aria-label="Seiten"
      lang="de"
      page={page}
      pageSize={20}
      total={1234}
      previousLabel="Vorherige Seite"
      nextLabel="Nächste Seite"
      formatRange={({ start, end, total = 0 }) =>
        `${numbers.format(start)}–${numbers.format(end)} von ${numbers.format(total)}`
      }
      onPageChange={setPage}
    />
  );
}
