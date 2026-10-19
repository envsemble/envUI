import { Button, type ButtonProps } from '@envsemble/envui';
import { Example } from '../../previews/Example';
import { Check } from '@envsemble/envui/icons/Check';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';
import { Close } from '@envsemble/envui/icons/Close';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Settings } from '@envsemble/envui/icons/Settings';

/**
 * Every designed pair of variant and tone, with the label each matrix shows; shared by the variant
 * and state matrices.
 */
export const buttonVariants = [
  { variant: 'primary', tone: 'neutral', label: 'Continue', icon: ChevronRight },
  { variant: 'primary', tone: 'accent', label: 'Confirm', icon: Check },
  { variant: 'primary', tone: 'danger', label: 'Delete', icon: Delete },
  { variant: 'secondary', tone: 'neutral', label: 'Cancel', icon: Close },
  { variant: 'outline', tone: 'neutral', label: 'Manage', icon: Settings },
  { variant: 'outline', tone: 'danger', label: 'Remove', icon: Delete },
  { variant: 'ghost', tone: 'neutral', label: 'Settings', icon: Settings },
  { variant: 'ghost', tone: 'danger', label: 'Discard', icon: Delete },
  { variant: 'text', tone: 'neutral', label: 'Learn more', icon: ChevronRight },
  { variant: 'text', tone: 'danger', label: 'Leave', icon: Close },
] as const;

/** The name of a pair, as the matrices' rows show it: the variant, and the tone unless neutral. */
export const pairName = ({ variant, tone }: (typeof buttonVariants)[number]) =>
  tone === 'neutral' ? variant : `${variant} · ${tone}`;

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
  const props = { variant: example.variant, tone: example.tone, className, disabled, inert };
  if (form === 'icon') {
    return (
      <Button
        {...({ ...props, iconOnly: true, icon, 'aria-label': example.label } as ButtonProps)}
      />
    );
  }
  return (
    <Button
      {...({
        ...props,
        startIcon: form === 'leading' ? icon : undefined,
        endIcon: form === 'trailing' ? icon : undefined,
        children: example.label,
      } as ButtonProps)}
    />
  );
}

/** Every variant in every form: label only, with a leading or trailing icon, and icon only. */
export default function VariantMatrix() {
  return (
    <Example
      title="Variants"
      size="wide"
      caption="Use one primary action per group. Reserve the accent tone for rare, consequential actions."
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
              <tr key={pairName(example)}>
                <th scope="row">{pairName(example)}</th>
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
