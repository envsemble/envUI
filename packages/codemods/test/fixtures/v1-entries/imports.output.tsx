import { Button, Row } from '@envsemble/envui';
import { ColorPicker, type ColorPickerProps, ColorSwatch as Swatch } from '@envsemble/envui/color';

export function Accent(props: ColorPickerProps) {
  return (
    <Row gap={2}>
      <Swatch color="#6750a4" />
      <ColorPicker {...props} />
      <Button>Apply</Button>
    </Row>
  );
}
