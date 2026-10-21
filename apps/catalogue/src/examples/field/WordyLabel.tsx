import { Field } from '@envsemble/envui';

export default function WordyLabel() {
  return (
    <Field.Root name="budget" style={{ inlineSize: 'min(100%, 18rem)' }}>
      <Field.Label>Please enter the budget for the whole quarter in euros:</Field.Label>
      <Field.Control inputMode="decimal" />
    </Field.Root>
  );
}
