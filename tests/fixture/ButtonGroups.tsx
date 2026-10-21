import { useState } from 'react';
import { Button, ButtonGroup, IconButton, Column, Theme, type ThemeValue } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Check } from '@envsemble/envui/icons/Check';
import { ExpandMore } from '@envsemble/envui/icons/ExpandMore';
import { Settings } from '@envsemble/envui/icons/Settings';

export function ButtonGroupsFixture({ theme }: { theme: ThemeValue }) {
  const [activations, setActivations] = useState(0);
  const [ends, setEnds] = useState(true);
  return (
    <Theme theme={theme} data-testid={`button-groups-${theme}`} className="fixture-section">
      <Column gap={4} align="start">
        <Button data-testid="standalone">Standalone action</Button>
        {(['horizontal', 'vertical'] as const).map((orientation) => (
          <ButtonGroup
            key={orientation}
            orientation={orientation}
            aria-label={`${orientation} actions`}
            data-testid={orientation}
          >
            <Button onClick={() => setActivations((value) => value + 1)}>Continue</Button>
            <Button
              variant="primary"
              tone="accent"
              iconOnly
              icon={<Check />}
              aria-label="Confirm"
            />
            <IconButton icon={<Settings />} aria-label="Settings" />
            <Button href="#group-destination" variant="outline" startIcon={<Settings />}>
              Manage
            </Button>
            <Button variant="primary" tone="danger" endIcon={<Check />}>
              Delete
            </Button>
          </ButtonGroup>
        ))}
        <ButtonGroup data-testid="important-end">
          <Button variant="primary" tone="accent" iconOnly icon={<Check />} aria-label="Approve" />
          <Button variant="secondary">Cancel</Button>
        </ButtonGroup>
        <ButtonGroup orientation="vertical" data-testid="important-top">
          <Button variant="primary" tone="accent">
            Confirm
          </Button>
          <IconButton icon={<Settings />} aria-label="Options" />
        </ButtonGroup>
        <ButtonGroup data-testid="single">
          <Button>Only action</Button>
        </ButtonGroup>
        <ButtonGroup orientation="vertical" data-testid="single-important">
          <Button
            variant="primary"
            tone="accent"
            iconOnly
            icon={<Check />}
            aria-label="Only confirmation"
          />
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
        <ButtonGroup data-testid="scaled">
          <Button size="lg">Large first</Button>
          <Button size="lg" variant="secondary">
            Large last
          </Button>
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
        {/* Groups that fill a sidebar. */}
        <div className="fixture-sidebar" data-testid="sidebar">
          <ButtonGroup fullWidth aria-label="Start a document">
            <Button startIcon={<Add />}>New document</Button>
            <IconButton variant="primary" icon={<ExpandMore />} aria-label="More ways to start" />
          </ButtonGroup>
          <ButtonGroup fullWidth orientation="vertical" aria-label="Sidebar actions">
            <Button variant="secondary">Import</Button>
            <Button variant="secondary">Export</Button>
          </ButtonGroup>
          <ButtonGroup fullWidth aria-label="Sidebar tools">
            <IconButton icon={<Settings />} aria-label="Sidebar settings" />
            <IconButton icon={<Check />} aria-label="Mark all done" />
            <IconButton icon={<Add />} aria-label="Add a list" />
          </ButtonGroup>
        </div>
      </Column>
    </Theme>
  );
}
