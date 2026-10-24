import { ColorPicker } from "@envsemble/envui";
import { ColorSwatch } from "@envsemble/envui/color";
export type { ColorSwatchProps } from "@envsemble/envui";
export { ColorPicker as Picker, Text } from "@envsemble/envui";

export function Accent() {
  return <ColorPicker label="Accent" />;
}
