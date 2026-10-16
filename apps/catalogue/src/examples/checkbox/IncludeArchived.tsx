import { useState } from 'react';
import { Checkbox } from '@envsemble/envui';

export default function IncludeArchived() {
  const [included, setIncluded] = useState(false);
  return (
    <Checkbox label="Include archived projects" checked={included} onCheckedChange={setIncluded} />
  );
}
