import { useEffect, useState } from 'react';
import {
  Button,
  IconButton,
  Menu,
  PanelDock,
  Column,
  Row,
  Surface,
  Text,
  Textarea,
  type PanelDockMode,
  type PanelDockPanel,
} from '@envsemble/envui';
import { ContentCopy } from '@envsemble/envui/icons/ContentCopy';
import { Description } from '@envsemble/envui/icons/Description';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';
import { Share } from '@envsemble/envui/icons/Share';

interface Document {
  id: string;
  title: string;
  /** A shorter chip label for a long title. */
  label?: string;
  editor: string;
  summary: string;
  draft: string;
}

const documents: Document[] = [
  {
    id: 'report',
    title: 'Quarterly report',
    editor: 'Alex Morgan',
    summary: 'Revenue grew in every region this quarter.',
    draft: '',
  },
  {
    id: 'notes',
    title: 'Meeting notes',
    editor: 'Sam Lee',
    summary: 'The team agreed on the dates for the next release.',
    draft: '',
  },
  {
    id: 'budget',
    title: 'Budget for the second half',
    label: 'Budget',
    editor: 'Priya Shah',
    summary: 'Support hiring trails the plan by two people.',
    draft: 'Move the design review to the first week.',
  },
  {
    id: 'roadmap',
    title: 'Roadmap',
    editor: 'Sam Lee',
    summary: 'Search and sharing come first next quarter.',
    draft: '',
  },
];

interface DocumentPanel extends PanelDockPanel {
  document: Document;
}

function panelFor(document: Document, mode: PanelDockMode, active = false): DocumentPanel {
  return {
    id: document.id,
    title: document.title,
    label: document.label,
    mode,
    active,
    // The application keeps each panel's height, in pixels; this one leaves the page's buttons in view.
    height: 320,
    icon: <Description />,
    tooltip: `${document.title} · ${document.editor}`,
    document,
  };
}

/** A document's window. Its draft lives in the panel's own state, which every mode keeps. */
function DocumentWindow({
  document,
  onChangedChange,
}: {
  document: Document;
  onChangedChange: (changed: boolean) => void;
}) {
  const [draft, setDraft] = useState(document.draft);
  const changed = draft !== '';
  // Reports only when the draft starts or stops differing; the callback is new on every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => onChangedChange(changed), [changed]);
  return (
    <>
      <PanelDock.Header
        title={document.title}
        meta={`Edited by ${document.editor}`}
        actions={
          <Menu.Root
            aria-label={`${document.title} actions`}
            trigger={<IconButton icon={<MoreVert />} aria-label="More actions" />}
          >
            <Menu.Item icon={<Share />}>Share</Menu.Item>
            <Menu.Item icon={<ContentCopy />}>Make a copy</Menu.Item>
          </Menu.Root>
        }
      />
      {/* The body's inset lines up with the header's title. */}
      <Column gap={4} style={{ padding: '0 1.5rem 1.5rem' }}>
        <Text emphasis="muted">{document.summary}</Text>
        <Textarea
          label="Draft"
          rows={4}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      </Column>
    </>
  );
}

export default function DocumentDrafts() {
  const [panels, setPanels] = useState(() => [
    panelFor(documents[0]!, 'open'),
    panelFor(documents[1]!, 'open', true),
    panelFor(documents[2]!, 'minimized'),
  ]);
  const [stacked, setStacked] = useState(false);
  const update = (change: (panel: DocumentPanel) => DocumentPanel) =>
    setPanels((current) => current.map(change));
  const open = (document: Document) =>
    setPanels((current) =>
      current.some((panel) => panel.id === document.id)
        ? current.map((panel) => ({
            ...panel,
            active: panel.id === document.id,
            mode: panel.id === document.id && panel.mode === 'minimized' ? 'open' : panel.mode,
          }))
        : [
            ...current.map((panel) => ({ ...panel, active: false })),
            panelFor(document, 'open', true),
          ],
    );
  const markChanged = (id: string, changed: boolean) =>
    update((panel) =>
      panel.id === id ? { ...panel, attention: changed ? 'Unsaved changes' : undefined } : panel,
    );
  // The page beneath is out of reach while a panel covers it.
  const covered = panels.some((panel) =>
    stacked ? panel.mode !== 'minimized' : panel.mode === 'maximized',
  );
  return (
    // The dock fills a positioned region with a height, such as the area below a topbar.
    <Surface
      background="muted"
      padding={0}
      style={{ position: 'relative', blockSize: '34rem', overflow: 'hidden' }}
    >
      <Column gap={4} inert={covered} style={{ padding: '2rem' }}>
        <Text render={<h3 />} variant="title">
          Documents
        </Text>
        <Text emphasis="muted">Open documents to work on them beside the page.</Text>
        <Row wrap align="center" gap={4}>
          {documents.map((document) => (
            <Button
              key={document.id}
              variant="secondary"
              startIcon={<Description />}
              onClick={() => open(document)}
            >
              {document.label ?? document.title}
            </Button>
          ))}
        </Row>
      </Column>
      <PanelDock.Root
        panels={panels}
        onModeChange={(id, mode) =>
          // One panel at a time is maximized; maximizing another returns the earlier one.
          update((panel) =>
            panel.id === id
              ? { ...panel, mode }
              : mode === 'maximized' && panel.mode === 'maximized'
                ? { ...panel, mode: 'open' }
                : panel,
          )
        }
        onClose={(id) => setPanels((current) => current.filter((panel) => panel.id !== id))}
        onActivate={(id) => update((panel) => ({ ...panel, active: panel.id === id }))}
        onHeightChange={(id, height) =>
          update((panel) => (panel.id === id ? { ...panel, height } : panel))
        }
        onStackedChange={setStacked}
      >
        {(panel) => (
          <DocumentWindow
            document={panel.document}
            onChangedChange={(changed) => markChanged(panel.id, changed)}
          />
        )}
      </PanelDock.Root>
    </Surface>
  );
}
