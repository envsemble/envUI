import { useState } from 'react';
import { DescriptionList, Link, List, ListDetail, Column, Text } from '@envsemble/envui';

const people = [
  { id: 'alex', name: 'Alex Morgan', role: 'Engineering lead', email: 'alex.morgan@example.com' },
  { id: 'priya', name: 'Priya Shah', role: 'Product manager', email: 'priya.shah@example.com' },
  { id: 'sam', name: 'Sam Lee', role: 'Product designer', email: 'sam.lee@example.com' },
];

export default function MasterDetail() {
  const [chosen, setChosen] = useState(people[0]);
  const [detailShown, setDetailShown] = useState(false);
  return (
    <ListDetail.Root
      detailShown={detailShown}
      onBack={() => setDetailShown(false)}
      backLabel="All people"
      style={{ blockSize: '16rem' }}
    >
      <ListDetail.List label="People">
        <List.Root aria-label="People">
          {people.map((person) => (
            <List.Item
              key={person.id}
              interactive
              label={
                // The current person's link carries aria-current, where Back returns focus.
                <Link
                  href={`/people/${person.id}`}
                  underline={false}
                  data-row-target
                  draggable={false}
                  aria-current={person.id === chosen.id || undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    setChosen(person);
                    setDetailShown(true);
                  }}
                >
                  {person.name}
                </Link>
              }
              description={person.role}
            />
          ))}
        </List.Root>
      </ListDetail.List>
      <ListDetail.Detail label={chosen.name}>
        <Column gap={3} style={{ padding: 'var(--env-space-4)' }}>
          <Text variant="title" render={<h3 />}>
            {chosen.name}
          </Text>
          <DescriptionList.Root aria-label={`About ${chosen.name}`}>
            <DescriptionList.Item label="Role">{chosen.role}</DescriptionList.Item>
            <DescriptionList.Item label="Email">{chosen.email}</DescriptionList.Item>
          </DescriptionList.Root>
        </Column>
      </ListDetail.Detail>
    </ListDetail.Root>
  );
}
