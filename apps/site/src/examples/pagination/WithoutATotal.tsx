import { useState } from 'react';
import { Pagination } from '@envsemble/envui';

const batchCount = 4;

export default function WithoutATotal() {
  const [batch, setBatch] = useState(1);
  return (
    <Pagination
      aria-label="Activity pages"
      page={batch}
      pageSize={50}
      hasNextPage={batch < batchCount}
      onPageChange={setBatch}
    />
  );
}
