import { useState } from 'react';
import { Badge, DocumentTabs, Menu, Text, type DocumentTabsItem } from '@envsemble/envui';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { IconHome } from '@envsemble/envui/icons/Home';

const inFolder = (folder: string, name: string) => (
  <>
    <Text variant="body-sm" emphasis="subtle" render={<span />}>
      {folder}/
    </Text>
    {name}
  </>
);

const documents: DocumentTabsItem[] = [
  { value: 'welcome', label: 'Welcome', start: <IconHome />, closable: false },
  {
    value: 'api/index.ts',
    label: inFolder('api', 'index.ts'),
    start: <IconDescription />,
    end: <Badge tone="danger" count={2} />,
  },
  {
    value: 'web/index.ts',
    label: inFolder('web', 'index.ts'),
    start: <IconDescription />,
  },
];

export default function EditorTabs() {
  const [tabs, setTabs] = useState(documents);
  const [value, setValue] = useState<string | null>('api/index.ts');
  const closeOthers = (id: string) =>
    setTabs((current) => current.filter((tab) => tab.value === id || tab.closable === false));
  return (
    <DocumentTabs
      aria-label="Open files"
      items={tabs}
      value={value}
      onValueChange={setValue}
      onClose={(id) => {
        setTabs((current) => current.filter((tab) => tab.value !== id));
        if (id === value) setValue('welcome');
      }}
      contextMenu={(tab) =>
        tab && (
          <>
            <Menu.Item onClick={() => closeOthers(tab.value)}>Close others</Menu.Item>
            <Menu.Item onClick={() => navigator.clipboard?.writeText(tab.value)}>
              Copy path
            </Menu.Item>
          </>
        )
      }
    />
  );
}
