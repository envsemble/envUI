import { useState } from 'react';
import { Avatar, Checkbox, Column, Row, Text } from '@envsemble/envui';

const people = [
  { id: 'alex', name: 'Alex Morgan' },
  { id: 'sam', name: 'Sam Lee' },
  { id: 'priya', name: 'Priya Shah' },
];

export default function ChooseReviewers() {
  const [chosen, setChosen] = useState<string[]>(['sam']);
  return (
    <Column gap={3} role="group" aria-label="Reviewers">
      {people.map((person) => {
        const on = chosen.includes(person.id);
        return (
          <Checkbox
            key={person.id}
            checked={on}
            onCheckedChange={(checked) =>
              setChosen((current) =>
                checked ? [...current, person.id] : current.filter((id) => id !== person.id),
              )
            }
            label={
              <Row align="center" gap={3}>
                <Avatar name={person.name} selected={on} />
                <Text render={<span />}>{person.name}</Text>
              </Row>
            }
          />
        );
      })}
    </Column>
  );
}
