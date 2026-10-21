import { useState } from 'react';
import { AnimatedNumber, IconButton, Column, Row, Text } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Remove } from '@envsemble/envui/icons/Remove';

const seatsInPlan = 10;

export default function SeatsLeft() {
  const [invited, setInvited] = useState(7);
  const left = seatsInPlan - invited;
  return (
    <Column gap={3} align="start">
      <Row wrap align="center" gap={4}>
        <IconButton
          icon={<Remove />}
          aria-label="Invite one person fewer"
          disabled={invited === 0}
          onClick={() => setInvited((count) => count - 1)}
        />
        <IconButton
          icon={<Add />}
          aria-label="Invite one more person"
          disabled={left === 0}
          onClick={() => setInvited((count) => count + 1)}
        />
      </Row>
      <Text role="status">
        <AnimatedNumber value={left} /> {left === 1 ? 'seat' : 'seats'} left in the plan
      </Text>
    </Column>
  );
}
