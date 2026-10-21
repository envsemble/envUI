import { Field } from '@envsemble/envui';

export default function FieldAnatomy() {
  return (
    <Field.Root name="handle" invalid style={{ inlineSize: 'min(100%, 22rem)' }}>
      <Field.Label>Workspace address</Field.Label>
      <Field.Control defaultValue="Northwind Team" />
      <Field.Description>Shown in links, as example.com/northwind.</Field.Description>
      <Field.Error match>Use lowercase letters, digits and hyphens.</Field.Error>
    </Field.Root>
  );
}
