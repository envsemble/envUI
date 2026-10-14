import { useEffect, useState, type KeyboardEvent } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  PanelDock,
  PanelDockHeader,
  Text,
  Textarea,
  Theme,
  type PanelDockMode,
  type PanelDockPanel,
  type ThemeValue,
} from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { Edit } from '@envsemble/envui/icons/Edit';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';

const initialPanels: PanelDockPanel[] = [
  { id: 'report', title: 'Quarterly report', mode: 'open', icon: <Description /> },
  {
    id: 'notes',
    title: 'Meeting notes',
    mode: 'open',
    active: true,
    preferredWidth: 448,
    minWidth: 288,
    minHeight: 200,
    maxHeight: 400,
  },
  {
    id: 'budget',
    title: 'Budget for the second half',
    label: 'Budget',
    mode: 'minimized',
    attention: 'Unsaved changes',
    tooltip: 'Budget for the second half',
  },
];

const extraTitles = ['Roadmap', 'Release checklist', 'Interview notes', 'Design review'];

/** Panels over a page in a positioned frame, with the application's own state and shortcuts. */
export function PanelDockFixture({ theme }: { theme: ThemeValue }) {
  const [panels, setPanels] = useState(initialPanels);
  const [stacked, setStacked] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [mounts, setMounts] = useState<Record<string, number>>({});
  const record = (entry: string) => setLog((current) => [...current.slice(-7), entry]);
  const update = (id: string, change: (panel: PanelDockPanel) => PanelDockPanel) =>
    setPanels((current) => current.map((panel) => (panel.id === id ? change(panel) : panel)));
  const activeId = panels.find((panel) => panel.active)?.id;

  function changeMode(id: string, mode: PanelDockMode) {
    // At most one panel is maximized: maximizing another returns the earlier one to the row.
    setPanels((current) =>
      current.map((panel) =>
        panel.id === id
          ? { ...panel, mode }
          : mode === 'maximized' && panel.mode === 'maximized'
            ? { ...panel, mode: 'open' }
            : panel,
      ),
    );
    record(`mode ${id} ${mode}`);
  }

  function activate(id: string) {
    setPanels((current) => current.map((panel) => ({ ...panel, active: panel.id === id })));
    record(`activate ${id}`);
  }

  // The application's own shortcuts act on the active panel, wherever focus is, or reorder panels.
  function shortcut(event: KeyboardEvent) {
    if (!event.altKey) return;
    if (event.code === 'KeyR') {
      event.preventDefault();
      setPanels((current) => [...current].reverse());
      return;
    }
    if (!activeId) return;
    const mode = (
      { KeyM: 'minimized', KeyX: 'maximized', KeyO: 'open' } as Record<string, PanelDockMode>
    )[event.code];
    if (!mode) return;
    event.preventDefault();
    changeMode(activeId, mode);
  }

  function openDocument() {
    const count = panels.length - initialPanels.length;
    const title = extraTitles[count % extraTitles.length]!;
    const id = `extra-${count + 1}`;
    setPanels((current) => [
      ...current.map((panel) => ({ ...panel, active: false })),
      { id, title: `${title} ${count + 1}`, mode: 'open', active: true },
    ]);
  }

  // The page beneath is unavailable while a panel covers it.
  const covered = stacked
    ? panels.some((panel) => panel.mode !== 'minimized')
    : panels.some((panel) => panel.mode === 'maximized');

  return (
    <Theme theme={theme} data-testid={`dock-${theme}`} className="fixture-section">
      <div className="fixture-dock-frame" data-testid={`dock-frame-${theme}`} onKeyDown={shortcut}>
        <main className="fixture-dock-page" inert={covered}>
          <Text as="h2" variant="section-heading">
            Workspace {theme}
          </Text>
          <button type="button" onClick={() => record('page')}>
            Page action {theme}
          </button>
        </main>
        <PanelDock
          data-testid={`dock-region-${theme}`}
          panels={panels}
          onModeChange={changeMode}
          onClose={(id) => {
            setPanels((current) => current.filter((panel) => panel.id !== id));
            record(`close ${id}`);
          }}
          onActivate={activate}
          onHeightChange={(id, height) => {
            update(id, (panel) => ({ ...panel, height }));
            record(`height ${id} ${height}`);
          }}
          onStackedChange={(next) => {
            setStacked(next);
            record(`stacked ${next}`);
          }}
        >
          {(panel) => (
            <DocumentWindow
              panel={panel}
              theme={theme}
              onMount={(change) =>
                setMounts((current) => ({
                  ...current,
                  [panel.id]: (current[panel.id] ?? 0) + change,
                }))
              }
            />
          )}
        </PanelDock>
      </div>
      <div className="fixture-actions">
        <button type="button" onClick={openDocument}>
          Open document {theme}
        </button>
      </div>
      <output data-testid={`dock-log-${theme}`}>{log.join('\n')}</output>
      <output data-testid={`dock-mounts-${theme}`}>
        {Object.entries(mounts)
          .map(([id, count]) => `${id}:${count}`)
          .join(' ')}
      </output>
    </Theme>
  );
}

/** A document's window: a draft that must survive every change of mode and order. */
function DocumentWindow({
  panel,
  theme,
  onMount,
}: {
  panel: PanelDockPanel;
  theme: ThemeValue;
  onMount: (change: number) => void;
}) {
  const [draft, setDraft] = useState('');
  const [tip, setTip] = useState(true);
  // Counts how many times the content is mounted, so a remount shows.
  useEffect(() => {
    onMount(1);
    return () => onMount(-1);
  }, []);
  return (
    <>
      <PanelDockHeader
        title={panel.title}
        meta={`Edited by Alex Morgan · ${theme}`}
        actions={
          <>
            <IconButton
              variant="text"
              icon={<Edit />}
              aria-label={`Edit ${panel.title} ${theme}`}
            />
            <Menu
              aria-label={`${panel.title} actions ${theme}`}
              density="compact"
              trigger={
                <IconButton
                  variant="text"
                  icon={<MoreVert />}
                  aria-label={`More actions for ${panel.title} ${theme}`}
                />
              }
            >
              <MenuItem>Share</MenuItem>
            </Menu>
          </>
        }
      />
      <div className="fixture-dock-body">
        <Textarea
          label={`Draft of ${panel.title} ${theme}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <ol className="fixture-dock-list" aria-label={`Sections of ${panel.title} ${theme}`}>
          {Array.from({ length: 30 }, (_, index) => (
            <li key={index}>Section {index + 1}</li>
          ))}
        </ol>
        {/* Removes itself when pressed, leaving focus nowhere. */}
        {tip && (
          <button type="button" onClick={() => setTip(false)}>
            Dismiss tip of {panel.title} {theme}
          </button>
        )}
        {Array.from({ length: 12 }, (_, index) => (
          <Text key={index}>
            Paragraph {index + 1} of {panel.title}.
          </Text>
        ))}
      </div>
    </>
  );
}
