import { useState } from 'react';
import {
  ActionGroup,
  Badge,
  Button,
  Counter,
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
                Submissions <Counter value={24} tone="accent" />
              </Button>
            ),
            content: <Text>Submissions</Text>,
          },
          {
            value: 'drafts',
            button: (
              <Button>
                Drafts <Counter value={3} />
              </Button>
            ),
            content: <Text>Drafts</Text>,
          },
        ]}
      />
      <ActionGroup>
        {variants.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant} <Counter value={7} /> <Badge tone="success">New</Badge>
          </Button>
        ))}
      </ActionGroup>
    </Theme>
  );
}
