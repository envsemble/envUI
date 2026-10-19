import { useState } from 'react';
import { Button, IconButton, NavList, Tabs, Text } from '@envsemble/envui';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Home } from '@envsemble/envui/icons/Home';
import { Search } from '@envsemble/envui/icons/Search';
import { Settings } from '@envsemble/envui/icons/Settings';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

/** Tabs built from each kind of control: button variants with a disabled tab, icons, navigation. */
export default function TabControls() {
  const [buttonStyle, setButtonStyle] = useState<string | null>('primary');
  const [iconView, setIconView] = useState<string | null>('home');
  const [workspaceView, setWorkspaceView] = useState<string | null>('home');
  return (
    <Example title="Tab controls" size="collection">
      <SpecimenGrid size="wide">
        <Specimen title="Button styles">
          <Tabs
            aria-label="Button style examples"
            value={buttonStyle}
            onValueChange={setButtonStyle}
            items={[
              {
                value: 'primary',
                button: <Button variant="primary">Primary</Button>,
                content: <Text>Primary button fill and label.</Text>,
              },
              {
                value: 'outlined',
                button: <Button variant="outline">Outlined</Button>,
                content: <Text>Outlined button fill, label and border.</Text>,
              },
              {
                value: 'important',
                button: (
                  <Button variant="primary" tone="accent">
                    Important
                  </Button>
                ),
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
        <Specimen title="Icon buttons">
          <Tabs
            aria-label="Icon views"
            value={iconView}
            onValueChange={setIconView}
            items={[
              {
                value: 'home',
                button: <IconButton variant="primary" icon={<Home />} aria-label="Home view" />,
                content: <Text>Home content</Text>,
              },
              {
                value: 'search',
                button: <IconButton variant="primary" icon={<Search />} aria-label="Search view" />,
                content: <Text>Search content</Text>,
              },
              {
                value: 'settings',
                button: (
                  <IconButton variant="primary" icon={<Settings />} aria-label="Settings view" />
                ),
                content: <Text>Settings content</Text>,
              },
            ]}
          />
        </Specimen>
        <Specimen title="Navigation items">
          <Tabs
            aria-label="Workspace views"
            value={workspaceView}
            onValueChange={setWorkspaceView}
            items={[
              {
                value: 'home',
                button: <NavList.Item icon={<Home />}>Home</NavList.Item>,
                content: <Text>Workspace overview</Text>,
              },
              {
                value: 'projects',
                button: <NavList.Item icon={<Apps />}>Projects</NavList.Item>,
                content: <Text>Workspace projects</Text>,
              },
            ]}
          />
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
