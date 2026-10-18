import { useState } from 'react';
import { DocumentTabs, IconButton, Tooltip, type DocumentTab } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { TabClose } from '@envsemble/envui/icons/TabClose';

const first: DocumentTab[] = [
  { id: 'roadmap', label: 'Roadmap.md' },
  { id: 'decisions', label: 'Decisions.md' },
  { id: 'interviews', label: 'Interviews.md' },
];

export default function CloseAllButton() {
  const [tabs, setTabs] = useState(first);
  const [value, setValue] = useState<string | null>('roadmap');
  const [count, setCount] = useState(1);

  const open = () => {
    const tab = { id: `untitled-${count}`, label: `Untitled ${count}.md` };
    setTabs((current) => [...current, tab]);
    setValue(tab.id);
    setCount((next) => next + 1);
  };
  const closeAll = () => {
    setTabs([]);
    setValue(null);
  };

  return (
    <DocumentTabs
      aria-label="Open documents"
      items={tabs}
      value={value}
      onValueChange={setValue}
      onClose={(id) => {
        const index = tabs.findIndex((tab) => tab.id === id);
        const remaining = tabs.filter((tab) => tab.id !== id);
        setTabs(remaining);
        if (id === value) setValue(remaining[Math.min(index, remaining.length - 1)]?.id ?? null);
      }}
      onCloseAll={closeAll}
      // The application's own buttons, after the tabs and on their hairline.
      end={
        <>
          <Tooltip content="New document">
            <IconButton
              variant="ghost"
              size="sm"
              icon={<Add />}
              aria-label="New document"
              onClick={open}
            />
          </Tooltip>
          <Tooltip content="Close all tabs">
            <IconButton
              variant="ghost"
              size="sm"
              icon={<TabClose />}
              aria-label="Close all tabs"
              disabled={tabs.length === 0}
              onClick={closeAll}
            />
          </Tooltip>
        </>
      }
    />
  );
}
