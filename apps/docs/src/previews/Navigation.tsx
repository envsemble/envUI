import { useState } from 'react';
import {
  Text,
  Button,
  IconButton,
  NavigationItem,
  DirectionLinks,
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
import { controlStates } from './InteractionStates';

const navigationSizes = ['standard', 'compact'] as const;
const navigationForms = [
  { value: 'label', title: 'Label' },
  { value: 'icon', title: 'Icon + label' },
  { value: 'icon-only', title: 'Icon only' },
] as const;
const navigationDestinations = [
  { label: 'Home', icon: Home },
  { label: 'Projects', icon: Apps },
] as const;

function NavigationStates() {
  return (
    <div
      className="docs-matrix-scroll"
      tabIndex={0}
      role="region"
      aria-label="Navigation item interaction states"
    >
      <table className="docs-matrix">
        <thead>
          <tr>
            <th scope="col">Selection</th>
            {controlStates.map((state) => (
              <th scope="col" key={state.title}>
                {state.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[false, true].map((selected) => (
            <tr key={String(selected)}>
              <th scope="row">{selected ? 'Selected' : 'Unselected'}</th>
              {controlStates.map((state) => (
                <td key={state.title}>
                  <NavigationItem
                    selected={selected}
                    disabled={state.disabled}
                    className={state.className}
                    inert
                  >
                    Home
                  </NavigationItem>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function NavigationPreview() {
  const [selectedDestination, setSelectedDestination] = useState('Home');
  return (
    <Preview>
      <Example
        title="Variants"
        size="wide"
        caption="Selected items fill their Material icon automatically."
      >
        <div
          className="docs-matrix-scroll"
          tabIndex={0}
          role="region"
          aria-label="Navigation item sizes and icons"
        >
          <table className="docs-matrix">
            <thead>
              <tr>
                <th scope="col">Size</th>
                {navigationForms.map((form) => (
                  <th scope="col" key={form.value}>
                    {form.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {navigationSizes.map((size) => (
                <tr key={size}>
                  <th scope="row">{size}</th>
                  {navigationForms.map((form) => (
                    <td key={form.value}>
                      <ActionGroup>
                        {navigationDestinations.map((destination) => {
                          const props = {
                            size,
                            selected: selectedDestination === destination.label,
                            onClick: () => setSelectedDestination(destination.label),
                          };
                          return form.value === 'icon-only' ? (
                            <NavigationItem
                              {...props}
                              key={destination.label}
                              iconOnly
                              icon={<destination.icon />}
                              aria-label={destination.label}
                            />
                          ) : (
                            <NavigationItem
                              {...props}
                              key={destination.label}
                              icon={form.value === 'icon' ? <destination.icon /> : undefined}
                            >
                              {destination.label}
                            </NavigationItem>
                          );
                        })}
                      </ActionGroup>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Example>
      <Example size="wide">
        <details className="docs-interaction-states">
          <summary>Interaction states</summary>
          <NavigationStates />
        </details>
      </Example>
    </Preview>
  );
}

export function TabsPreview() {
  const [projectView, setProjectView] = useState<string | null>('summary');
  const [buttonStyle, setButtonStyle] = useState<string | null>('primary');
  const [iconView, setIconView] = useState<string | null>('home');
  const [workspaceView, setWorkspaceView] = useState<string | null>('home');
  return (
    <Preview>
      <Example
        title="Project views"
        size="content"
        caption="Arrow keys switch views; disabled tabs are skipped."
      >
        <Tabs
          aria-label="Example project views"
          value={projectView}
          onValueChange={setProjectView}
          keepMounted
          items={[
            {
              value: 'summary',
              button: <Button>Summary</Button>,
              content: (
                <Stack gap={2}>
                  <Text as="h3" variant="section-heading">
                    Project summary
                  </Text>
                  <Text>A shared space for project plans and notes.</Text>
                </Stack>
              ),
            },
            {
              value: 'details',
              button: <Button>Details</Button>,
              content: (
                <Stack gap={2}>
                  <Text as="h3" variant="section-heading">
                    Project details
                  </Text>
                  <Text>The project is ready for review.</Text>
                </Stack>
              ),
            },
            {
              value: 'activity',
              button: <Button>Activity</Button>,
              content: (
                <Stack gap={2}>
                  <Text as="h3" variant="section-heading">
                    Recent activity
                  </Text>
                  <Text>The draft was updated today.</Text>
                </Stack>
              ),
            },
          ]}
        />
      </Example>
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
                  button: (
                    <IconButton variant="primary" icon={<Search />} aria-label="Search view" />
                  ),
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
          <Specimen title="Navigation buttons">
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
  const [selectedDestination, setSelectedDestination] = useState('');
  const destination = (title: string) => ({
    href: location.href,
    children: title,
    onClick: () => setSelectedDestination(title),
  });
  return (
    <Preview>
      <Example title="Previous & up next">
        <DirectionLinks
          aria-label="Paired destinations example"
          previous={{ ...destination('Typography'), icon: <ArrowBack /> }}
          next={{ ...destination('Spacing & shape'), icon: <ArrowForward /> }}
        />
      </Example>
      <Example title="Next only, without an icon">
        <DirectionLinks aria-label="Next-only example" next={destination('Getting started')} />
      </Example>
      <Example title="Previous only">
        <DirectionLinks
          aria-label="Previous-only example"
          previous={{ ...destination('Typography'), icon: <ArrowBack /> }}
        />
      </Example>
      <Example title="Long destinations in a narrow container">
        <div className="docs-narrow-actions">
          <DirectionLinks
            aria-label="Long destinations example"
            previous={{ ...destination('Typography & readable content'), icon: <ArrowBack /> }}
            next={{
              ...destination('Motion & accessibility across the component library'),
              icon: <ArrowForward />,
            }}
          />
        </div>
      </Example>
      <Text variant="caption" aria-live="polite">
        {selectedDestination ? `${selectedDestination} link selected.` : ''}
      </Text>
    </Preview>
  );
}
