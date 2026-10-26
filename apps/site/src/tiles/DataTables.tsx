import { useState } from 'react';
import { Checkbox, Column, Link, Row, Table, Text, Toolbar } from '@envsemble/envui';
import { Archive } from '@envsemble/envui/icons/Archive';
import { Delete } from '@envsemble/envui/icons/Delete';
import { usePointer, type PointerStep } from '../previews/Motion';

const projects = [
  { id: 'website', name: 'Website refresh', tasks: 12 },
  { id: 'report', name: 'Quarterly report', tasks: 5 },
  { id: 'migration', name: 'Data migration', tasks: 8 },
];

const select = (name: string) => `[aria-label="Select ${name}"]`;
const sort = '.env-table-sort-button';

/*
 * A second row selected, which the bar counts; the names sorted the other way and back, the
 * selection going with its rows; the row let go again.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: select('Website refresh') },
  { wait: 400 },
  { click: true },
  { wait: 1000 },
  { to: sort, duration: 500 },
  { wait: 300 },
  { click: true },
  { wait: 1300 },
  { click: true },
  { wait: 1000 },
  { to: select('Website refresh'), duration: 500 },
  { wait: 300 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 500 },
];

const count = (selected: number) => (selected === 1 ? '1 project' : `${selected} projects`);

/** A table of projects, sortable by name, whose selected rows a bar counts and acts on. */
export default function DataTablesTile() {
  const [direction, setDirection] = useState<Table.SortDirection>('ascending');
  const [selected, setSelected] = useState(['report']);
  usePointer(script);
  const rows = [...projects].sort(
    (a, b) => a.name.localeCompare(b.name) * (direction === 'ascending' ? 1 : -1),
  );
  const all = selected.length === projects.length;
  return (
    <Column gap={3} style={{ inlineSize: '16rem' }}>
      <Row align="center" gap={3}>
        <Text>{selected.length} selected</Text>
        <Toolbar.Root aria-label="Selected projects">
          <Toolbar.Button icon={<Archive />} label={`Archive ${count(selected.length)}`} />
          <Toolbar.Button icon={<Delete />} label={`Delete ${count(selected.length)}…`} />
        </Toolbar.Root>
      </Row>
      <Table.Root aria-label="Projects" defaultColumnWidths={[14, 60, 26]}>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>
              <Checkbox
                aria-label="Select all projects"
                checked={all ? true : selected.length > 0 ? 'mixed' : false}
                onCheckedChange={(checked) =>
                  setSelected(checked && !all ? projects.map((project) => project.id) : [])
                }
              />
            </Table.HeaderCell>
            <Table.HeaderCell sortDirection={direction} onSortChange={setDirection}>
              Name
            </Table.HeaderCell>
            <Table.HeaderCell numeric>Tasks</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {rows.map((project) => (
            <Table.Row key={project.id} selected={selected.includes(project.id)}>
              <Table.Cell>
                <Checkbox
                  aria-label={`Select ${project.name}`}
                  checked={selected.includes(project.id)}
                  onCheckedChange={(checked) =>
                    setSelected((current) =>
                      checked
                        ? [...current, project.id]
                        : current.filter((id) => id !== project.id),
                    )
                  }
                />
              </Table.Cell>
              <Table.Cell>
                <Link href={`#${project.id}`} onClick={(event) => event.preventDefault()}>
                  {project.name}
                </Link>
              </Table.Cell>
              <Table.Cell numeric>{project.tasks}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Column>
  );
}
