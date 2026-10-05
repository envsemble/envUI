import { useState } from 'react';
import { ActionGroup, Button, ButtonGroup, DisclosureNote, Link, Text } from '@envsemble/envui';
import { Check } from '@envsemble/envui/icons/Check';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';
import { Close } from '@envsemble/envui/icons/Close';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Settings } from '@envsemble/envui/icons/Settings';
import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';
import { controlStates } from './InteractionStates';

const buttonVariants = [
  { variant: 'primary', label: 'Continue', icon: ChevronRight },
  { variant: 'important', label: 'Confirm', icon: Check },
  { variant: 'secondary', label: 'Cancel', icon: Close },
  { variant: 'outlined', label: 'Manage', icon: Settings },
  { variant: 'destructive', label: 'Delete', icon: Delete },
  { variant: 'text', label: 'Learn more', icon: ChevronRight },
] as const;
const buttonForms = [
  { value: 'label', title: 'Label' },
  { value: 'leading', title: 'Leading icon' },
  { value: 'trailing', title: 'Trailing icon' },
  { value: 'icon', title: 'Icon only' },
] as const;

function ButtonSample({
  example,
  form,
  className,
  disabled,
  inert,
}: {
  example: (typeof buttonVariants)[number];
  form: (typeof buttonForms)[number]['value'];
  className?: string;
  disabled?: boolean;
  inert?: boolean;
}) {
  const icon = <example.icon />;
  const props = { variant: example.variant, className, disabled, inert };
  if (form === 'icon') {
    return <Button {...props} iconOnly icon={icon} aria-label={example.label} />;
  }
  return (
    <Button
      {...props}
      startIcon={form === 'leading' ? icon : undefined}
      endIcon={form === 'trailing' ? icon : undefined}
    >
      {example.label}
    </Button>
  );
}

function ButtonVariants() {
  return (
    <div
      className="docs-matrix-scroll"
      tabIndex={0}
      role="region"
      aria-label="Button variants and icon placement"
    >
      <table className="docs-matrix">
        <thead>
          <tr>
            <th scope="col">Variant</th>
            {buttonForms.map((form) => (
              <th scope="col" key={form.value}>
                {form.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {buttonVariants.map((example) => (
            <tr key={example.variant}>
              <th scope="row">{example.variant}</th>
              {buttonForms.map((form) => (
                <td key={form.value}>
                  <ButtonSample example={example} form={form.value} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ButtonStates() {
  return (
    <div
      className="docs-matrix-scroll"
      tabIndex={0}
      role="region"
      aria-label="Button interaction states"
    >
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
          {buttonVariants.map((example) => (
            <tr key={example.variant}>
              <th scope="row">{example.variant}</th>
              {controlStates.map((state) => (
                <td key={state.title}>
                  <ButtonSample
                    example={example}
                    form="label"
                    className={state.className}
                    disabled={state.disabled}
                    inert
                  />
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
  const [selectedLink, setSelectedLink] = useState('');
  return (
    <Preview>
      <Example
        title="Variants"
        size="wide"
        caption="Use one primary action per group. Reserve Important for rare, consequential actions."
      >
        <ButtonVariants />
      </Example>
      <Example title="Text buttons">
        <Button variant="text">Without underline</Button>
        <Button variant="text" underline>
          With underline
        </Button>
      </Example>
      <Example title="Links" caption="Use href for a destination and onClick for an action.">
        <ActionGroup>
          <Button href={location.href} onClick={() => setSelectedLink('Projects')}>
            Open projects
          </Button>
          <Button variant="text" href={location.href} onClick={() => setSelectedLink('Help')}>
            Read help
          </Button>
          <Button
            variant="text"
            underline
            href={location.href}
            onClick={() => setSelectedLink('Guide')}
          >
            Read guide
          </Button>
        </ActionGroup>
        <Text>
          Read the{' '}
          <Link href={location.href} onClick={() => setSelectedLink('Project guide')}>
            project guide
          </Link>{' '}
          for details.
        </Text>
        <Text variant="caption" role="status">
          {selectedLink && `Selected destination: ${selectedLink}`}
        </Text>
      </Example>
      <Example
        title="Connected rows"
        size="collection"
        caption="Use the same button style for related actions."
      >
        <SpecimenGrid size="compact">
          <Specimen title="Text only">
            <ButtonGroup aria-label="Project actions">
              <Button>Open</Button>
              <Button>Edit</Button>
              <Button>Share</Button>
            </ButtonGroup>
          </Specimen>
          <Specimen title="With icons">
            <ButtonGroup aria-label="Outlined row actions">
              <Button variant="outlined" startIcon={<Settings />}>
                Settings
              </Button>
              <Button variant="outlined" startIcon={<ChevronRight />}>
                Open
              </Button>
              <Button variant="outlined" startIcon={<Close />}>
                Close
              </Button>
            </ButtonGroup>
          </Specimen>
          <Specimen title="Important">
            <ButtonGroup aria-label="Important row actions">
              <Button variant="important">Apply</Button>
              <Button variant="important">Confirm</Button>
              <Button variant="important">Finish</Button>
            </ButtonGroup>
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example
        title="Connected columns"
        size="collection"
        caption="Columns share a width and keep each end button’s outer corners."
      >
        <SpecimenGrid size="compact">
          <Specimen title="Text only">
            <ButtonGroup orientation="vertical" aria-label="Item actions">
              <Button variant="secondary">Open</Button>
              <Button variant="secondary">Edit</Button>
              <Button variant="secondary">Share</Button>
            </ButtonGroup>
          </Specimen>
          <Specimen title="With icons">
            <ButtonGroup orientation="vertical" aria-label="Outlined column actions">
              <Button variant="outlined" startIcon={<Settings />}>
                Settings
              </Button>
              <Button variant="outlined" startIcon={<ChevronRight />}>
                Open
              </Button>
              <Button variant="outlined" startIcon={<Close />}>
                Close
              </Button>
            </ButtonGroup>
          </Specimen>
          <Specimen title="Icon only">
            <ButtonGroup orientation="vertical" aria-label="Quick actions">
              <Button variant="secondary" iconOnly icon={<Settings />} aria-label="Settings" />
              <Button variant="secondary" iconOnly icon={<Check />} aria-label="Confirm" />
              <Button variant="secondary" iconOnly icon={<Close />} aria-label="Close" />
            </ButtonGroup>
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example title="Mixed styles" caption="Different button styles can also share one group.">
        <ButtonGroup aria-label="Mixed actions">
          <Button startIcon={<ChevronRight />}>Continue</Button>
          <Button variant="outlined">Manage</Button>
          <Button variant="secondary" iconOnly icon={<Settings />} aria-label="Settings" />
          <Button variant="important" endIcon={<Check />}>
            Confirm
          </Button>
        </ButtonGroup>
      </Example>
      <Example size="wide">
        <DisclosureNote title="Interaction states">
          <ButtonStates />
        </DisclosureNote>
      </Example>
    </Preview>
  );
}
