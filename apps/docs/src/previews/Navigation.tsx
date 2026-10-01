import { useState } from 'react';
import {
  Text,
  Button,
  IconButton,
  NavigationItem,
  DirectionLink,
  Card,
  Tabs,
  Stack,
  ActionGroup,
} from '@envsemble/envui';
import { Home, Search, Apps, Settings, ArrowBack, ArrowForward } from '@envsemble/envui/icons';
import { Example, Specimen, SpecimenGrid } from './Example';
import { PairedThemes } from './PairedThemes';

export function NavigationPreview() {
  const [selectedDestination, setSelectedDestination] = useState('Home');
  return (
    <PairedThemes>
      {() => (
        <>
          <Example title="Destination selection" size="compact">
            <Stack>
              {['Home', 'Projects', 'Settings'].map((label, i) => (
                <NavigationItem
                  key={label}
                  selected={selectedDestination === label}
                  onClick={() => setSelectedDestination(label)}
                  icon={i === 0 ? <Home /> : i === 1 ? <Apps /> : <Settings />}
                >
                  {label}
                </NavigationItem>
              ))}
            </Stack>
          </Example>
          <Example title="States" size="collection">
            <SpecimenGrid size="compact">
              <Specimen title="Default">
                <NavigationItem icon={<Home />}>Home</NavigationItem>
              </Specimen>
              <Specimen title="Selected">
                <NavigationItem icon={<Home />} selected>
                  Home
                </NavigationItem>
              </Specimen>
              <Specimen title="Hover">
                <NavigationItem icon={<Home />} className="docs-force-1">
                  Home
                </NavigationItem>
              </Specimen>
              <Specimen title="Pressed">
                <NavigationItem icon={<Home />} className="docs-force-2">
                  Home
                </NavigationItem>
              </Specimen>
              <Specimen title="Keyboard focus">
                <NavigationItem icon={<Home />} className="docs-force-3">
                  Home
                </NavigationItem>
              </Specimen>
              <Specimen title="Disabled">
                <NavigationItem icon={<Home />} disabled>
                  Home
                </NavigationItem>
              </Specimen>
            </SpecimenGrid>
          </Example>
        </>
      )}
    </PairedThemes>
  );
}

export function TabsPreview() {
  const [referenceView, setReferenceView] = useState<string | null>('preview');
  const [buttonStyle, setButtonStyle] = useState<string | null>('secondary');
  const [iconView, setIconView] = useState<string | null>('home');
  const [workspaceView, setWorkspaceView] = useState<string | null>('home');
  return (
    <PairedThemes>
      {() => (
        <>
          <Example title="Content views" size="content">
            <Tabs
              aria-label="Example reference views"
              value={referenceView}
              onValueChange={setReferenceView}
              keepMounted
              items={[
                {
                  value: 'preview',
                  button: <Button>Preview</Button>,
                  content: (
                    <Card>
                      <Text as="h3" variant="section-heading">
                        Live preview
                      </Text>
                      <Text>Explore the component in use.</Text>
                    </Card>
                  ),
                },
                {
                  value: 'guidelines',
                  button: <Button>Guidelines</Button>,
                  content: (
                    <Card>
                      <Text as="h3" variant="section-heading">
                        Design guidelines
                      </Text>
                      <Text>Use the shared colors, spacing and motion.</Text>
                    </Card>
                  ),
                },
                {
                  value: 'usage',
                  button: <Button>Usage</Button>,
                  content: (
                    <Card>
                      <Text as="h3" variant="section-heading">
                        React usage
                      </Text>
                      <Text>Import Tabs and supply buttons with their content.</Text>
                    </Card>
                  ),
                },
              ]}
            />
          </Example>
          <Example title="Button styles" caption="The selected tab keeps its button style.">
            <Tabs
              aria-label="Button style examples"
              value={buttonStyle}
              onValueChange={setButtonStyle}
              items={[
                {
                  value: 'secondary',
                  button: <Button variant="secondary">Secondary</Button>,
                  content: <Card>Secondary button fill and border.</Card>,
                },
                {
                  value: 'outlined',
                  button: <Button variant="outlined">Outlined</Button>,
                  content: <Card>Outlined button fill, label and border.</Card>,
                },
                {
                  value: 'important',
                  button: <Button variant="important">Important</Button>,
                  content: <Card>Important button color and standard corners.</Card>,
                },
                {
                  value: 'unavailable',
                  button: <Button disabled>Unavailable</Button>,
                  content: null,
                },
              ]}
            />
          </Example>
          <Example title="Icon buttons" caption="Accessible names identify each view.">
            <Tabs
              aria-label="Icon views"
              value={iconView}
              onValueChange={setIconView}
              items={[
                {
                  value: 'home',
                  button: <IconButton icon={<Home />} aria-label="Home view" />,
                  content: <Card>Home content</Card>,
                },
                {
                  value: 'search',
                  button: <IconButton icon={<Search />} aria-label="Search view" />,
                  content: <Card>Search content</Card>,
                },
                {
                  value: 'settings',
                  button: <IconButton icon={<Settings />} aria-label="Settings view" />,
                  content: <Card>Settings content</Card>,
                },
              ]}
            />
          </Example>
          <Example title="Navigation buttons" caption="Tabs owns selection and icon fill.">
            <Tabs
              aria-label="Workspace views"
              value={workspaceView}
              onValueChange={setWorkspaceView}
              items={[
                {
                  value: 'home',
                  button: <NavigationItem icon={<Home />}>Home</NavigationItem>,
                  content: <Card>Workspace overview</Card>,
                },
                {
                  value: 'projects',
                  button: <NavigationItem icon={<Apps />}>Projects</NavigationItem>,
                  content: <Card>Workspace projects</Card>,
                },
              ]}
            />
          </Example>
        </>
      )}
    </PairedThemes>
  );
}

export function DirectionLinksPreview() {
  return (
    <PairedThemes>
      {() => (
        <>
          <Example title="Previous & up next">
            <ActionGroup>
              <DirectionLink
                direction="previous"
                href="#/foundations/typography"
                icon={<ArrowBack />}
              >
                Typography
              </DirectionLink>
              <DirectionLink direction="next" href="#/foundations/spacing" icon={<ArrowForward />}>
                Spacing & shape
              </DirectionLink>
            </ActionGroup>
          </Example>
          <Example title="Without an icon">
            <DirectionLink direction="next" href="#/getting-started">
              Getting started
            </DirectionLink>
          </Example>
          <Example title="Long destination text">
            <div className="docs-narrow-actions">
              <DirectionLink direction="next" href="#/foundations/motion" icon={<ArrowForward />}>
                Motion & accessibility across the component library
              </DirectionLink>
            </div>
          </Example>
        </>
      )}
    </PairedThemes>
  );
}
