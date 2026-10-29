import type { ComponentPropsWithRef } from 'react';
import { SpinnerArc } from './internal/SpinnerArc.js';
import { SpinnerLabel } from './internal/SpinnerLabel.js';

export interface SpinnerProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /**
   * The work it stands for, such as Refreshing members or Loading project. Alone it names the
   * spinner as a progress bar for assistive technology; with showLabel it shows beside it. Leave
   * it out where a busy control or region already says so; the spinner is then hidden from
   * assistive technology.
   */
  label?: string;
  /**
   * Show the label beside the spinner, for loading with no known shape, such as search results:
   * a status line, marked busy, that centers the spinner and its label in its row. Without a label
   * it says Loading in the provider's language, from EnvUIProvider's messages.common.loading.
   * @default false
   */
  showLabel?: boolean;
  /**
   * sm, 1 rem, inside controls and beside a line of text; md, 1.5 rem, beside a heading or in a
   * panel; or lg, 3 rem, in the middle of a region whose content is on its way.
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Work of unknown length in a small area, such as a panel that is updating: an arc in the control
 * blue that turns, and keeps turning slowly with a reduced-motion preference. With a label it is a
 * progress bar named by it; without one it is hidden from assistive technology. With showLabel it
 * is a status line with its label beside it, for loading with no known shape. The hook
 * --env-spinner-color recolors it, such as to a button's label color.
 */
export function Spinner({
  label,
  showLabel = false,
  size = 'md',
  className,
  ...props
}: SpinnerProps) {
  if (showLabel)
    return (
      // A status region marked busy, which the label names as it shows.
      <SpinnerArc
        {...props}
        size={size}
        role="status"
        aria-busy="true"
        className={className}
        data-show-label=""
      >
        <SpinnerLabel label={label} />
      </SpinnerArc>
    );
  return (
    <SpinnerArc
      {...props}
      size={size}
      role={label ? 'progressbar' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
    />
  );
}
