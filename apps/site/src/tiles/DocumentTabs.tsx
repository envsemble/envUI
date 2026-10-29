import { useState } from 'react';
import { DocumentTabs, IconButton, Surface, Text, type DocumentTabsItem } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { usePointer, type PointerStep } from '../motion/Motion';

const documents: DocumentTabsItem[] = ['Plan.md', 'Notes.md'].map((label) => ({
  value: label,
  label,
}));

/** The first line of each document, the panel under the strip, which the application renders. */
const firstLines: Record<string, string> = {
  'Plan.md': 'Launch in the spring.',
  'Notes.md': 'From the interviews.',
};

const tab = (id: string) => `.env-document-tabs-tab[data-tab-id="${id}"]`;
const close = (id: string) =>
  `.env-document-tabs-item:has(> ${tab(id)}) > .env-document-tabs-close`;

/*
 * Notes.md shown, then closed by its button, which shows Plan.md beside it, opened again by New
 * document, and Plan.md shown, as it began.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: tab('Notes.md') },
  { wait: 400 },
  { click: true },
  { wait: 900 },
  { to: close('Notes.md'), duration: 350 },
  { wait: 250 },
  { click: true },
  { wait: 900 },
  { to: '.env-document-tabs-end .env-icon-button', duration: 350 },
  { wait: 200 },
  { click: true },
  { wait: 900 },
  { to: tab('Plan.md'), duration: 500 },
  { wait: 200 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 400 },
];

/** Two open documents, Plan.md shown, over the start of its page. */
export default function DocumentTabsTile() {
  const [tabs, setTabs] = useState(documents);
  const [value, setValue] = useState<string | null>(documents[0]!.value);
  usePointer(script);
  return (
    <Surface background="default" padding={0} style={{ inlineSize: '16.5rem' }}>
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
            icon={<Add />}
            aria-label="New document"
            variant="ghost"
            size="sm"
            onClick={() => {
              const missing = documents.find((item) => !tabs.includes(item));
              if (!missing) return;
              setTabs([...tabs, missing]);
              setValue(missing.value);
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
