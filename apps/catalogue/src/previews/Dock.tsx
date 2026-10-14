import { useEffect, useState } from 'react';
import {
  ActionGroup,
  Button,
  IconButton,
  Kbd,
  Menu,
  MenuItem,
  PanelDock,
  PanelDockHeader,
  Stack,
  Text,
  Textarea,
  type PanelDockMode,
  type PanelDockPanel,
} from '@envsemble/envui';
import { ContentCopy } from '@envsemble/envui/icons/ContentCopy';
import { Description } from '@envsemble/envui/icons/Description';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';
import { Share } from '@envsemble/envui/icons/Share';
import { Example } from './Example';
import { Preview } from './Preview';

interface SampleDocument {
  id: string;
  title: string;
  /** A shorter chip label for a long title. */
  label?: string;
  editor: string;
  edited: string;
  summary: string;
  draft: string;
}

const sampleDocuments: SampleDocument[] = [
  {
    id: 'report',
    title: 'Quarterly report',
    editor: 'Alex Morgan',
    edited: '5 minutes ago',
    summary: 'Revenue grew in every region this quarter.',
    draft: '',
  },
  {
    id: 'notes',
    title: 'Meeting notes',
    editor: 'Sam Lee',
    edited: 'yesterday',
    summary: 'The team agreed on the dates for the next release.',
    draft: '',
  },
  {
    id: 'budget',
    title: 'Budget for the second half',
    label: 'Budget',
    editor: 'Alex Morgan',
    edited: 'Monday',
    summary: 'Support hiring trails the plan by two people.',
    draft: 'Move the design review to the first week.',
  },
  {
    id: 'roadmap',
    title: 'Roadmap',
    editor: 'Sam Lee',
    edited: 'last week',
    summary: 'Search and sharing come first in the next quarter.',
    draft: '',
  },
];

interface DocumentPanel extends PanelDockPanel {
  document: SampleDocument;
}

function documentPanel(id: string, mode: PanelDockMode, active = false): DocumentPanel {
  const document = sampleDocuments.find((candidate) => candidate.id === id)!;
  return {
    id,
    title: document.title,
    label: document.label,
    mode,
    active,
    // The application keeps heights in pixels; these leave the page's controls in view.
    height: 336,
    icon: <Description />,
    tooltip: `${document.title} · ${document.editor}`,
    document,
  };
}

/** The application's side of a dock: the open documents, their modes and the active one. */
function useSampleDock(initial: ReadonlyArray<readonly [string, PanelDockMode]>, active: string) {
  const [panels, setPanels] = useState(() =>
    initial.map(([id, mode]) => documentPanel(id, mode, id === active)),
  );
  const update = (change: (panel: DocumentPanel) => DocumentPanel) =>
    setPanels((current) => current.map(change));
  return {
    panels,
    changeMode: (id: string, mode: PanelDockMode) =>
      // One panel at a time is maximized; maximizing another returns the earlier one to the row.
      update((panel) =>
        panel.id === id
          ? { ...panel, mode }
          : mode === 'maximized' && panel.mode === 'maximized'
            ? { ...panel, mode: 'open' }
            : panel,
      ),
    activate: (id: string) => update((panel) => ({ ...panel, active: panel.id === id })),
    close: (id: string) => setPanels((current) => current.filter((panel) => panel.id !== id)),
    resize: (id: string, height: number) =>
      update((panel) => (panel.id === id ? { ...panel, height } : panel)),
    markChanged: (id: string, changed: boolean) =>
      setPanels((current) =>
        current.some((panel) => panel.id === id && Boolean(panel.attention) !== changed)
          ? current.map((panel) =>
              panel.id === id
                ? { ...panel, attention: changed ? 'Unsaved changes' : undefined }
                : panel,
            )
          : current,
      ),
    open: (id: string) =>
      setPanels((current) =>
        current.some((panel) => panel.id === id)
          ? current.map((panel) => ({
              ...panel,
              active: panel.id === id,
              mode: panel.id === id && panel.mode === 'minimized' ? 'open' : panel.mode,
            }))
          : [
              ...current.map((panel) => ({ ...panel, active: false })),
              documentPanel(id, 'open', true),
            ],
      ),
  };
}

