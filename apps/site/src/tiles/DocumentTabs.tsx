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

/** A new document's name, as an application names one until it is named. */
const untitled = 'Untitled';

/**
 * The first line of each document, in the panel under the strip, which the application renders. A
 * new document is empty and shows its placeholder instead.
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
 * Shows Spec, then opens a new document from New document: Untitled, empty, which shows. Closes it
 * with its button, which shows Spec beside it again, then shows Plan, as it began.
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

/*
 * On a phone, with Plan alone open: opens a new document from New document, Untitled, empty, which
 * shows, with the strip scrolled to it. Closes it with its button, which shows Plan again, as it
 * began.
 */
const short: PointerStep[] = [
  { wait: 300 },
  { to: '.env-document-tabs-end .env-icon-button' },
  { wait: 400 },
  { click: true },
  { wait: 1000 },
  { to: close(untitled), duration: 350 },
  { wait: 250 },
  { click: true },
  { wait: 800 },
  { leave: true },
  { wait: 400 },
];

/**
 * Two open documents, with Plan shown above the start of its page, short enough to show whole. On a
 * phone's narrower tile, Plan alone, with New document beside it, as wide as the strip is with
 * Untitled open beside Plan, so the open tabs and Untitled's close button show whole while it
 * plays: there it is drawn as much smaller as shows that whole, for its whole loop (useHeldView).
 * When the tile stops, its documents are open again, with Plan shown.
 */
export default function DocumentTabsTile() {
  const narrow = useMedia(narrowGallery);
  return <Strip key={String(narrow)} narrow={narrow} />;
}

function Strip({ narrow }: { narrow: boolean }) {
  const open = narrow ? documents.slice(0, 1) : documents;
  const [tabs, setTabs] = useState(open);
  const [value, setValue] = useState<string | null>(documents[0].value);
  usePointer(narrow ? short : script, {
    onRest: () => {
      setTabs(open);
      setValue(documents[0].value);
    },
  });
  return (
    <Surface
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

/** Holds the tile's view while it plays, drawn whole (useHeldView, useMustShow). */
function HeldWhole() {
  useHeldView();
  useMustShow('.env-document-tabs');
  return null;
}
