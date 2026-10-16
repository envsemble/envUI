import { useState } from 'react';
import {
  Button,
  CounterBadge,
  DocumentTabs,
  NavList,
  Surface,
  Tabs,
  Text,
  Theme,
  type DocumentTab,
  type ThemeValue,
} from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';

const initialTabs: DocumentTab[] = [
  { id: 'plans/roadmap.md', label: 'Roadmap.md' },
  { id: 'plans/decisions.md', label: 'Decisions.md' },
  { id: 'plans/retrospective.md', label: 'Retrospective.md', preview: true },
  ...Array.from({ length: 7 }, (_, index) => ({
    id: `notes/note-${index + 1}.md`,
    label: `A rather long note title number ${index + 1}.md`,
  })),
].map((tab) => ({ ...tab, icon: <Description />, title: tab.id }));

export function DocumentTabsFixture({ theme }: { theme: ThemeValue }) {
  const [tabs, setTabs] = useState(initialTabs);
  const [value, setValue] = useState<string | null>('plans/roadmap.md');
  const [log, setLog] = useState<string[]>([]);
  const record = (entry: string) => setLog((current) => [...current.slice(-4), entry]);
  const close = (id: string) => {
    const index = tabs.findIndex((tab) => tab.id === id);
    const remaining = tabs.filter((tab) => tab.id !== id);
    setTabs(remaining);
    if (id === value) setValue(remaining[Math.min(index, remaining.length - 1)]?.id ?? null);
    record(`close ${id}`);
  };
  return (
    <Theme
      theme={theme}
      data-testid={`document-tabs-${theme}`}
      className="fixture-section"
      onKeyDown={(event) => {
        // The application's own close shortcut, like Ctrl+W in a desktop app.
        if (event.altKey && event.code === 'KeyW' && value) {
          event.preventDefault();
          close(value);
        }
      }}
    >
      <div className="fixture-tabs-frame">
        <DocumentTabs
          aria-label={`Open documents ${theme}`}
          items={tabs}
          value={value}
          panelId={`document-panel-${theme}`}
          onValueChange={(id) => {
            setValue(id);
            record(`select ${id}`);
          }}
          onClose={close}
          onPin={(id) => {
            setTabs((current) =>
              current.map((tab) => (tab.id === id ? { ...tab, preview: false } : tab)),
            );
            record(`pin ${id}`);
          }}
          // The dark strip leaves onCloseAll out, so it keeps the browser's own context menu.
          onCloseAll={
            theme === 'light'
              ? () => {
                  setTabs([]);
                  setValue(null);
                  record('close all');
                }
              : undefined
          }
        />
        <div id={`document-panel-${theme}`} role="tabpanel" className="fixture-tab-panel">
          {value}
        </div>
      </div>
      <button type="button" onClick={() => setValue('notes/note-7.md')}>
        Activate the last note
      </button>
      <output data-testid={`document-tabs-log-${theme}`}>{log.join('\n')}</output>
    </Theme>
  );
}

const fillViews = ['Canvas', 'Outline', 'History'];

/**
 * Filling Tabs that keep their inactive panels mounted: one with a nested Tabs in its first panel,
 * and a vertical one whose list sits beside a heading through renderList.
 */
export function FillTabsFixture({ theme }: { theme: ThemeValue }) {
  const items = (nested: boolean) =>
    fillViews.map((view, index) => ({
      value: view.toLowerCase(),
      button: <Button>{view}</Button>,
      content:
        nested && index === 0 ? (
          <Tabs
            aria-label={`Canvas layers ${theme}`}
            keepMounted
            items={['Shapes', 'Notes'].map((layer) => ({
              value: layer.toLowerCase(),
              button: <Button>{layer}</Button>,
              content: <Text>{layer}</Text>,
            }))}
          />
        ) : (
          <Text>{view}</Text>
        ),
    }));
  return (
    <Theme theme={theme} data-testid={`fill-tabs-${theme}`} className="fixture-section">
      <div className="fixture-fill-frame">
        <Tabs
          aria-label={`Filling views ${theme}`}
          fill
          keepMounted
          className="fixture-fill-tabs"
          items={items(true)}
        />
      </div>
      <div className="fixture-fill-frame">
        <Tabs
          aria-label={`Vertical filling views ${theme}`}
          fill
          keepMounted
          orientation="vertical"
          className="fixture-fill-tabs"
          renderList={(list) => (
            <div className="fixture-tabs-heading">
              <Text as="h3" variant="section-heading">
                Views
              </Text>
              {list}
            </div>
          )}
          items={items(false)}
        />
      </div>
    </Theme>
  );
}

const tabStateVariants = ['primary', 'secondary', 'outlined', 'important', 'navigation'] as const;

/**
 * Tabs built from each kind of button used as a tab, in both scales on the canvas: the first tab is
 * selected and the second is not.
 */
export function TabStatesFixture({ theme }: { theme: ThemeValue }) {
  return (
    <Theme theme={theme} data-testid={`tab-states-${theme}`} className="fixture-section">
      {(['comfortable', 'compact'] as const).map((scale) => (
        <Theme key={scale} theme={theme} scale={scale} className="fixture-tab-states">
          {tabStateVariants.map((variant) => (
            <Tabs
              key={variant}
              aria-label={`${variant} tabs, ${scale} ${theme}`}
              items={['Summary', 'Details'].map((label) => ({
                value: label.toLowerCase(),
                button:
                  variant === 'navigation' ? (
                    <NavList.Item>{label}</NavList.Item>
                  ) : (
                    <Button variant={variant}>{label}</Button>
                  ),
                content: null,
              }))}
            />
          ))}
        </Theme>
      ))}
    </Theme>
  );
}

/** Compact tabs with a counter in a compact bar, mounted with ?fixture=compact-tabs. */
export function CompactTabsFixture({ theme }: { theme: ThemeValue }) {
  return (
    <Theme theme={theme} data-testid={`compact-tabs-${theme}`} className="fixture-section">
      <Surface
        tone="canvas"
        padding={0}
        className="fixture-actions"
        style={{ alignItems: 'center' }}
      >
        <Button size="sm" data-testid={`compact-control-${theme}`}>
          Compact control
        </Button>
        <Tabs
          size="sm"
          aria-label={`Form sections ${theme}`}
          items={[
            {
              value: 'submissions',
              button: (
                <Button variant="secondary">
                  Submissions <CounterBadge value={24} />
                </Button>
              ),
              content: null,
            },
            { value: 'editor', button: <Button variant="secondary">Editor</Button>, content: null },
          ]}
        />
      </Surface>
    </Theme>
  );
}
