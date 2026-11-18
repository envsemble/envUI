import { useState } from 'react';
import { DocumentTabs, Theme } from '@envsemble/envui';
import { initialTabs } from './DocumentTabs.fixture.js';

export default function DocumentTabsReorderFixture() {
  const [tabs, setTabs] = useState(initialTabs.slice(0, 4));
  const [value, setValue] = useState<string | null>('plans/roadmap.md');
  const [log, setLog] = useState<string[]>([]);
  return (
    <Theme theme="light" className="fixture-section">
      <div className="fixture-tabs-frame">
        <DocumentTabs
          aria-label="Reorderable documents"
          items={tabs}
          value={value}
          onValueChange={(id) => {
            setValue(id);
            setLog((current) => [...current, `select ${id}`]);
          }}
          onClose={(id) => setTabs((current) => current.filter((tab) => tab.value !== id))}
          onReorder={(ids) => {
            setTabs((current) => ids.map((id) => current.find((tab) => tab.value === id)!));
            setLog((current) => [...current, `reorder ${ids.join(' ')}`]);
          }}
        />
      </div>
      <output data-testid="reorder-log">{log.join('\n')}</output>
    </Theme>
  );
}
