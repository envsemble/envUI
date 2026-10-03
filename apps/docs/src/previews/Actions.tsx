import { useState } from 'react';
import { Text, Button, IconButton, ActionGroup } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';
import { Settings } from '@envsemble/envui/icons/Settings';
import { Example } from './Example';
import { Preview } from './Preview';

const buttonVariants = [
  { variant: 'primary', label: 'Continue' },
  { variant: 'important', label: 'Confirm' },
  { variant: 'secondary', label: 'Cancel' },
  { variant: 'outlined', label: 'Manage' },
  { variant: 'destructive', label: 'Delete' },
] as const;
const controlStates = [
  { title: 'Default', className: 'docs-force-0', disabled: false },
  { title: 'Hover', className: 'docs-force-1', disabled: false },
  { title: 'Pressed', className: 'docs-force-2', disabled: false },
  { title: 'Keyboard focus', className: 'docs-force-3', disabled: false },
  { title: 'Disabled', className: 'docs-force-4', disabled: true },
];

function ButtonMatrix() {
  const examples = [...buttonVariants, { variant: 'icon', label: 'Icon button' } as const];
  return (
    <div className="docs-matrix-scroll" tabIndex={0} aria-label="Control state comparison">
      <table className="docs-matrix">
        <thead>
          <tr>
            <th>Variant</th>
            {controlStates.map((state) => (
              <th key={state.title}>{state.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {examples.map((example) => (
            <tr key={example.variant}>
              <th>{example.variant === 'icon' ? example.label : example.variant}</th>
              {controlStates.map((state) => (
                <td key={state.title}>
                  {example.variant === 'icon' ? (
                    <IconButton
                      className={state.className}
                      disabled={state.disabled}
                      aria-label="Next item"
                      icon={<ChevronRight />}
                    />
                  ) : (
                    <Button
                      variant={example.variant}
                      className={state.className}
                      disabled={state.disabled}
                    >
                      {example.label}
                    </Button>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ButtonsPreview() {
  const [actionResult, setActionResult] = useState('');
  const [destinationResult, setDestinationResult] = useState('');
  return (
    <Preview>
      <Example title="Variants & states" size="wide">
        <ButtonMatrix />
      </Example>
      <Example title="Labels & icons">
        <ActionGroup>
          <Button onClick={() => setActionResult('Item created')}>Create item</Button>
          <Button startIcon={<Add />} onClick={() => setActionResult('Item created')}>
            Create item
          </Button>
          <Button endIcon={<ChevronRight />}>Continue</Button>
        </ActionGroup>
      </Example>
      <Example title="Destinations">
        <ActionGroup>
          <Button
            href={location.href}
            variant="outlined"
            onClick={() => setDestinationResult('Project link selected.')}
          >
            Open project
          </Button>
          <Button href={location.href} variant="outlined" disabled>
            Unavailable destination
          </Button>
        </ActionGroup>
        <Text variant="caption" aria-live="polite">
          {destinationResult}
        </Text>
      </Example>
      <Example title="Grouped actions">
        <ActionGroup>
          <Button variant="secondary" onClick={() => setActionResult('Cancelled')}>
            Cancel
          </Button>
          <Button onClick={() => setActionResult('Changes saved')}>Save changes</Button>
        </ActionGroup>
        <ActionGroup stacked className="docs-narrow-actions">
          <Button onClick={() => setActionResult('Changes saved')}>Save changes</Button>
          <Button variant="secondary">Cancel</Button>
        </ActionGroup>
        <Text variant="caption" className="docs-caption" aria-live="polite">
          {actionResult || 'One primary action per group'}
        </Text>
      </Example>
      <IconButtonExamples />
    </Preview>
  );
}

function IconButtonExamples() {
  const [actionResult, setActionResult] = useState('');
  return (
    <Example title="Icon buttons" caption="2.5 rem circle, neutral fill and a named action.">
      <ActionGroup>
        <IconButton
          icon={<ChevronRight />}
          aria-label="Next item"
          onClick={() => setActionResult('Moved to next item')}
        />
        <IconButton icon={<Settings />} aria-label="Settings" />
      </ActionGroup>
      <Text variant="caption" className="docs-caption" aria-live="polite">
        {actionResult}
      </Text>
    </Example>
  );
}
