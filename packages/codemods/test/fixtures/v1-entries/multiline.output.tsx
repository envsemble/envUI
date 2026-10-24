import {
  Button,
  Row,
} from '@envsemble/envui';
import { ColorPicker, type ColorSwatchProps } from '@envsemble/envui/color';

export function Accent({ swatch }: { swatch: ColorSwatchProps }) {
  return (
    <Row gap={2}>
      <ColorPicker label="Accent" defaultValue={swatch.color} />
      <Button>Apply</Button>
    </Row>
  );
}
