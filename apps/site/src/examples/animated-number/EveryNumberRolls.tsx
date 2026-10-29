import { useState } from 'react';
import { AnimatedNumber, Column, IconButton, Row, Text } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconRemove } from '@envsemble/envui/icons/Remove';

const seatsInPlan = 10;

export default function EveryNumberRolls() {
  const [invited, setInvited] = useState(7);
  const left = seatsInPlan - invited;
  return (
    <Column gap={3} align="start">
      <Row wrap align="center" gap={4}>
        <IconButton
          icon={<IconRemove />}
          aria-label="Invite one person fewer"
          disabled={invited === 0}
          onClick={() => setInvited((count) => count - 1)}
        />
        <IconButton
          icon={<IconAdd />}
          aria-label="Invite one more person"
          disabled={left === 0}
          onClick={() => setInvited((count) => count + 1)}
        />
      </Row>
      <Text role="status">
        <AnimatedNumber value={invited} /> invited, <AnimatedNumber value={left} /> left, $
        <AnimatedNumber value={invited * 12} /> a month
      </Text>
    </Column>
  );
}
