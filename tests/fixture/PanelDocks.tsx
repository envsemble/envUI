import {
  memo,
  Profiler,
  startTransition,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import {
  EnvUIProvider,
  IconButton,
  Menu,
  PanelDock,
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

/** A panel with a chat, whose messages the application adds, and which it can rewind to the start. */
type FixturePanel = PanelDockPanel & { messages?: number; rewinds?: number };

const initialPanels: FixturePanel[] = [
  { id: 'report', title: 'Quarterly report', mode: 'open', icon: <Description />, messages: 8 },
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
  const update = (id: string, change: (panel: FixturePanel) => FixturePanel) =>
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
    // A reorder and a new message in every chat in the same update.
    if (event.code === 'KeyN') {
      event.preventDefault();
      setPanels((current) =>
        [...current].reverse().map((panel) => ({ ...panel, messages: (panel.messages ?? 4) + 1 })),
      );
      return;
    }
    // A reorder that rewinds every chat to its first message in the same update.
    if (event.code === 'KeyT') {
      event.preventDefault();
      setPanels((current) =>
        [...current].reverse().map((panel) => ({ ...panel, rewinds: (panel.rewinds ?? 0) + 1 })),
      );
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
          <Text render={<h2 />} variant="title">
            Workspace {theme}
          </Text>
          <button type="button" onClick={() => record('page')}>
            Page action {theme}
          </button>
        </main>
        <PanelDock.Root
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
        </PanelDock.Root>
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
      <OtherDocks theme={theme} />
    </Theme>
  );
}

/**
 * The other docks, each with its own state, apart from the main dock's updates, which render none
 * of them again.
 */
const OtherDocks = memo(function OtherDocks({ theme }: { theme: ThemeValue }) {
  return (
    <>
      <PassiveDock theme={theme} />
      <LooseDock theme={theme} />
      {theme === 'light' && <TranslatedDock />}
      <MinimizingDock
        name="minimizing"
        theme={theme}
        initial={[
          { id: 'plan', title: `Plan ${theme}`, mode: 'open' },
          { id: 'review', title: `Review ${theme}`, mode: 'open' },
          { id: 'retro', title: `Retrospective ${theme}`, mode: 'open', active: true },
        ]}
        activates
      />
      {theme === 'light' && (
        <>
          {/* The application marks a panel active but never activates another. */}
          <MinimizingDock
            name="protective"
            theme={theme}
            className="fixture-dock-single"
            initial={[
              { id: 'alpha', title: 'Alpha', mode: 'open', active: true },
              { id: 'beta', title: 'Beta', mode: 'minimized' },
            ]}
          />
          {/* One panel wider than the row, and none active. */}
          <MinimizingDock
            name="lone"
            theme={theme}
            className="fixture-dock-single"
            initial={[{ id: 'solo', title: 'Solo', mode: 'open', minWidth: 720 }]}
          />
          {/* The active panel alone is wider than the row. */}
          <MinimizingDock
            name="wide"
            theme={theme}
            className="fixture-dock-single"
            initial={[
              { id: 'draft', title: 'Draft', mode: 'open' },
              { id: 'outline', title: 'Outline', mode: 'open' },
              { id: 'canvas', title: 'Canvas', mode: 'open', active: true, minWidth: 720 },
            ]}
            activates
          />
          {/* Narrower than stackBelow from the start. */}
          <MinimizingDock
            name="stacking"
            theme={theme}
            className="fixture-dock-narrow"
            initial={[
              { id: 'one', title: 'One', mode: 'open' },
              { id: 'two', title: 'Two', mode: 'open' },
              { id: 'three', title: 'Three', mode: 'open', active: true },
            ]}
            activates
            labels={{ showLabel: (label) => `Bring back ${label}` }}
          />
          {/* The application's style makes open panels wider at the least than minimized ones. */}
          <MinimizingDock
            name="wider"
            theme={theme}
            className="fixture-dock-wider-open"
            initial={[
              { id: 'p0', title: 'P0', mode: 'open' },
              { id: 'p1', title: 'P1', mode: 'open', active: true },
            ]}
            activates
          />
          {/* The application's own state narrows the region below stackBelow. */}
          <MinimizingDock
            name="squeezed"
            theme={theme}
            initial={[
              { id: 'p0', title: 'P0', mode: 'open' },
              { id: 'p1', title: 'P1', mode: 'open', active: true },
              { id: 'p2', title: 'P2', mode: 'minimized' },
            ]}
            activates
            narrowTo="30rem"
          />
          {/* The application opens a panel it minimized again itself, shortly after. */}
          <MinimizingDock
            name="reopening"
            theme={theme}
            initial={[
              { id: 'p0', title: 'P0', mode: 'open' },
              { id: 'p1', title: 'P1', mode: 'open' },
              { id: 'p2', title: 'P2', mode: 'open', active: true },
            ]}
            activates
            reopensAfter={100}
          />
          {/* People type in a panel while the application opens others, and none is active. */}
          <MinimizingDock
            name="typing"
            theme={theme}
            initial={[{ id: 'draft', title: 'Draft', mode: 'open' }]}
            opensNotes
          />
          {/* The application answers a second later, in a transition. */}
          <MinimizingDock
            name="late"
            theme={theme}
            initial={[
              { id: 'p0', title: 'P0', mode: 'open' },
              { id: 'p1', title: 'P1', mode: 'open' },
              { id: 'p2', title: 'P2', mode: 'open', active: true },
            ]}
            activates
            answerDelay={1000}
          />
          {/* The application keeps its pinned panel open when asked to minimize it. */}
          <MinimizingDock
            name="keeping"
            theme={theme}
            initial={[
              { id: 'pinned', title: 'Pinned', mode: 'open' },
              { id: 'inbox', title: 'Inbox', mode: 'open' },
              { id: 'today', title: 'Today', mode: 'open', active: true },
            ]}
            activates
            keeps="pinned"
            labels={{ showLabel: (label) => `Return to ${label}` }}
          />
        </>
      )}
    </>
  );
});

/**
 * A dock that minimizes its least recently active panel rather than scroll the row, and logs every
 * mode it asks for, also those the application refuses.
 */
function MinimizingDock({
  name,
  theme,
  initial,
  activates = false,
  keeps,
  className = 'fixture-dock-minimizing',
  labels,
  answerDelay,
  narrowTo,
  reopensAfter,
  opensNotes = false,
}: {
  name: string;
  theme: ThemeValue;
  initial: PanelDockPanel[];
  /** Whether the application activates the panels people press or bring back. */
  activates?: boolean;
  /** A panel the application keeps open when asked to minimize it. */
  keeps?: string;
  className?: string;
  /** Labels of the tabs' buttons. */
  labels?: Pick<PanelDock.RootProps<PanelDockPanel>, 'showLabel'>;
  /** Milliseconds after which the application answers, in a transition; at once by default. */
  answerDelay?: number;
  /** A width the application's own state can narrow the region to, as a sidebar opening does. */
  narrowTo?: string;
  /** Milliseconds after which the application opens a panel it minimized when asked, itself. */
  reopensAfter?: number;
  /** The application opens a note with Alt+O, wherever focus is in the region. */
  opensNotes?: boolean;
}) {
  const [panels, setPanels] = useState(initial);
  const [log, setLog] = useState<string[]>([]);
  const [narrowed, setNarrowed] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const commits = useRef(0);
  return (
    <>
      <div
        ref={frame}
        className={`fixture-dock-frame ${className}`}
        data-testid={`${name}-dock-${theme}`}
        style={narrowed ? { inlineSize: narrowTo } : undefined}
        onKeyDown={(event) => {
          if (!opensNotes || !event.altKey || event.code !== 'KeyO') return;
          event.preventDefault();
          setPanels((current) => {
            const count = current.filter((panel) => panel.id.startsWith('note-')).length + 1;
            return [...current, { id: `note-${count}`, title: `Note ${count}`, mode: 'open' }];
          });
        }}
      >
        {/* Counts the dock's commits on its frame, without rendering anything for them. */}
        <Profiler
          id={name}
          onRender={() => frame.current?.setAttribute('data-commits', String(++commits.current))}
        >
          <PanelDock.Root
            {...labels}
            panels={panels}
            overflow="minimize"
            onModeChange={(id, mode) => {
              setLog((current) => [...current, `${id} ${mode}`]);
              if (id === keeps && mode === 'minimized') return;
              const answer = () =>
                setPanels((current) =>
                  current.map((panel) => (panel.id === id ? { ...panel, mode } : panel)),
                );
              if (answerDelay === undefined) answer();
              else setTimeout(() => startTransition(answer), answerDelay);
              if (reopensAfter === undefined || mode !== 'minimized') return;
              setTimeout(() => {
                setLog((current) => [...current, `${id} reopened`]);
                setPanels((current) =>
                  current.map((panel) => (panel.id === id ? { ...panel, mode: 'open' } : panel)),
                );
              }, reopensAfter);
            }}
            onActivate={
              activates
                ? (id) =>
                    setPanels((current) =>
                      current.map((panel) => ({ ...panel, active: panel.id === id })),
                    )
                : undefined
            }
            onClose={(id) => setPanels((current) => current.filter((panel) => panel.id !== id))}
          >
            {(panel) => (
              <>
                <PanelDock.Header title={panel.title} />
                <div className="fixture-dock-body">
                  <Textarea label={`Notes of ${panel.title}`} />
                </div>
              </>
            )}
          </PanelDock.Root>
        </Profiler>
      </div>
      {narrowTo !== undefined && (
        <button type="button" onClick={() => setNarrowed((value) => !value)}>
          Narrow {name} {theme}
        </button>
      )}
      <output data-testid={`${name}-log-${theme}`}>{log.join(',')}</output>
    </>
  );
}

/** A narrow dock whose application never activates panels: its tabs still show them. */
/** The dock's and its window controls' names from EnvUIProvider's messages, in German. */
const germanDock = {
  panelDock: {
    minimize: 'Minimieren',
    maximize: 'Maximieren',
    restore: 'Wiederherstellen',
    close: 'Schließen',
    hidden: 'Ausgeblendete Bereiche',
    show: ({ label }: { label: string }) => `${label} anzeigen`,
    closePanel: ({ label }: { label: string }) => `${label} schließen`,
    resize: ({ label }: { label: string }) => `Größe von ${label} ändern`,
  },
};

/**
 * A dock whose names come from EnvUIProvider's messages, with a panel that leaves out its window
 * controls, mounted in the panel-dock fixture.
 */
function TranslatedDock() {
  const [panels, setPanels] = useState<PanelDockPanel[]>([
    { id: 'entwurf', title: 'Entwurf', mode: 'open', active: true },
    { id: 'notizen', title: 'Notizen', mode: 'open' },
    { id: 'plan', title: 'Plan', mode: 'minimized' },
  ]);
  return (
    <EnvUIProvider messages={germanDock}>
      <div className="fixture-dock-frame" data-testid="translated-dock">
        <PanelDock.Root
          panels={panels}
          onModeChange={(id, mode) =>
            setPanels((current) =>
              current.map((panel) => (panel.id === id ? { ...panel, mode } : panel)),
            )
          }
          onClose={(id) => setPanels((current) => current.filter((panel) => panel.id !== id))}
        >
          {(panel) => (
            <PanelDock.Header
              title={panel.title}
              controls={panel.id !== 'notizen'}
              actions={<IconButton icon={<Edit />} aria-label={`${panel.title} bearbeiten`} />}
            />
          )}
        </PanelDock.Root>
      </div>
    </EnvUIProvider>
  );
}

function PassiveDock({ theme }: { theme: ThemeValue }) {
  const [panels, setPanels] = useState<PanelDockPanel[]>([
    { id: 'first', title: `First note ${theme}`, mode: 'open', active: true },
    { id: 'second', title: `Second note ${theme}`, mode: 'open' },
  ]);
  return (
    <>
      <div className="fixture-dock-frame fixture-dock-narrow" data-testid={`passive-dock-${theme}`}>
        <PanelDock.Root
          panels={panels}
          onModeChange={(id, mode) =>
            setPanels((current) =>
              current.map((panel) => (panel.id === id ? { ...panel, mode } : panel)),
            )
          }
          onClose={(id) => setPanels((current) => current.filter((panel) => panel.id !== id))}
        >
          {(panel) => (
            // A form holds the header with the fields, as the header sticks within it.
            <form onSubmit={(event) => event.preventDefault()}>
              <PanelDock.Header title={panel.title} />
              <div className="fixture-dock-body">
                <Textarea label={`Text of ${panel.title}`} />
                {Array.from({ length: 12 }, (_, index) => (
                  <Text key={index}>
                    Line {index + 1} of {panel.title}.
                  </Text>
                ))}
              </div>
            </form>
          )}
        </PanelDock.Root>
      </div>
      <div className="fixture-actions">
        <button
          type="button"
          onClick={() =>
            setPanels((current) => [
              ...current,
              { id: 'third', title: `Third note ${theme}`, mode: 'open' },
            ])
          }
        >
          Add note {theme}
        </button>
      </div>
    </>
  );
}

/**
 * A narrow dock whose application neither marks a panel active nor activates one: the newest panel
 * fills it, and a tab shows its own panel.
 */
function LooseDock({ theme }: { theme: ThemeValue }) {
  const [panels, setPanels] = useState<PanelDockPanel[]>([
    { id: 'ex', title: `Ex ${theme}`, mode: 'open' },
    { id: 'why', title: `Why ${theme}`, mode: 'open' },
  ]);
  return (
    <>
      <div className="fixture-dock-frame fixture-dock-narrow" data-testid={`loose-dock-${theme}`}>
        <PanelDock.Root
          panels={panels}
          onModeChange={(id, mode) =>
            setPanels((current) =>
              current.map((panel) => (panel.id === id ? { ...panel, mode } : panel)),
            )
          }
          onClose={(id) => setPanels((current) => current.filter((panel) => panel.id !== id))}
        >
          {(panel) => (
            <>
              <PanelDock.Header title={panel.title} />
              <div className="fixture-dock-body">
                <Textarea label={`Words of ${panel.title}`} />
              </div>
            </>
          )}
        </PanelDock.Root>
      </div>
      <div className="fixture-actions">
        <button
          type="button"
          onClick={() =>
            setPanels((current) => [
              ...current,
              {
                id: `zed-${current.length}`,
                title: `Zed ${current.length} ${theme}`,
                mode: 'open',
              },
            ])
          }
        >
          Open note {theme}
        </button>
      </div>
    </>
  );
}

/** A document's window: a draft that must survive every change of mode and order. */
function DocumentWindow({
  panel,
  theme,
  onMount,
}: {
  panel: FixturePanel;
  theme: ThemeValue;
  onMount: (change: number) => void;
}) {
  const [draft, setDraft] = useState('');
  const [tip, setTip] = useState(true);
  const chat = useRef<HTMLOListElement>(null);
  const messages = panel.messages ?? 4;
  // The chat shows its newest message, or its first once rewound.
  useLayoutEffect(() => {
    const list = chat.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);
  useLayoutEffect(() => {
    const list = chat.current;
    if (list && panel.rewinds) list.scrollTop = 0;
  }, [panel.rewinds]);
  // Counts how many times the content is mounted, so a remount shows; only mounting counts, not a
  // new callback.
  useEffect(() => {
    onMount(1);
    return () => onMount(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <PanelDock.Header
        title={panel.title}
        meta={`Edited by Alex Morgan · ${theme}`}
        actions={
          <>
            <IconButton icon={<Edit />} aria-label={`Edit ${panel.title} ${theme}`} />
            <Menu.Root
              aria-label={`${panel.title} actions ${theme}`}
              trigger={
                <IconButton
                  icon={<MoreVert />}
                  aria-label={`More actions for ${panel.title} ${theme}`}
                />
              }
            >
              <Menu.Item>Share</Menu.Item>
            </Menu.Root>
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
        <ol
          ref={chat}
          className="fixture-dock-chat"
          aria-label={`Chat about ${panel.title} ${theme}`}
        >
          {Array.from({ length: messages }, (_, index) => (
            <li key={index}>
              Message {index + 1}
              {index === 0 && (
                <>
                  {' '}
                  <button type="button">
                    Quote message 1 of {panel.title} {theme}
                  </button>
                </>
              )}
            </li>
          ))}
        </ol>
        <div
          className="fixture-dock-tags"
          role="group"
          aria-label={`Tags of ${panel.title} ${theme}`}
        >
          {['Finance', 'Quarterly', 'Regional', 'Planning'].map((tag) => (
            <button key={tag} type="button">
              {tag} tag of {panel.title} {theme}
            </button>
          ))}
        </div>
        {Array.from({ length: 12 }, (_, index) => (
          <Text key={index}>
            Paragraph {index + 1} of {panel.title}.
          </Text>
        ))}
      </div>
    </>
  );
}
