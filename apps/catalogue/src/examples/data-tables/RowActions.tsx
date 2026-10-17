import { useRef, useState } from 'react';
import {
  Avatar,
  ConfirmDialog,
  IconButton,
  Link,
  Menu,
  Stack,
  Table,
  Tooltip,
} from '@envsemble/envui';
import { Delete } from '@envsemble/envui/icons/Delete';
import { FileCopy } from '@envsemble/envui/icons/FileCopy';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';

interface Project {
  id: string;
  name: string;
  owner: string;
}

export default function RowActions() {
  const [projects, setProjects] = useState(initialProjects);
  const [confirming, setConfirming] = useState(false);
  // The project the dialog asks about; it stays while the dialog closes.
  const [target, setTarget] = useState<Project | null>(null);
  const body = useRef<HTMLTableSectionElement>(null);
  // Where focus goes when the dialog closes: the menu button that opened it, or, once its row is
  // deleted, the next row's menu button.
  const returnFocus = useRef<HTMLElement | null>(null);

  const menuButtons = () =>
    Array.from(body.current?.querySelectorAll<HTMLElement>('[aria-haspopup="menu"]') ?? []);

  const confirmDelete = () => {
    if (!target) return;
    const index = projects.indexOf(target);
    const others = menuButtons().filter((_, position) => position !== index);
    returnFocus.current = others[Math.min(index, others.length - 1)] ?? null;
    // The project is deleted on a server; the application would return its promise here, so the
    // dialog waits for it.
    setProjects((current) => current.filter((project) => project.id !== target.id));
  };

  return (
    <>
      <Table.Root aria-label="Projects">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Owner</Table.HeaderCell>
            <Table.HeaderCell align="end">Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body ref={body}>
          {projects.map((project, index) => (
            <Table.Row key={project.id} interactive>
              {/* One link per row, on its name, opens the project. */}
              <Table.Cell>
                <Link href={`/projects/${project.id}`}>{project.name}</Link>
              </Table.Cell>
              <Table.Cell nowrap>
                <Stack direction="row" align="center" gap={2}>
                  <Avatar name={project.owner} size="sm" fallback="initials" />
                  {project.owner}
                </Stack>
              </Table.Cell>
              {/* The other actions wait in the row's menu, named for its row. */}
              <Table.Cell align="end">
                <Menu.Root
                  aria-label={`Actions for ${project.name}`}
                  trigger={
                    // The Tooltip shows the icon-only trigger's name and passes the menu's props on.
                    <Tooltip content="More actions">
                      <IconButton
                        variant="ghost"
                        icon={<MoreVert />}
                        aria-label={`More actions for ${project.name}`}
                      />
                    </Tooltip>
                  }
                >
                  <Menu.Item
                    icon={<FileCopy />}
                    onClick={() =>
                      setProjects((current) => [
                        ...current.slice(0, index + 1),
                        { ...project, id: crypto.randomUUID(), name: `${project.name} (copy)` },
                        ...current.slice(index + 1),
                      ])
                    }
                  >
                    Duplicate
                  </Menu.Item>
                  <Menu.Separator />
                  {/* envUI has no danger menu item yet: the label names the consequence, and the
                      ellipsis says a confirmation follows. */}
                  <Menu.Item
                    icon={<Delete />}
                    onClick={() => {
                      returnFocus.current = menuButtons()[index] ?? null;
                      setTarget(project);
                      setConfirming(true);
                    }}
                  >
                    Delete project…
                  </Menu.Item>
                </Menu.Root>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        tone="danger"
        title={`Delete ${target?.name ?? 'project'}?`}
        description="This deletes the project with its documents and tasks for everyone. You can’t undo this."
        confirmLabel="Delete project"
        finalFocus={returnFocus}
        onConfirm={confirmDelete}
      />
    </>
  );
}

const initialProjects: Project[] = [
  { id: 'website-refresh', name: 'Website refresh', owner: 'Priya Shah' },
  { id: 'quarterly-report', name: 'Quarterly report', owner: 'Sam Lee' },
  { id: 'onboarding-guide', name: 'Onboarding guide', owner: 'Jordan Kim' },
  { id: 'mobile-release', name: 'Mobile release', owner: 'Chen Wei' },
];
