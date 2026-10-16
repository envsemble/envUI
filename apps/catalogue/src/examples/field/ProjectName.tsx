import { Field } from '@envsemble/envui';

export default function ProjectName() {
  return (
    <Field.Root name="project" style={{ maxInlineSize: '24rem' }}>
      <Field.Label>Project name</Field.Label>
      <Field.Control placeholder="Northwind launch" required maxLength={40} />
      <Field.Description>
        Up to 40 characters; people see it in their project list.
      </Field.Description>
      <Field.Error match="valueMissing">Enter a project name.</Field.Error>
    </Field.Root>
  );
}
