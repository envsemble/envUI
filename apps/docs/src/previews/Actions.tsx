import { Button } from '@envsemble/envui';
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
const buttonForms = [
  { value: 'label', title: 'Label' },
  { value: 'leading', title: 'Leading icon' },
  { value: 'trailing', title: 'Trailing icon' },
  { value: 'icon', title: 'Icon only' },
] as const;
const controlStates = [
  { title: 'Default', className: 'docs-force-0', disabled: false },
  { title: 'Hover', className: 'docs-force-1', disabled: false },
  { title: 'Pressed', className: 'docs-force-2', disabled: false },
  { title: 'Keyboard focus', className: 'docs-force-3', disabled: false },
  { title: 'Disabled', className: 'docs-force-4', disabled: true },
];

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
  return (
    <Preview>
      <Example title="Variants" size="wide">
        <ButtonVariants />
      </Example>
      <Example size="wide">
        <details className="docs-button-states">
          <summary>Interaction states</summary>
          <ButtonStates />
        </details>
      </Example>
    </Preview>
  );
}
