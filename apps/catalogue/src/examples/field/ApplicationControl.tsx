import { useState, type ComponentPropsWithRef } from 'react';
import { Field } from '@envsemble/envui';

/** A control of the application's own: a native range input, labelled and described by the field. */
function Volume(props: ComponentPropsWithRef<'input'>) {
  // The application's own control is what this example shows, so it is a native input here.
  // eslint-disable-next-line envui/no-html-elements
  return <input {...props} type="range" min={0} max={100} />;
}

export default function ApplicationControl() {
  const [volume, setVolume] = useState(60);
  return (
    <Field.Root name="volume" style={{ maxInlineSize: '24rem' }}>
      <Field.Label>Notification volume</Field.Label>
      {/* render takes any control; it receives the id, the label's and description's ids, and ref.
          A short inline style takes the field's outline off a control that draws its own. */}
      <Field.Control
        render={<Volume />}
        value={String(volume)}
        onValueChange={(next) => setVolume(Number(next))}
        style={{ border: 0, background: 'none', paddingInline: 0 }}
      />
      <Field.Description>{volume}% of the system volume.</Field.Description>
    </Field.Root>
  );
}
