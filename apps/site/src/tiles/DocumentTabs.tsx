import { useState } from 'react';
import { DocumentTabs, IconButton, Surface, Text, type DocumentTabsItem } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { useMedia } from '../motion/Autoplay';
import { usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

const documents: DocumentTabsItem[] = ['Plan', 'Spec'].map((label) => ({
  value: label,
  label,
}));

/** A new document's name, as an application names one until it is named. */
const untitled = 'Untitled';

/**
 * The first line of each document, the panel under the strip, which the application renders; a
 * new one is empty, its placeholder in its place.
 */
const firstLines: Record<string, string> = {
  Plan: 'Launch in May.',
  Spec: 'Five screens.',
  [untitled]: 'Start writing.',
};

const tab = (id: string) => `.env-document-tabs-tab[data-tab-id="${id}"]`;
const close = (id: string) =>
  `.env-document-tabs-item:has(> ${tab(id)}) > .env-document-tabs-close`;

/*
 * Spec shown, then a new document opened from New document, Untitled, empty, which shows; closed
 * by its button, which shows Spec beside it again, and Plan shown, as it began.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: tab('Spec') },
  { wait: 400 },
  { click: true },
  { wait: 900 },
  { to: '.env-document-tabs-end .env-icon-button', duration: 350 },
  { wait: 200 },
  { click: true },
  { wait: 1000 },
  { to: close(untitled), duration: 350 },
  { wait: 250 },
  { click: true },
  { wait: 700 },
  { to: tab('Plan'), duration: 500 },
  { wait: 200 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 400 },
];

/* On a phone, without New document: Spec shown and closed, and both open again as it rests. */
const short: PointerStep[] = [
  { wait: 300 },
  { to: tab('Spec') },
  { wait: 400 },
  { click: true },
  { wait: 900 },
  { to: close('Spec'), duration: 350 },
  { wait: 250 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 400 },
];

/**
 * Two open documents, Plan shown, over the start of its page, short enough to show whole; on a
 * phone's narrower tile, narrower, without the New document button, so it is drawn at about its
 * own size there too. Stopped, both documents are open again, Plan shown.
 */
export default function DocumentTabsTile() {
  const narrow = useMedia(narrowGallery);
  const [tabs, setTabs] = useState(documents);
  const [value, setValue] = useState<string | null>(documents[0]!.value);
  usePointer(narrow ? short : script, {
    onRest: () => {
      setTabs(documents);
      setValue(documents[0]!.value);
    },
  });
  return (
    <Surface background="default" padding={0} style={{ inlineSize: narrow ? '10rem' : '12.5rem' }}>
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
          narrow ? undefined : (
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
          )
        }
      />
      <Text variant="body-sm" emphasis="muted" style={{ padding: '1rem' }}>
        {value ? firstLines[value] : null}
      </Text>
    </Surface>
  );
}
