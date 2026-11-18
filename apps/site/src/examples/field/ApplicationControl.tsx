import { useState, type ComponentPropsWithRef } from 'react';
import { Field } from '@envsemble/envui';

const withoutFieldOutline = { border: 0, background: 'none', paddingInline: 0 };

function Volume(props: ComponentPropsWithRef<'input'>) {
  // eslint-disable-next-line envui/no-html-elements
  return <input {...props} type="range" min={0} max={100} />;
}

export default function ApplicationControl() {
  const [volume, setVolume] = useState(60);
  return (
    <Field.Root name="volume" style={{ maxInlineSize: '24rem' }}>
      <Field.Label>Notification volume</Field.Label>
      <Field.Control
        render={<Volume />}
        value={String(volume)}
        onValueChange={(next) => setVolume(Number(next))}
        style={withoutFieldOutline}
      />
      <Field.Description>{volume}% of the system volume.</Field.Description>
    </Field.Root>
  );
}
