import { AvatarGroup, Card, Column } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const people = [
  { name: 'Alex Morgan' },
  { name: 'Sam Lee' },
  { name: 'Priya Shah', fallback: 'initials' as const },
  { name: 'Jordan Ellis' },
  { name: 'Taylor Kim' },
];
const sizes = ['sm', 'md', 'lg', 'xl'] as const;

/** Groups in each size, and on a card, where the ring takes the card's fill. */
export default function Groups() {
  return (
    <Example title="Avatar groups" size="collection">
      <SpecimenGrid>
        <Specimen title="Sizes">
          <Column gap={3} align="start">
            {sizes.map((size) => (
              <AvatarGroup key={size} people={people} max={3} size={size} />
            ))}
          </Column>
        </Specimen>
        <Specimen title="On a card">
          <Card>
            <AvatarGroup people={people} total={24} max={4} />
          </Card>
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
