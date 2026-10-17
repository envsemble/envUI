import { ColorPicker } from '@envsemble/envui';

export function Accent({ variant }) {
  return (
    <>
      <ColorPicker label="Accent" description="Used for links." variant="ghost" />
      <ColorPicker label="Accent" variant="outline" />
      <ColorPicker label="Accent" variant={variant} />
      <ColorPicker label="Accent" variant="outline" />
    </>
  );
}
