import { useState } from 'react';
import { Drawer, SearchField, type Destination } from '@envsemble/envui';
import { Folder } from '@envsemble/envui/icons/Folder';

const projects = [
  'Website refresh',
  'Quarterly report',
  'Onboarding guide',
  'Mobile release',
  'Data migration',
];

export default function SearchInSidebar() {
  const [query, setQuery] = useState('');
  // The router knows the current page; here a press stands in for it.
  const [current, setCurrent] = useState(projects[0]);
  const destinations: Destination[] = projects
    .filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()))
    .map((name) => ({
      label: name,
      icon: <Folder />,
      href: `/projects/${name.toLowerCase().replaceAll(' ', '-')}`,
      current: current === name,
      onClick: () => setCurrent(name),
    }));
  return (
    <Drawer
      aria-label="Projects"
      destinations={destinations}
      header={
        <SearchField
          variant="ghost"
          label="Find a project"
          placeholder="Find a project"
          value={query}
          onValueChange={setQuery}
        />
      }
    />
  );
}
