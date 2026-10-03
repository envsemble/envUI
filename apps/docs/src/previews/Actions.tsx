import { useState } from 'react';
import { Text, Button, IconButton, ActionGroup } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Check } from '@envsemble/envui/icons/Check';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';
import { Close } from '@envsemble/envui/icons/Close';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Settings } from '@envsemble/envui/icons/Settings';
import { Example } from './Example';
import { Preview } from './Preview';

const buttonVariants = [
  { variant: 'primary', label: 'Continue', icon: ChevronRight },
  { variant: 'important', label: 'Confirm', icon: Check },
  { variant: 'secondary', label: 'Cancel', icon: Close },
  { variant: 'outlined', label: 'Manage', icon: Settings },
  { variant: 'destructive', label: 'Delete', icon: Delete },
] as const;
const controlStates = [
  { title: 'Default', className: 'docs-force-0', disabled: false },
  { title: 'Hover', className: 'docs-force-1', disabled: false },
  { title: 'Pressed', className: 'docs-force-2', disabled: false },
  { title: 'Keyboard focus', className: 'docs-force-3', disabled: false },
  { title: 'Disabled', className: 'docs-force-4', disabled: true },
];

function ButtonMatrix() {
  const examples = buttonVariants.flatMap((example) => [
    { ...example, iconOnly: false },
    { ...example, iconOnly: true },
  ]);
  return (
    <div className="docs-matrix-scroll" tabIndex={0} aria-label="Control state comparison">
      <table className="docs-matrix">
        <thead>
          <tr>
            <th scope="col">Variant</th>
            {controlStates.map((state) => (
              <th scope="col" key={state.title}>
                {state.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {examples.map((example) => (
            <tr key={`${example.variant}-${example.iconOnly}`}>
              <th scope="row">
                {example.variant}
                {example.iconOnly && ' icon'}
              </th>
              {controlStates.map((state) => (
                <td key={state.title}>
                  {example.iconOnly ? (
                    <Button
                      variant={example.variant}
                      iconOnly
                      className={state.className}
                      disabled={state.disabled}
                      aria-label={example.label}
                      icon={<example.icon />}
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
          <Button
            iconOnly
            icon={<Add />}
            aria-label="Create item"
            onClick={() => setActionResult('Item created')}
          />
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
    <Example title="Icon-only actions">
      <ActionGroup>
        <Button
          variant="secondary"
          iconOnly
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
