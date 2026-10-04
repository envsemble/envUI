import { useState, type CSSProperties } from 'react';
import { Button, ButtonGroup, IconButton, Stack, Theme, type ThemeValue } from '@envsemble/envui';
import { Check } from '@envsemble/envui/icons/Check';
import { Settings } from '@envsemble/envui/icons/Settings';

export function ButtonGroupsFixture({ theme }: { theme: ThemeValue }) {
  const [activations, setActivations] = useState(0);
  const [ends, setEnds] = useState(true);
  return (
    <Theme theme={theme} data-testid={`button-groups-${theme}`} className="fixture-section">
      <Stack align="start">
        <Button data-testid="standalone">Standalone action</Button>
        {(['horizontal', 'vertical'] as const).map((orientation) => (
          <ButtonGroup
            key={orientation}
            orientation={orientation}
            aria-label={`${orientation} actions`}
            data-testid={orientation}
          >
            <Button onClick={() => setActivations((value) => value + 1)}>Continue</Button>
            <Button variant="important" iconOnly icon={<Check />} aria-label="Confirm" />
            <IconButton icon={<Settings />} aria-label="Settings" />
            <Button href="#group-destination" variant="outlined" startIcon={<Settings />}>
              Manage
            </Button>
            <Button variant="destructive" endIcon={<Check />}>
              Delete
            </Button>
          </ButtonGroup>
        ))}
        <ButtonGroup data-testid="important-end">
          <Button variant="important" iconOnly icon={<Check />} aria-label="Approve" />
          <Button variant="secondary">Cancel</Button>
        </ButtonGroup>
        <ButtonGroup orientation="vertical" data-testid="important-top">
          <Button variant="important">Confirm</Button>
          <IconButton icon={<Settings />} aria-label="Options" />
        </ButtonGroup>
        <ButtonGroup data-testid="single">
          <Button>Only action</Button>
        </ButtonGroup>
        <ButtonGroup orientation="vertical" data-testid="single-important">
          <Button variant="important" iconOnly icon={<Check />} aria-label="Only confirmation" />
        </ButtonGroup>
        <ButtonGroup data-testid="dynamic">
          {ends && <Button>First</Button>}
          <Button hidden>Hidden before</Button>
          <>
            <IconButton icon={<Settings />} aria-label="Remaining action" />
            {null}
          </>
          <Button hidden>Hidden after</Button>
          {ends && <Button>Last</Button>}
        </ButtonGroup>
        <Button onClick={() => setEnds((value) => !value)}>Toggle end buttons</Button>
        <ButtonGroup data-testid="scaled" style={{ '--scale': 1.5 } as CSSProperties}>
          <Button>Scaled first</Button>
          <Button variant="secondary">Scaled last</Button>
        </ButtonGroup>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setActivations(100);
          }}
        >
          <ButtonGroup aria-label="Form actions">
            <Button onClick={() => setActivations((value) => value + 1)}>Native action</Button>
            <Button disabled onClick={() => setActivations(200)}>
              Disabled action
            </Button>
            <Button href="#blocked-group" disabled>
              Disabled destination
            </Button>
          </ButtonGroup>
        </form>
        <output data-testid="activations">{activations}</output>
      </Stack>
    </Theme>
  );
}