/** A document's window: its draft lives in the panel's own state. */
function DocumentWindow({
  document,
  onChangedChange,
}: {
  document: SampleDocument;
  onChangedChange: (changed: boolean) => void;
}) {
  const [draft, setDraft] = useState(document.draft);
  const changed = draft !== '';
  useEffect(() => onChangedChange(changed), [changed]);
  return (
    <>
      <PanelDockHeader
        title={document.title}
        meta={`Edited by ${document.editor} · ${document.edited}`}
        actions={
          <Menu
            aria-label={`${document.title} actions`}
            density="compact"
            trigger={<IconButton variant="text" icon={<MoreVert />} aria-label="More actions" />}
          >
            <MenuItem icon={<Share />}>Share</MenuItem>
            <MenuItem icon={<ContentCopy />}>Make a copy</MenuItem>
          </Menu>
        }
      />
      <Stack gap={4} className="docs-dock-body">
        <Text tone="muted">{document.summary}</Text>
        <Textarea
          label="Draft"
          rows={4}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      </Stack>
    </>
  );
}

function SampleDock({
  initial,
  active,
  narrow = false,
  overflow,
}: {
  initial: ReadonlyArray<readonly [string, PanelDockMode]>;
  active: string;
  narrow?: boolean;
  overflow?: 'scroll' | 'minimize';
}) {
  const dock = useSampleDock(initial, active);
  const [stacked, setStacked] = useState(false);
  // The page beneath is unavailable while a panel covers it.
  const covered = stacked
    ? dock.panels.some((panel) => panel.mode !== 'minimized')
    : dock.panels.some((panel) => panel.mode === 'maximized');
  return (
    <div
      className="docs-dock-frame"
      data-narrow={narrow || undefined}
      data-medium={overflow === 'minimize' || undefined}
    >
      <Stack gap={4} className="docs-dock-page" inert={covered}>
        <Text as="h3" variant="section-heading">
          Documents
        </Text>
        <Text tone="muted">Open documents to work on them side by side.</Text>
        <ActionGroup>
          {sampleDocuments.map((document) => (
            <Button
              key={document.id}
              variant="secondary"
              startIcon={<Description />}
              onClick={() => dock.open(document.id)}
            >
              {document.label ?? document.title}
            </Button>
          ))}
        </ActionGroup>
      </Stack>
      <PanelDock
        panels={dock.panels}
        onModeChange={dock.changeMode}
        onClose={dock.close}
        onActivate={dock.activate}
        onHeightChange={dock.resize}
        onStackedChange={setStacked}
        overflow={overflow}
      >
        {(panel) => (
          <DocumentWindow
            document={panel.document}
            onChangedChange={(changed) => dock.markChanged(panel.id, changed)}
          />
        )}
      </PanelDock>
    </div>
  );
}

export function PanelDockPreview() {
  const [narrow, setNarrow] = useState(false);
  return (
    <Preview>
      <Example
        title="Docked panels"
        size="wide"
        caption={
          <>
            Type a draft, then minimize, maximize and restore its panel: the draft stays, as the
            panel&rsquo;s content is never mounted again. Drag a panel&rsquo;s top edge, or focus it
            and press <Kbd>↑</Kbd> or <Kbd>↓</Kbd>, to change its height. Open more documents to see
            the row share its room, then scroll. In a narrow region, one panel at a time fills it.
          </>
        }
        actions={
          <Button variant="secondary" onClick={() => setNarrow((value) => !value)}>
            {narrow ? 'Wide region' : 'Narrow region'}
          </Button>
        }
      >
        <SampleDock
          initial={[
            ['report', 'open'],
            ['notes', 'open'],
            ['budget', 'minimized'],
          ]}
          active="notes"
          narrow={narrow}
        />
      </Example>
      <Example
        title="Minimize what does not fit"
        size="wide"
        caption="With overflow set to minimize, open panels that cannot all sit side by side at their minimum widths make room: the least recently active one other than the active one waits as a chip, so no panel scrolls out of view. Open another document to see the next one make room."
      >
        <SampleDock
          initial={[
            ['report', 'open'],
            ['notes', 'open'],
            ['roadmap', 'open'],
          ]}
          active="roadmap"
          overflow="minimize"
        />
      </Example>
      <Example
        title="Maximized panel"
        size="wide"
        caption="A maximized panel fills the region behind the open panels, which keep their modes. Its Restore control returns it to the row."
      >
        <SampleDock
          initial={[
            ['report', 'maximized'],
            ['notes', 'open'],
            ['budget', 'minimized'],
          ]}
          active="report"
        />
      </Example>
    </Preview>
  );
}
