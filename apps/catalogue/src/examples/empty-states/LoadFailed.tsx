import { useEffect, useRef, useState } from 'react';
import {
  Button,
  EmptyState,
  Column,
  Row,
  Surface,
  Table,
  Text,
  placeholders,
} from '@envsemble/envui';
import { Upload } from '@envsemble/envui/icons/Upload';

export default function LoadFailed() {
  const [state, setState] = useState<'failed' | 'loading' | 'loaded'>('failed');
  const heading = useRef<HTMLHeadingElement>(null);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const retry = () => {
    setState('loading');
    // The Try again button goes with the error, so focus moves to the region's heading.
    heading.current?.focus();
    // The documents load from a server; a timer stands in, and this time they arrive.
    timer.current = window.setTimeout(() => setState('loaded'), 1200);
  };

  return (
    <Column gap={4}>
      {/* The heading and the page's action stay whatever the table's state. */}
      <Row wrap align="center" justify="between" gap={3}>
        <Text render={<h3 ref={heading} tabIndex={-1} />} variant="title">
          Documents
        </Text>
        <Button variant="secondary" size="sm" startIcon={<Upload />} href="/documents/upload">
          Upload document
        </Button>
      </Row>
      {state !== 'failed' ? (
        // While the documents load, the same table is a skeleton over placeholder rows.
        <Table.Root aria-label="Documents" skeleton={state === 'loading'}>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Owner</Table.HeaderCell>
              <Table.HeaderCell numeric>Size</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {(state === 'loaded' ? documents : placeholders<Document>(3)).map((item, row) => (
              <Table.Row key={item.name ?? row}>
                <Table.Cell>{item.name}</Table.Cell>
                <Table.Cell>{item.owner}</Table.Cell>
                <Table.Cell numeric nowrap>
                  {item.size}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      ) : (
        // In place of the table, in the space it takes. envUI has no region height for an
        // example: the surface gives the state that space.
        <Surface
          background="default"
          padding={0}
          style={{ display: 'grid', minBlockSize: '14rem' }}
        >
          <EmptyState
            align="center"
            tone="danger"
            title="Couldn’t load documents"
            description="Your documents are safe. Check your connection and try again."
            action={
              <Button variant="secondary" onClick={retry}>
                Try again
              </Button>
            }
          />
        </Surface>
      )}
    </Column>
  );
}

interface Document {
  name: string;
  owner: string;
  size: string;
}

const documents: Document[] = [
  { name: 'Launch brief', owner: 'Alex Morgan', size: '84 KB' },
  { name: 'Budget 2026', owner: 'Priya Shah', size: '310 KB' },
  { name: 'Meeting notes', owner: 'Sam Lee', size: '12 KB' },
];
