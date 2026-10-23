import { Button, ColorPicker, type ColorPickerProps, Row } from '@envsemble/envui';
import { ColorSwatch as Swatch } from '@envsemble/envui';

export function Accent(props: ColorPickerProps) {
  return (
    <Row gap={2}>
      <Swatch color="#6750a4" />
      <ColorPicker {...props} />
      <Button>Apply</Button>
    </Row>
  );
}
