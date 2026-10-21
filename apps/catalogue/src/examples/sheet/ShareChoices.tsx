import { useState } from 'react';
import { Button, Column, Sheet, Text } from '@envsemble/envui';
import { Share } from '@envsemble/envui/icons/Share';

const choices = ['Copy link', 'Email', 'Download PDF'];

export default function ShareChoices() {
  const [chosen, setChosen] = useState('');
  const [open, setOpen] = useState(false);
  return (
    <Column gap={3} align="start">
      <Sheet
        side="bottom"
        title="Share report"
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button variant="secondary" startIcon={<Share />}>
            Share
          </Button>
        }
      >
        <Column gap={2}>
          {choices.map((choice) => (
            <Button
              key={choice}
              variant="secondary"
              fullWidth
              onClick={() => {
                setChosen(choice);
                setOpen(false);
              }}
            >
              {choice}
            </Button>
          ))}
        </Column>
      </Sheet>
      <Text>{chosen ? `Chose ${chosen}.` : 'Nothing shared yet.'}</Text>
    </Column>
  );
}
