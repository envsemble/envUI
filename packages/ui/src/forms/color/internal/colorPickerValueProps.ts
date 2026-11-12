import type { ColorFormat, ColorValue } from './colorValue.js';
import type { ColorPickerSwatch } from './SwatchList.js';

/** The props ColorPicker and ColorPickerButton share: the color, its formats and the tools. */
export interface ColorPickerValueProps {
  /**
   * The color's name, such as Accent color; it names the picker, and ColorPickerButton's popover
   * and button.
   */
  label: string;
  /**
   * The color in a controlled picker: a CSS color string, such as #6750a4, rgb(103, 80, 164) or
   * hsl(256, 34%, 48%), or React Aria's Color; update it from onValueChange.
   */
  value?: ColorValue;
  /**
   * The color an uncontrolled picker starts at, and that a form reset restores.
   * @default '#000000'
   */
  defaultValue?: ColorValue;
  /** Receives the color as it changes, as a string in valueFormat, such as #6750a4. */
  onValueChange?: (value: string) => void;
  /**
   * The format of the string onValueChange receives and a form submits: hex (#rrggbb, or #rrggbbaa
   * while translucent), rgb (rgb() or rgba()) or hsl (hsl() or hsla()).
   * @default 'hex'
   */
  valueFormat?: ColorFormat;
  /**
   * The formats whose fields show together, one under another in this order, such as
   * `['hex', 'rgb', 'hsl']`. With one, the picker shows that format alone; without the prop, it
   * shows one format at a time, hex first, with a select that switches to RGB or HSL.
   */
  formats?: readonly ColorFormat[];
  /**
   * Whether the color has an alpha: a slider and a field for its opacity, and a value with its
   * alpha while translucent. Without it, colors are opaque.
   * @default false
   */
  alpha?: boolean;
  /**
   * Whether to show the eyedropper, which picks a color from the screen, where the browser has one
   * (Chromium-based browsers on the desktop); elsewhere it never shows.
   * @default true
   */
  eyeDropper?: boolean;
  /**
   * Whether to show the button that copies the color, as the fields show it.
   * @default true
   */
  copyable?: boolean;
  /**
   * Preset colors to choose from, under the fields: CSS color strings, React Aria's Colors, or
   * `{ color, label }` with a name, such as the colors of a brand.
   */
  swatches?: readonly ColorPickerSwatch[];
  /** Submits the color with a form under this name, as a string in valueFormat. */
  name?: string;
  /** The id of the form the color submits with, where the picker sits outside it. */
  form?: string;
  /** Whether the picker takes no input, faded. */
  disabled?: boolean;
  /**
   * Whether people can read and copy the color, but not change it.
   * @default false
   */
  readOnly?: boolean;
}
