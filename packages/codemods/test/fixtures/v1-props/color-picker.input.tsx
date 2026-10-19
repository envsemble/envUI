import { ColorPicker } from '@envsemble/envui';

export function Accent({ variant }) {
  return (
    <>
      <ColorPicker label="Accent" hint="Used for links." variant="quiet" />
      <ColorPicker label="Accent" variant="outlined" />
      <ColorPicker label="Accent" variant={variant} />
      <ColorPicker label="Accent" variant="outline" />
    </>
  );
}
