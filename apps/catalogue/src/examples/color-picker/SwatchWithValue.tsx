import { Button, ColorSwatch } from '@envsemble/envui';

export default function SwatchWithValue() {
  return (
    <Button variant="secondary" startIcon={<ColorSwatch color="#3b6fd4" />}>
      #3B6FD4
    </Button>
  );
}
