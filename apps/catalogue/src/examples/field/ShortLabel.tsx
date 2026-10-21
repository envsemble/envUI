import { Field } from '@envsemble/envui';

export default function ShortLabel() {
  return (
    <Field.Root name="budget" style={{ inlineSize: 'min(100%, 18rem)' }}>
      <Field.Label>Budget</Field.Label>
      <Field.Control inputMode="decimal" />
      <Field.Description>In euros, for the whole quarter.</Field.Description>
    </Field.Root>
  );
}
