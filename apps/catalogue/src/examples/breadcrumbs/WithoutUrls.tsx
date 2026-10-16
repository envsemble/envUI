import { useRef, useState } from 'react';
import { Breadcrumbs, Button, List, Stack, Text } from '@envsemble/envui';

const folders: Record<string, string[]> = {
  Workspace: ['Plans', 'Notes'],
  Plans: ['Research', 'Roadmap'],
  Research: ['Interviews', 'Surveys'],
  Notes: [],
  Roadmap: [],
  Interviews: [],
  Surveys: [],
};

export default function WithoutUrls() {
  const [path, setPath] = useState(['Workspace', 'Plans', 'Research']);
  const heading = useRef<HTMLHeadingElement>(null);
  const folder = path[path.length - 1];
  const open = (next: string[]) => {
    setPath(next);
    // The pressed crumb becomes the current page, which is not a control: focus moves to the title.
    requestAnimationFrame(() => heading.current?.focus());
  };
  return (
    <Stack gap={3}>
      <Breadcrumbs
        aria-label="Folder"
        items={path.map((name, index) => ({
          label: name,
          onClick: () => open(path.slice(0, index + 1)),
        }))}
      />
      <Text render={<h3 />} variant="title" ref={heading} tabIndex={-1}>
        {folder}
      </Text>
      {folders[folder].length > 0 ? (
        <List.Root aria-label={`Folders in ${folder}`}>
          {folders[folder].map((name) => (
            <List.Item
              key={name}
              label={name}
              action={
                <Button
                  variant="text"
                  aria-label={`Open ${name}`}
                  onClick={() => open([...path, name])}
                >
                  Open
                </Button>
              }
            />
          ))}
        </List.Root>
      ) : (
        <Text emphasis="muted">This folder is empty.</Text>
      )}
    </Stack>
  );
}
