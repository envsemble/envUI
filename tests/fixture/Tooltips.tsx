import { useState } from 'react';
import { Button, IconButton, Kbd, Tooltip } from '@envsemble/envui';
import { Archive } from '@envsemble/envui/icons/Archive';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Save } from '@envsemble/envui/icons/Save';

/** Tooltips that describe a named control, repeat a name, wait on a disabled control and hold a Kbd. */
export function TooltipsFixture() {
  const [seats, setSeats] = useState(false);
  return (
    <div className="fixture-actions fixture-section">
      <Tooltip content="Moves it out of the list" delay={0}>
        <IconButton icon={<Archive />} aria-label="Archive" />
      </Tooltip>
      <Tooltip content="Delete" delay={0}>
        <IconButton icon={<Delete />} aria-label="Delete" />
      </Tooltip>
      <Tooltip content="No seats left" delay={0}>
        <Button disabled={!seats}>Invite member</Button>
      </Tooltip>
      <Button variant="secondary" onClick={() => setSeats((current) => !current)}>
        Toggle seats
      </Button>
      <Tooltip
        delay={0}
        data-testid="shortcut-tooltip"
        content={
          <>
            Save <Kbd keys={['Ctrl', 'S']} />
          </>
        }
      >
        <IconButton icon={<Save />} aria-label="Save" />
      </Tooltip>
    </div>
  );
}
