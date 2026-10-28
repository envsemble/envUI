import { useState } from 'react';
import { Button, Checkbox, Column, IconButton, Row, TextField } from '@envsemble/envui';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';

// Tab follows the order the controls are written in; every field has a label, and the button that
// is only an icon a name.
export default function Keyboard() {
  const [shared, setShared] = useState(true);
  return (
    <Column gap={4}>
      <TextField label="Report title" defaultValue="Quarterly report" />
      <Checkbox label="Share with the team" checked={shared} onCheckedChange={setShared} />
      <Row gap={2} justify="end" align="center">
        <IconButton variant="ghost" icon={<MoreVert />} aria-label="More options" />
        <Button variant="secondary">Cancel</Button>
        <Button>Save</Button>
      </Row>
    </Column>
  );
}
