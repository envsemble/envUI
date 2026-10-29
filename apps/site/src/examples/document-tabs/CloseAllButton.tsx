import { useState } from 'react';
import { DocumentTabs, IconButton, Tooltip, type DocumentTabsItem } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconTabClose } from '@envsemble/envui/icons/TabClose';

const first: DocumentTabsItem[] = [
  { value: 'roadmap', label: 'Roadmap.md' },
  { value: 'decisions', label: 'Decisions.md' },
  { value: 'interviews', label: 'Interviews.md' },
];

export default function CloseAllButton() {
  const [tabs, setTabs] = useState(first);
  const [value, setValue] = useState<string | null>('roadmap');
  const [count, setCount] = useState(1);

  const open = () => {
    const tab = { value: `untitled-${count}`, label: `Untitled ${count}.md` };
    setTabs((current) => [...current, tab]);
    setValue(tab.value);
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
        const index = tabs.findIndex((tab) => tab.value === id);
        const remaining = tabs.filter((tab) => tab.value !== id);
        setTabs(remaining);
        if (id === value) setValue(remaining[Math.min(index, remaining.length - 1)]?.value ?? null);
      }}
      onCloseAll={closeAll}
      // The application's own buttons, after the tabs and on their hairline.
      end={
        <>
          <Tooltip content="New document">
            <IconButton
              variant="ghost"
              size="sm"
              icon={<IconAdd />}
              aria-label="New document"
              onClick={open}
            />
          </Tooltip>
          <Tooltip content="Close all tabs">
            <IconButton
              variant="ghost"
              size="sm"
              icon={<IconTabClose />}
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
