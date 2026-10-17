import { useState } from 'react';
import {
  Button,
  PageHeader,
  SearchField,
  Stack,
  Surface,
  Tabs,
  Text,
  WindowFrame,
} from '@envsemble/envui';
import './Frame.css';

const sections = ['Overview', 'Milestones', 'Risks'];

/**
 * A window without sidebars that draws its own title bar, mounted with ?fixture=frame-window:
 * a section bar of Tabs under the title bar, then a body as tall as the window below the bar
 * (from --env-frame-header-block-size) beside an aside that sticks at --env-frame-sticky-top, and
 * a PageHeader with small controls and a toolbar. Nothing overrides the frame's parts.
 */
export function WindowSectionsFixture() {
  const [section, setSection] = useState('Overview');
  return (
    <WindowFrame.Root className="fixture-frame">
      <WindowFrame.TitleBar>Launch plan</WindowFrame.TitleBar>
      <WindowFrame.Content tabIndex={0} role="region" aria-label="Launch plan">
        <Tabs
          aria-label="Sections"
          size="sm"
          value={section}
          onValueChange={(value) => setSection(String(value))}
          items={sections.map((name) => ({
            value: name,
            button: <Button>{name}</Button>,
            content: (
              <div className="fixture-frame-window-body" data-testid={`body-${name}`}>
                <Stack gap={4}>
                  <PageHeader
                    title={name}
                    headingLevel={2}
                    controlSize="sm"
                    actions={<Button variant="primary">Share</Button>}
                    toolbar={
                      <Stack direction="row" wrap justify="between" align="center" gap={2}>
                        {/* Fields keep their own size: controlSize reaches buttons. */}
                        <SearchField label={`Search ${name.toLowerCase()}`} size="sm" />
                        <Button variant="secondary">Filter</Button>
                      </Stack>
                    }
                  />
                  {/* The overview is long enough to scroll; the others are short. */}
                  <div className={name === 'Overview' ? 'fixture-frame-filler' : undefined}>
                    <Text>The {name.toLowerCase()} of the launch.</Text>
                  </div>
                </Stack>
                <Surface className="fixture-frame-window-aside" data-testid="aside">
                  <Text>Owners</Text>
                </Surface>
              </div>
            ),
          }))}
        />
      </WindowFrame.Content>
    </WindowFrame.Root>
  );
}
