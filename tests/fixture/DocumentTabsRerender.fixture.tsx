import { useEffect, useState } from 'react';
import { DocumentTabs, Menu, Menubar } from '@envsemble/envui';

export const mount = 'standalone';

/**
 * A parent that re-renders DocumentTabs with a new inline items array as its menu opens, as its
 * input changes and on a timer.
 */
export default function DocumentTabsRerenderFixture() {
  const [tabs, setTabs] = useState(['one', 'two', 'three']);
  const [value, setValue] = useState<string | null>('one');
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [renders, setRenders] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setRenders((count) => count + 1), 50);
    return () => clearInterval(timer);
  }, []);
  return (
    <div>
      <DocumentTabs
        aria-label="Re-rendered documents"
        items={tabs.map((id) => ({ value: id, label: `${id}.md` }))}
        value={value}
        onValueChange={setValue}
        onClose={(id) => {
          const index = tabs.indexOf(id);
          const remaining = tabs.filter((tab) => tab !== id);
          setTabs(remaining);
          if (id === value) setValue(remaining[Math.min(index, remaining.length - 1)] ?? null);
        }}
      />
      <Menubar.Root aria-label="Rerender menubar">
        <Menubar.Menu label="File" onOpenChange={setMenuOpen}>
          <Menu.Item>First action</Menu.Item>
          <Menu.Item>Second action</Menu.Item>
        </Menubar.Menu>
      </Menubar.Root>
      <input aria-label="Draft" value={draft} onChange={(event) => setDraft(event.target.value)} />
      <output data-testid="rerender-state">{menuOpen ? 'open' : 'closed'}</output>
      <output data-testid="rerender-count">{renders}</output>
    </div>
  );
}
