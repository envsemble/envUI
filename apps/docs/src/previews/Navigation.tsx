import { useState } from 'react';
import {
  Text,
  Button,
  IconButton,
  NavigationItem,
  DirectionLink,
  Tabs,
  Stack,
  ActionGroup,
} from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Search } from '@envsemble/envui/icons/Search';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Settings } from '@envsemble/envui/icons/Settings';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

export function NavigationPreview() {
  const [selectedDestination, setSelectedDestination] = useState('Home');
  return (
    <Preview>
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
    </Preview>
  );
}

export function TabsPreview() {
  const [referenceView, setReferenceView] = useState<string | null>('preview');
  const [buttonStyle, setButtonStyle] = useState<string | null>('secondary');
  const [iconView, setIconView] = useState<string | null>('home');
  const [workspaceView, setWorkspaceView] = useState<string | null>('home');
  return (
    <Preview>
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
                <Stack gap={2}>
                  <Text as="h3" variant="section-heading">
                    Live preview
                  </Text>
                  <Text>Explore the component in use.</Text>
                </Stack>
              ),
            },
            {
              value: 'guidelines',
              button: <Button>Guidelines</Button>,
              content: (
                <Stack gap={2}>
                  <Text as="h3" variant="section-heading">
                    Design guidelines
                  </Text>
                  <Text>Use the shared colors, spacing and motion.</Text>
                </Stack>
              ),
            },
            {
              value: 'usage',
              button: <Button>Usage</Button>,
              content: (
                <Stack gap={2}>
                  <Text as="h3" variant="section-heading">
                    React usage
                  </Text>
                  <Text>Import Tabs and supply buttons with their content.</Text>
                </Stack>
              ),
            },
          ]}
        />
      </Example>
      <Example title="Tab controls" size="collection">
        <SpecimenGrid size="wide">
          <Specimen title="Button styles" caption="The selected tab keeps its button style.">
            <Tabs
              aria-label="Button style examples"
              value={buttonStyle}
              onValueChange={setButtonStyle}
              items={[
                {
                  value: 'secondary',
                  button: <Button variant="secondary">Secondary</Button>,
                  content: <Text>Secondary button fill and border.</Text>,
                },
                {
                  value: 'outlined',
                  button: <Button variant="outlined">Outlined</Button>,
                  content: <Text>Outlined button fill, label and border.</Text>,
                },
                {
                  value: 'important',
                  button: <Button variant="important">Important</Button>,
                  content: <Text>Important button color and standard corners.</Text>,
                },
                {
                  value: 'unavailable',
                  button: <Button disabled>Unavailable</Button>,
                  content: null,
                },
              ]}
            />
          </Specimen>
          <Specimen title="Icon buttons" caption="Accessible names identify each view.">
            <Tabs
              aria-label="Icon views"
              value={iconView}
              onValueChange={setIconView}
              items={[
                {
                  value: 'home',
                  button: <IconButton icon={<Home />} aria-label="Home view" />,
                  content: <Text>Home content</Text>,
                },
                {
                  value: 'search',
                  button: <IconButton icon={<Search />} aria-label="Search view" />,
                  content: <Text>Search content</Text>,
                },
                {
                  value: 'settings',
                  button: <IconButton icon={<Settings />} aria-label="Settings view" />,
                  content: <Text>Settings content</Text>,
                },
              ]}
            />
          </Specimen>
          <Specimen title="Navigation buttons" caption="Tabs owns selection and icon fill.">
            <Tabs
              aria-label="Workspace views"
              value={workspaceView}
              onValueChange={setWorkspaceView}
              items={[
                {
                  value: 'home',
                  button: <NavigationItem icon={<Home />}>Home</NavigationItem>,
                  content: <Text>Workspace overview</Text>,
                },
                {
                  value: 'projects',
                  button: <NavigationItem icon={<Apps />}>Projects</NavigationItem>,
                  content: <Text>Workspace projects</Text>,
                },
              ]}
            />
          </Specimen>
        </SpecimenGrid>
      </Example>
    </Preview>
  );
}

export function DirectionLinksPreview() {
  return (
    <Preview>
      <Example title="Previous & up next">
        <ActionGroup>
          <DirectionLink direction="previous" href="#/foundations/typography" icon={<ArrowBack />}>
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
    </Preview>
  );
}
