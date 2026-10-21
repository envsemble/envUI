import { IconButton, ColorSwatch } from '@envsemble/envui';

export default function SwatchAlone() {
  return (
    <IconButton variant="secondary" icon={<ColorSwatch color="#3b6fd4" />} aria-label="Color" />
  );
}
