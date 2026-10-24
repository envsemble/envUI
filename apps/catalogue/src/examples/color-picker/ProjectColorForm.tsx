import { useState, type FormEvent } from 'react';
import { Button, Column, Row, Text } from '@envsemble/envui';
import { ColorPicker } from '@envsemble/envui/color';

export default function ProjectColorForm() {
  const [applied, setApplied] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApplied(String(new FormData(event.currentTarget).get('color')));
  };
  return (
    <form
      onSubmit={submit}
      onReset={() => setApplied('')}
      style={{ inlineSize: 'min(100%, 18rem)' }}
    >
      <Column gap={4}>
        <ColorPicker
          label="Project color"
          name="color"
          defaultValue="#6b4fa3"
          formats={['hex', 'rgb']}
          description="Shown beside the project in lists."
        />
        <Row wrap align="center" gap={4}>
          <Button type="submit">Apply color</Button>
          <Button type="reset" variant="secondary">
            Reset
          </Button>
        </Row>
        <Text variant="caption" emphasis="muted" role="status">
          {applied && `Applied ${applied}.`}
        </Text>
      </Column>
    </form>
  );
}
