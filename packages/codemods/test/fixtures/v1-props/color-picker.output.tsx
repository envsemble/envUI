import { ColorPicker } from '@envsemble/envui';

export function Accent({ variant, field }) {
  return (
    <>
      <ColorPicker label="Accent" description="Used for links." />
      <ColorPicker label="Accent" />
      <ColorPicker label="Accent" variant={variant} />
      <ColorPicker label="Accent" ref={field} />
    </>
  );
}
