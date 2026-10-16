import { Button } from '@envsemble/envui';
import { Example } from '../../previews/Example';
import { Check } from '@envsemble/envui/icons/Check';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';
import { Close } from '@envsemble/envui/icons/Close';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Settings } from '@envsemble/envui/icons/Settings';

/** Every variant, with the label each matrix shows; shared by the variant and state matrices. */
export const buttonVariants = [
  { variant: 'primary', label: 'Continue', icon: ChevronRight },
  { variant: 'important', label: 'Confirm', icon: Check },
  { variant: 'secondary', label: 'Cancel', icon: Close },
  { variant: 'outlined', label: 'Manage', icon: Settings },
  { variant: 'destructive', label: 'Delete', icon: Delete },
  { variant: 'text', label: 'Learn more', icon: ChevronRight },
  { variant: 'quiet', label: 'Settings', icon: Settings },
] as const;
export const buttonForms = [
  { value: 'label', title: 'Label' },
  { value: 'leading', title: 'Leading icon' },
  { value: 'trailing', title: 'Trailing icon' },
  { value: 'icon', title: 'Icon only' },
] as const;

export function ButtonSample({
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

/** Every variant in every form: label only, with a leading or trailing icon, and icon only. */
export default function VariantMatrix() {
  return (
    <Example
      title="Variants"
      size="wide"
      caption="Use one primary action per group. Reserve Important for rare, consequential actions."
    >
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
    </Example>
  );
}
