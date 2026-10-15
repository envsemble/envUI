import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';

export interface ColorSwatchProps
  extends Omit<ComponentPropsWithRef<'span'>, 'children' | 'color'> {
  /** The color it shows, such as #6750a4. */
  color: string;
}

/**
 * A round sample of a color with a hairline ring, so light and dark colors stay visible on every
 * surface. It is decorative: name the color in the text beside it. As a Button's icon it takes the
 * icon's size, such as on a button that opens a ColorPicker.
 */
export function ColorSwatch({ color, className, style, ...props }: ColorSwatchProps) {
  return (
    <span
      aria-hidden="true"
      {...props}
      className={classNames('env-color-swatch', className)}
      style={{ ...style, backgroundColor: color }}
    />
  );
}
