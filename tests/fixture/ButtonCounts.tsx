import { useState } from 'react';
import {
  Badge,
  Button,
  CounterBadge,
  DiffStat,
  Tabs,
  Text,
  Theme,
  type ThemeValue,
  Row,
} from '@envsemble/envui';

/** The 1.0 emphasis of each 0.7 variant, which the samples are still named by. */
const emphasis = {
  primary: { variant: 'primary' },
  secondary: { variant: 'secondary' },
  outlined: { variant: 'outline' },
  destructive: { variant: 'primary', tone: 'danger' },
  important: { variant: 'primary', tone: 'accent' },
  text: { variant: 'text' },
} as const;
const variants = ['primary', 'secondary', 'outlined', 'text', 'important'] as const;

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
      <Row wrap align="center" gap={4}>
        {variants.map((variant) => (
          <Button key={variant} {...emphasis[variant]}>
            {variant} <CounterBadge value={7} /> <Badge tone="success">New</Badge>{' '}
            <DiffStat additions={3} deletions={1} />
          </Button>
        ))}
      </Row>
      <DiffStat additions={12} deletions={3} data-testid={`diff-stat-${theme}`} />
    </Theme>
  );
}
