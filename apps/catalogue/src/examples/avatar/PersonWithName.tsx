import { Avatar, Text } from '@envsemble/envui';

/** The avatar beside the name it pictures, centred on the two lines. */
const person = { display: 'flex', alignItems: 'center', gap: '0.75rem' } as const;

export default function PersonWithName() {
  return (
    <div style={person}>
      {/* The name is written beside it, so the avatar stays decorative. */}
      <Avatar name="Alex Morgan" size="large" />
      <div>
        <Text>Alex Morgan</Text>
        <Text variant="supporting">alex.morgan@example.com</Text>
      </div>
    </div>
  );
}
