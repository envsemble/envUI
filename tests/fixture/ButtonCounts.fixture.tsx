import { useState } from 'react';
import {
  AnimatedNumber,
  Badge,
  Button,
  DiffStat,
  Tabs,
  Text,
  Theme,
  type ColorScheme,
  Row,
} from '@envsemble/envui';

export const themes = true;

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

/** Counts, badges and numbers inside buttons and tabs, mounted with ?fixture=button-counts. */
export default function ButtonCountsFixture({ theme }: { theme: ColorScheme }) {
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
                Submissions <Badge count={24} tone="primary" variant="solid" />
              </Button>
            ),
            content: <Text>Submissions</Text>,
          },
          {
            value: 'drafts',
            button: (
              <Button>
                Drafts <Badge count={3} />
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
            {variant} <Badge count={7} /> <Badge tone="success">New</Badge>{' '}
            <DiffStat additions={3} deletions={1} />
          </Button>
        ))}
      </Row>
      {/* A number within the label's words. */}
      <Button data-testid={`show-tasks-${theme}`}>
        Show <AnimatedNumber value={33} /> tasks
      </Button>
      <DiffStat additions={12} deletions={3} data-testid={`diff-stat-${theme}`} />
      {/* A text button alone in a box as wide as its content, as a list row's name. */}
      <Row>
        <div>
          <Button variant="text" data-testid={`text-alone-${theme}`}>
            Alex Morgan
          </Button>
        </div>
      </Row>
    </Theme>
  );
}
