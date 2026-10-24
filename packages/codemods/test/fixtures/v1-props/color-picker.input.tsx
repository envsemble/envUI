import { ColorPicker } from '@envsemble/envui';

export function Accent({ variant, field }) {
  return (
    <>
      <ColorPicker label="Accent" hint="Used for links." variant="quiet" />
      <ColorPicker label="Accent" variant="outlined" />
      <ColorPicker label="Accent" variant={variant} />
      <ColorPicker label="Accent" variant="outline" ref={field} />
      <ColorPicker label="Accent" required size="sm" autoComplete="off" onBlur={field.onBlur} />
    </>
  );
}
