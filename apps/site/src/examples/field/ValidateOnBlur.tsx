import { Field } from '@envsemble/envui';

export default function ValidateOnBlur() {
  return (
    <Field.Root
      name="handle"
      validationMode="onBlur"
      validate={(value) =>
        typeof value === 'string' && /^[a-z0-9-]+$/.test(value)
          ? null
          : 'Use lowercase letters, digits and hyphens.'
      }
      style={{ maxInlineSize: '24rem' }}
    >
      <Field.Label>Workspace address</Field.Label>
      <Field.Control />
      <Field.Description>example.com/your-address</Field.Description>
      <Field.Error />
    </Field.Root>
  );
}
