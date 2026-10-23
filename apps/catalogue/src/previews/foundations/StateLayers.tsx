import type { ReactNode } from 'react';
import { Button, Drawer, List, Text, TextField } from '@envsemble/envui';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Example } from '../Example';

const states = [
  { title: 'Rest', className: 'docs-force-default' },
  { title: 'Hover', className: 'docs-force-hover' },
  { title: 'Pressed', className: 'docs-force-pressed' },
] as const;

type ForcedState = (typeof states)[number]['className'];

/** Each sample, drawn in a forced state: the class goes on the control or around it. */
const samples: readonly { name: string; render: (state: ForcedState) => ReactNode }[] = [
  {
    name: 'Primary button',
    render: (state) => (
      <Button variant="primary" className={state} inert>
        Save
      </Button>
    ),
  },
  {
    name: 'Secondary button',
    render: (state) => (
      <Button variant="secondary" className={state} inert>
        Cancel
      </Button>
    ),
  },
  {
    name: 'Outline button',
    render: (state) => (
      <Button variant="outline" className={state} inert>
        Manage
      </Button>
    ),
  },
  {
    name: 'Ghost button',
    render: (state) => (
      <Button variant="ghost" className={state} inert>
        Settings
      </Button>
    ),
  },
  {
    name: 'List row',
    render: (state) => (
      <List.Root className={state} inert>
        <List.Item
          interactive
          label={
            <a href="#quarterly-report" data-row-target>
              Quarterly report
            </a>
          }
        />
      </List.Root>
    ),
  },
  {
    name: 'Navigation item',
    render: (state) => (
      <div className={state} inert>
        <Drawer
          aria-label={`Navigation, ${state}`}
          destinations={[{ label: 'Inbox', icon: <Inbox />, onSelect: () => {} }]}
        />
      </div>
    ),
  },
  {
    name: 'Field',
    render: (state) => (
      <div className={state} inert>
        <TextField label="Project name" defaultValue="Roadmap" />
      </div>
    ),
  },
];

/**
 * Hover and press of buttons, list rows, navigation items and fields, each forced into its state,
 * so the state layers can be compared with each other and across themes.
 */
export function StateLayers() {
  return (
    <Example title="Interaction states" size="wide">
      <Text emphasis="muted">
        Hover and press take tokens of their own, in every theme. A component given colors of its
        own through its color properties lays its content color over its container instead, as
        Material draws state layers, so it keeps its states.
      </Text>
      <div
        className="docs-matrix-scroll docs-state-layers"
        tabIndex={0}
        role="region"
        aria-label="Interaction states"
      >
        <table className="docs-matrix">
          <thead>
            <tr>
              <th scope="col">Component</th>
              {states.map((state) => (
                <th scope="col" key={state.title}>
                  {state.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {samples.map((sample) => (
              <tr key={sample.name}>
                <th scope="row">{sample.name}</th>
                {states.map((state) => (
                  <td key={state.title}>{sample.render(state.className)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Example>
  );
}
