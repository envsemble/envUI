import { useState } from 'react';
import { AvatarGroup, Column, Text } from '@envsemble/envui';

const reviewers = [
  { id: 'alex', name: 'Alex Morgan' },
  { id: 'sam', name: 'Sam Lee' },
  { id: 'priya', name: 'Priya Shah', href: '/people/priya' },
  { id: 'jordan', name: 'Jordan Ellis' },
  { id: 'taylor', name: 'Taylor Kim' },
];

export default function PressableAvatars() {
  const [opened, setOpened] = useState('');
  return (
    <Column gap={3} align="start">
      <AvatarGroup
        aria-label="Reviewers"
        people={reviewers}
        max={4}
        onPersonClick={(person) => setOpened(`Opened the profile of ${person.name}`)}
      />
      <Text variant="caption" emphasis="muted" role="status">
        {opened}
      </Text>
    </Column>
  );
}
