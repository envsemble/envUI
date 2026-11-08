import { useState } from 'react';
import {
  Button,
  Column,
  Popover,
  Text,
  TextField,
  Theme,
  type ColorScheme,
} from '@envsemble/envui';

export const themes = true;

export default function PopoverFixture({ theme }: { theme: ColorScheme }) {
  const [saved, setSaved] = useState('');
  return (
    <Theme theme={theme} data-testid={`popover-${theme}`} className="fixture-section">
      <div className="fixture-actions">
        <Popover
          title="Document details"
          trigger={<Button variant="secondary">Details {theme}</Button>}
        >
          <Text>Last changed today by Alex.</Text>
        </Popover>
        <Popover
          aria-label={`Rename ${theme}`}
          width="lg"
          trigger={<Button variant="secondary">Rename {theme}</Button>}
        >
          {(close) => (
            <Column gap={3}>
              <TextField label="Name" name="name" defaultValue="Roadmap.md" />
              <Button
                onClick={() => {
                  setSaved('Renamed');
                  close();
                }}
              >
                Save name
              </Button>
            </Column>
          )}
        </Popover>
      </div>
      <output data-testid={`popover-result-${theme}`}>{saved}</output>
    </Theme>
  );
}
