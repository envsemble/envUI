import { useState } from 'react';
import {
  ActionGroup,
  Badge,
  Button,
  CounterBadge,
  DiffStat,
  Tabs,
  Text,
  Theme,
  type ButtonVariant,
  type ThemeValue,
} from '@envsemble/envui';

const variants: ButtonVariant[] = ['primary', 'secondary', 'outlined', 'text', 'important'];

/** Counts and badges inside buttons and tabs, mounted with ?fixture=button-counts. */
export function ButtonCountsFixture({ theme }: { theme: ThemeValue }) {
  const [tab, setTab] = useState('submissions');
  const [view, setView] = useState('editor');
  return (
    <Theme theme={theme} data-testid={`button-counts-${theme}`} className="fixture-section">
      <Tabs
        aria-label={`Form views ${theme}`}
        value={tab}
        onValueChange={(next) => setTab(next ?? 'submissions')}
        items={[
          {
            value: 'submissions',
            button: (
              <Button>
                Submissions <CounterBadge value={24} tone="accent" />
              </Button>
            ),
            content: <Text>Submissions</Text>,
          },
          {
            value: 'drafts',
            button: (
              <Button>
                Drafts <CounterBadge value={3} />
              </Button>
            ),
            content: <Text>Drafts</Text>,
          },
        ]}
      />
      <Tabs
        aria-label={`Editor views ${theme}`}
        value={view}
        onValueChange={(next) => setView(next ?? 'editor')}
        items={[
          {
            value: 'editor',
            button: <Button variant="secondary">Editor</Button>,
            content: <Text>Editor</Text>,
          },
          {
            value: 'diffs',
            button: (
              <Button variant="secondary">
                Diffs <DiffStat additions={124} deletions={37} />
              </Button>
            ),
            content: <Text>Diffs</Text>,
          },
        ]}
      />
      <ActionGroup>
        {variants.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant} <CounterBadge value={7} /> <Badge tone="success">New</Badge>{' '}
            <DiffStat additions={3} deletions={1} />
          </Button>
        ))}
      </ActionGroup>
      <DiffStat additions={12} deletions={3} data-testid={`diff-stat-${theme}`} />
    </Theme>
  );
}
