import { useState } from 'react';
import {
  AppShell,
  Avatar,
  Card,
  DocumentTabs,
  IconButton,
  PanelDock,
  SearchField,
  Sidebar,
  SidebarTrigger,
  Text,
  Tree,
  useSidebar,
  type DocumentTab,
  type PanelDockMode,
  type PanelDockPanel,
  type TreeItem,
} from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Description } from '@envsemble/envui/icons/Description';
import { Folder } from '@envsemble/envui/icons/Folder';
import { Share } from '@envsemble/envui/icons/Share';
import './Frame.css';

const projects = ['Launch plan', 'Hiring', 'Office move'];

/** The project cards: a card each in the expanded sidebar, an avatar each in its rail. */
function ProjectCards() {
  const { isRail } = useSidebar();
  if (isRail)
    return (
      <div className="fixture-frame-avatars" data-testid="project-avatars">
        {projects.map((name) => (
          <Avatar key={name} name={name} size="sm" />
        ))}
      </div>
    );
  return (
    <div className="fixture-frame-cards" data-testid="project-cards">
      {projects.map((name) => (
        <Card key={name} heading={name} headingLevel={3} padding={3}>
          <Text variant="body-sm">3 open documents</Text>
        </Card>
      ))}
    </div>
  );
}

/** A tree of documents that fills the rest of the sidebar. */
function Documents() {
  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState<string | null>('brief');
  const items: TreeItem[] = [
    { id: 'plans', depth: 0, label: 'Plans', icon: <Folder />, expandable: true, expanded },
    ...(expanded
      ? [
          { id: 'brief', depth: 1, label: 'Brief', icon: <Description /> },
          { id: 'timeline', depth: 1, label: 'Timeline', icon: <Description /> },
        ]
      : []),
    ...Array.from({ length: 30 }, (_, index) => ({
      id: `note-${index}`,
      depth: 0,
      label: `Note ${index + 1}`,
      icon: <Description />,
    })),
  ];
  return (
    <Tree
      aria-label="Documents"
      items={items}
      value={selected}
      onAction={(item) => setSelected(item.id)}
      onExpandedChange={(_, open) => setExpanded(open)}
    />
  );
}

const firstTabs: DocumentTab[] = [
  { id: 'brief', label: 'Brief' },
  { id: 'timeline', label: 'Timeline' },
];

/**
 * A planning window that draws its own title bar, mounted with ?fixture=frame-title-bar: the
 * header is the window's title bar across the window, a resizable sidebar holds a stretched search
 * strip, project cards and a tree that fills the rest, and Main holds document tabs and a
 * PanelDock. The sidebar's content adapts to its rail through useSidebar().isRail.
 */
export function TitleBarFrameFixture() {
  const [tabs, setTabs] = useState(firstTabs);
  const [tab, setTab] = useState<string | null>('brief');
  const [panels, setPanels] = useState<PanelDockPanel[]>([
    { id: 'chat', title: 'Assistant', mode: 'open', active: true, height: 220 },
  ]);
  return (
    <AppShell.Root titleBar headerSpan="full" persist="frame-title-bar" className="fixture-frame">
      <AppShell.Header
        start={<SidebarTrigger />}
        end={<IconButton icon={<Share />} aria-label="Share" data-testid="share" />}
      >
        Launch plan
      </AppShell.Header>
      <Sidebar.Root label="Projects" resizable>
        <Sidebar.Content align="stretch">
          <div className="fixture-frame-strip" data-testid="search-strip">
            <SearchField label="Find projects" />
            <IconButton icon={<Add />} aria-label="New project" variant="ghost" />
          </div>
          <ProjectCards />
        </Sidebar.Content>
        <Sidebar.Content fill align="stretch">
          <Documents />
        </Sidebar.Content>
      </Sidebar.Root>
      <AppShell.Main className="fixture-frame-main">
        <DocumentTabs
          aria-label="Open documents"
          items={tabs}
          value={tab}
          onValueChange={setTab}
          onClose={(id) => setTabs((current) => current.filter((each) => each.id !== id))}
        />
        <div className="fixture-frame-filler">
          <Text>The {tab} document.</Text>
        </div>
        <PanelDock.Root
          panels={panels}
          onModeChange={(id, mode: PanelDockMode) =>
            setPanels((current) =>
              current.map((panel) => (panel.id === id ? { ...panel, mode } : panel)),
            )
          }
          onClose={(id) => setPanels((current) => current.filter((panel) => panel.id !== id))}
        >
          {(panel) => (
            <>
              <PanelDock.Header title={panel.title} />
              <Text>Ask about the plan.</Text>
            </>
          )}
        </PanelDock.Root>
      </AppShell.Main>
    </AppShell.Root>
  );
}
