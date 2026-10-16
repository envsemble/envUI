/**
 * The English defaults of the `colorPicker` messages: ColorPicker. EnvUIProvider's
 * `messages.colorPicker` overrides any of them.
 */
export const colorPicker = {
  /** The field's description. */
  description: 'Enter six hexadecimal digits, with an optional #.',
  /** The error for a value that is no color. */
  invalid: 'Use six hexadecimal digits (0–9, A–F).',
  /** The HEX field's visible label. */
  hex: 'HEX',
  /** Names the HEX field after the picker, such as Accent HEX. */
  hexLabel: ({ label }: { label: string }) => `${label} HEX`,
  /** Announced when an invalid color is discarded. */
  restored: 'Invalid color discarded. The previous color has been restored.',
  /** Names the hue slider. */
  hue: 'Hue',
  /** Names the saturation and brightness area. */
  area: 'Color',
  /** The area's value, such as Saturation 40%, Brightness 80%. */
  areaValue: ({ saturation, brightness }: { saturation: string; brightness: string }) =>
    `Saturation ${saturation}, Brightness ${brightness}`,
};

export type ColorPickerMessages = typeof colorPicker;
