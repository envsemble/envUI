import { Button, Column, Field } from '@envsemble/envui';

export default function ErrorAfterLeaving() {
  return (
    <Column render={<form />} gap={4} style={{ inlineSize: 'min(100%, 18rem)' }}>
      <Field.Root name="project" validationMode="onBlur">
        <Field.Label>Project name</Field.Label>
        <Field.Control required />
        <Field.Error match="valueMissing">Enter a project name.</Field.Error>
      </Field.Root>
      <Button type="submit">Create project</Button>
    </Column>
  );
}
