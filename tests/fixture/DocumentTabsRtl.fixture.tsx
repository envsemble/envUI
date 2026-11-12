import { useState } from 'react';
import { DocumentTabs } from '@envsemble/envui';
import { initialTabs } from './DocumentTabs.fixture.js';

export const mount = 'standalone';

/** An overflowing DocumentTabs strip in right-to-left text. */
export default function DocumentTabsRtlFixture() {
  const [value, setValue] = useState<string | null>(initialTabs[0]!.value);
  return (
    <div dir="rtl" style={{ inlineSize: '30rem' }}>
      <DocumentTabs
        aria-label="Right-to-left documents"
        items={initialTabs}
        value={value}
        onValueChange={setValue}
        onClose={() => undefined}
      />
    </div>
  );
}
