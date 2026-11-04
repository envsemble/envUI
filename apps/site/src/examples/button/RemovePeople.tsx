import { useState } from 'react';
import { Column, IconButton, Row, Text } from '@envsemble/envui';
import { IconClose } from '@envsemble/envui/icons/Close';

export default function RemovePeople() {
  const [people, setPeople] = useState(['Alex Morgan', 'Priya Shah', 'Sam Lee']);
  return (
    // A list without bullets or indent: a short inline style, as envUI has no list layout for it.
    <Column gap={2} render={<ul />} style={{ margin: 0, paddingInlineStart: 0, listStyle: 'none' }}>
      {people.map((person) => (
        <Row key={person} align="center" gap={2} render={<li />}>
          <Text render={<span />}>{person}</Text>
          {/* Beside others like it, each button names what it removes. */}
          <IconButton
            variant="ghost"
            icon={<IconClose />}
            size="sm"
            aria-label={`Remove ${person}`}
            onClick={() => setPeople((current) => current.filter((each) => each !== person))}
          />
        </Row>
      ))}
    </Column>
  );
}
