import { useState } from 'react';
import { IconButton, NavigationDrawer, type NavigationDrawerDestination } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { IconFolder } from '@envsemble/envui/icons/Folder';

export default function GroupActions() {
  const [projects, setProjects] = useState(['Website refresh', 'Mobile app']);
  const [current, setCurrent] = useState('Website refresh');
  const destinations: NavigationDrawerDestination[] = [
    ...projects.map((name) => ({
      label: name,
      group: 'Projects',
      icon: <IconFolder />,
      current: current === name,
      onClick: () => setCurrent(name),
    })),
    {
      label: 'Roadmap',
      group: 'Documents',
      icon: <IconDescription />,
      current: current === 'Roadmap',
      onClick: () => setCurrent('Roadmap'),
    },
  ];
  return (
    <NavigationDrawer
      aria-label="Workspace"
      destinations={destinations}
      groupEnd={(group) =>
        group === 'Projects' && (
          <IconButton
            variant="ghost"
            size="sm"
            icon={<IconAdd />}
            aria-label="New project"
            onClick={() => setProjects((names) => [...names, `Project ${names.length + 1}`])}
          />
        )
      }
    />
  );
}
