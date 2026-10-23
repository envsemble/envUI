import {
  Button,
  ColorPicker,
  Row,
  type ColorSwatchProps,
} from '@envsemble/envui';

export function Accent({ swatch }: { swatch: ColorSwatchProps }) {
  return (
    <Row gap={2}>
      <ColorPicker label="Accent" defaultValue={swatch.color} />
      <Button>Apply</Button>
    </Row>
  );
}
