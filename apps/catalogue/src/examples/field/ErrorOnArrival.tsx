import { Button, Column, Field } from '@envsemble/envui';

export default function ErrorOnArrival() {
  return (
    <Column render={<form />} gap={4} style={{ inlineSize: 'min(100%, 18rem)' }}>
      <Field.Root name="project" invalid>
        <Field.Label>Project name</Field.Label>
        <Field.Control required />
        <Field.Error match>Enter a project name.</Field.Error>
      </Field.Root>
      <Button type="submit">Create project</Button>
    </Column>
  );
}
