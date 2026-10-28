import { Button, IconButton, type ButtonProps, type IconButtonProps } from '@envsemble/envui';
import { Check } from '@envsemble/envui/icons/Check';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';
import { Close } from '@envsemble/envui/icons/Close';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Settings } from '@envsemble/envui/icons/Settings';

/** Every designed pair of variant and tone, with the label the state matrix shows. */
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

/** A value in words, as the catalogue names it: capitalised. */
const inWords = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** The name of a pair, as the matrix's rows show it: the variant, and the tone unless neutral. */
export const pairName = ({ variant, tone }: (typeof buttonVariants)[number]) =>
  tone === 'neutral' ? inWords(variant) : `${inWords(variant)}, ${tone}`;

export const buttonForms = [
  { value: 'label', title: 'Label' },
  { value: 'leading', title: 'Leading icon' },
  { value: 'trailing', title: 'Trailing icon' },
  { value: 'icon', title: 'Icon only' },
] as const;

export function VariantButton({
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
    return <IconButton {...({ ...props, icon, 'aria-label': example.label } as IconButtonProps)} />;
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
