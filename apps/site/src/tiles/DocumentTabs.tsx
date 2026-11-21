import { useState } from 'react';
import { DocumentTabs, IconButton, Surface, Text, type DocumentTabsItem } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { useMedia } from '../motion/Autoplay';
import { useHeldView, useMustShow } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';

const documents: DocumentTabsItem[] = ['Plan', 'Spec'].map((label) => ({
  value: label,
  label,
}));

const untitled = 'Untitled';

const firstLines: Record<string, string> = {
  Plan: 'Launch in May.',
  Spec: 'Five screens.',
  [untitled]: 'Start writing.',
};

const tab = (id: string) => `.env-document-tabs-tab[data-value="${id}"]`;
const close = (id: string) =>
  `.env-document-tabs-item:has(> ${tab(id)}) > .env-document-tabs-close`;

const script: PointerStep[] = [
  { wait: 180 },
  { to: tab('Spec') },
  { wait: 240 },
  { click: true },
  { wait: 540 },
  { to: '.env-document-tabs-end .env-icon-button', duration: 350 },
  { wait: 120 },
  { click: true },
  { wait: 600 },
  { to: close(untitled), duration: 350 },
  { wait: 150 },
  { click: true },
  { wait: 420 },
  { to: tab('Plan'), duration: 500 },
  { wait: 120 },
  { click: true },
  { wait: 360 },
  { leave: true },
  { wait: 240 },
];

const phoneScript: PointerStep[] = [
  { wait: 180 },
  { to: '.env-document-tabs-end .env-icon-button' },
  { wait: 240 },
  { click: true },
  { wait: 600 },
  { to: close(untitled), duration: 350 },
  { wait: 150 },
  { click: true },
  { wait: 480 },
  { leave: true },
  { wait: 240 },
];

export default function DocumentTabsTile() {
  const narrow = useMedia(narrowGallery);
  return <Strip key={String(narrow)} narrow={narrow} />;
}

function Strip({ narrow }: { narrow: boolean }) {
  const open = narrow ? documents.slice(0, 1) : documents;
  const [tabs, setTabs] = useState(open);
  const [value, setValue] = useState<string | null>(documents[0].value);
  usePointer(narrow ? phoneScript : script, {
    onRest: () => {
      setTabs(open);
      setValue(documents[0].value);
    },
  });
  return (
    <Surface
      radius="none"
      background="default"
      padding={0}
      style={{ inlineSize: narrow ? '12.75rem' : '12.5rem' }}
    >
      {narrow && <HeldWhole />}
      <DocumentTabs
        aria-label="Open documents"
        items={tabs}
        value={value}
        onValueChange={setValue}
        onClose={(id) => {
          const index = tabs.findIndex((item) => item.value === id);
          const remaining = tabs.filter((item) => item.value !== id);
          setTabs(remaining);
          if (id === value)
            setValue(remaining[Math.min(index, remaining.length - 1)]?.value ?? null);
        }}
        end={
          <IconButton
            icon={<IconAdd />}
            aria-label="New document"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (tabs.some((item) => item.value === untitled)) return;
              setTabs([...tabs, { value: untitled, label: untitled }]);
              setValue(untitled);
            }}
          />
        }
      />
      <Text variant="body-sm" emphasis="muted" style={{ padding: '1rem' }}>
        {value ? firstLines[value] : null}
      </Text>
    </Surface>
  );
}

function HeldWhole() {
  useHeldView();
  useMustShow('.env-document-tabs');
  return null;
}
