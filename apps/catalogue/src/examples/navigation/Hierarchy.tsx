import { useRef, useState } from 'react';
import { Breadcrumbs, Link, List, PageHeader, Stack, Text } from '@envsemble/envui';

/** Moves focus to the page's heading, which takes focus without becoming a tab stop. */
function focusHeading(page: HTMLElement | null) {
  const heading = page?.querySelector<HTMLElement>('h1, h2, h3, h4, h5, h6');
  if (!heading) return;
  heading.tabIndex = -1;
  heading.focus();
}

/** An application path from the names of the levels: /projects/website-refresh/documents. */
const hrefOf = (path: string[]) =>
  `/${path.map((name) => name.toLowerCase().replaceAll(' ', '-')).join('/')}`;

export default function Hierarchy() {
  // The levels from the top to the page shown: the router knows them from the address.
  const [path, setPath] = useState(['Projects', 'Website refresh', 'Documents']);
  const page = useRef<HTMLDivElement>(null);
  const shown = path[path.length - 1];
  const contents = contentsOf(path);

  const open = (next: string[]) => {
    setPath(next);
    // The page changed, so focus moves to its heading.
    requestAnimationFrame(() => focusHeading(page.current));
  };

  return (
    <Stack ref={page} gap={4}>
      <PageHeader
        headingLevel={3}
        title={shown}
        description={descriptionOf(path)}
        breadcrumbs={
          // Every level above the page links to it; the last names the page and isn't a link.
          path.length > 1 ? (
            <Breadcrumbs
              wrap={false}
              items={path.map((name, index) =>
                index === path.length - 1
                  ? { label: name }
                  : {
                      label: name,
                      href: hrefOf(path.slice(0, index + 1)),
                      onClick: () => open(path.slice(0, index + 1)),
                    },
              )}
            />
          ) : undefined
        }
      />
      {contents.length > 0 ? (
        // A level lists what is inside it, each a link one level down.
        <List.Root aria-label={`In ${shown}`}>
          {contents.map((name) => (
            <List.Item
              key={name}
              label={
                <Link href={hrefOf([...path, name])} onClick={() => open([...path, name])}>
                  {name}
                </Link>
              }
            />
          ))}
        </List.Root>
      ) : (
        <Text emphasis="muted">The last level: {shown} itself, with nothing below it.</Text>
      )}
    </Stack>
  );
}

/** What each level holds: projects, then their sections, then the documents or tasks in them. */
function contentsOf(path: string[]): string[] {
  if (path.length === 1) return projects;
  if (path.length === 2) return ['Documents', 'Tasks'];
  if (path.length === 3) return path[2] === 'Documents' ? documents : tasks;
  return [];
}

function descriptionOf(path: string[]) {
  if (path.length === 1) return 'Every project at Northwind.';
  if (path.length === 2) return 'Owned by Priya Shah. Due 27 March 2026.';
  if (path.length === 3) return `The ${path[2].toLowerCase()} of ${path[1]}.`;
  return 'Edited by Sam Lee on 2 March 2026.';
}

const projects = ['Website refresh', 'Quarterly report', 'Onboarding guide'];
const documents = ['Launch plan', 'Page inventory', 'Style notes'];
const tasks = ['Write the home page', 'Review the page inventory'];
