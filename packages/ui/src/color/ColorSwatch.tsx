'use client';

import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import { useColorSwatch } from '@react-aria/color';
import { classNames } from '../internal/classNames.js';
import { ColorLocale, displayColor } from './internal/ColorLocale.js';
import { toColor, type ColorFormat, type ColorValue } from './internal/colorValue.js';
import '../styles/Base.css';
import '../styles/ColorSwatch.css';

export interface ColorSwatchProps
  extends Omit<ComponentPropsWithRef<'span'>, 'children' | 'color'> {
  /**
   * The color it shows: a CSS color string, such as #6750a4, rgb(103, 80, 164) or
   * hsl(256, 34%, 48%), with an optional alpha, or React Aria's Color.
   */
  color: ColorValue;
  /**
   * Writes the color beside the sample in this format: hex, such as #6750A4, rgb or hsl. Without it
   * and a label, the sample stands alone, named by the color's description, such as dark purple.
   */
  format?: ColorFormat;
  /** A name beside the sample, before the value, such as the label the color belongs to. */
  label?: ReactNode;
  /**
   * The sample's size: sm, 0.75 rem, for dense rows; md, 1 rem, the size of an icon. As a Button's
   * icon it takes the icon's size.
   * @default 'md'
   */
  size?: 'sm' | 'md';
}

function Swatch({
  color: value,
  format,
  label,
  size = 'md',
  className,
  ...props
}: ColorSwatchProps) {
  const color = toColor(value, true);
  const { colorSwatchProps } = useColorSwatch({ color });
  const sampleStyle = {
    '--env-color-swatch-color': color.toString('css'),
  } as CSSProperties;
  const translucent = color.getChannelValue('alpha') < 1 || undefined;
  if (label == null && format === undefined)
    return (
      <span
        {...colorSwatchProps}
        {...props}
        className={classNames('env-color-swatch', 'env-color-swatch-sample', className)}
        data-size={size}
        data-translucent={translucent}
        style={{ ...sampleStyle, ...props.style }}
      />
    );
  return (
    <span {...props} className={classNames('env-color-swatch', className)} data-size={size}>
      <span
        className="env-color-swatch-sample"
        aria-hidden="true"
        data-translucent={translucent}
        style={sampleStyle}
      />
      {label != null && <span className="env-color-swatch-label">{label}</span>}
      {format !== undefined && (
        <span className="env-color-swatch-value">{displayColor(color, format)}</span>
      )}
    </span>
  );
}

/**
 * A small rounded sample of a color, with a hairline edge that keeps light and dark colors visible
 * on every surface and a checkerboard under a translucent one. With `format`, it writes the color's
 * value beside it, and with `label`, a name. Alone, it is an image named by the color's
 * description, such as dark purple, in the EnvUIProvider's language; as a Button's icon it is
 * decorative, and the button's text names the color.
 */
export function ColorSwatch(props: ColorSwatchProps) {
  return (
    <ColorLocale>
      <Swatch {...props} />
    </ColorLocale>
  );
}
