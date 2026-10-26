import { useRef, useState } from 'react';
import { Button, Checkbox, ConfirmDialog, List, Column, Row, Text } from '@envsemble/envui';

/** "1 document", "3 documents": the count belongs in every label of the flow. */
const documentCount = (count: number) => (count === 1 ? '1 document' : `${count} documents`);

export default function BulkDelete() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState('');
  const list = useRef<HTMLUListElement>(null);
  // Where focus goes as the dialog closes: back to its button, or to the list once the button has
  // gone with the deleted selection.
  const returnFocus = useRef<HTMLElement | null>(null);
  const count = selected.length;
  const [confirming, setConfirming] = useState(false);
  // The count the dialog asks about; it stays while the dialog closes.
  const [asked, setAsked] = useState(0);

  const toggle = (id: string, checked: boolean) =>
    setSelected((current) => (checked ? [...current, id] : current.filter((item) => item !== id)));

  return (
    <Column gap={4}>
      {/* The bar shows the selection and what can be done with it; the button names the count. */}
      {/* It keeps the height of its buttons, so the list stays where it is as they come and go. */}
      <Row
        wrap
        align="center"
        justify="between"
        gap={3}
        style={{ minBlockSize: 'var(--env-control-height-sm)' }}
      >
        <Text role="status">{count ? `${count} selected` : result}</Text>
        {count > 0 && (
          <Row wrap gap={3}>
            <Button variant="secondary" size="sm" onClick={() => setSelected([])}>
              Clear selection
            </Button>
            <Button
              variant="outline"
              tone="danger"
              size="sm"
              onClick={(event) => {
                returnFocus.current = event.currentTarget;
                setAsked(count);
                setConfirming(true);
              }}
            >
              {`Delete ${documentCount(count)}…`}
            </Button>
          </Row>
        )}
      </Row>
      <List.Root ref={list} aria-label="Documents" tabIndex={-1}>
        {documents.map((item) => (
          <List.Item
            key={item.id}
            start={
              <Checkbox
                aria-label={`Select ${item.name}`}
                checked={selected.includes(item.id)}
                onCheckedChange={(checked) => toggle(item.id, checked)}
              />
            }
            label={item.name}
            description={`Edited by ${item.editor}`}
          />
        ))}
        {documents.length === 0 && <List.Item label="No documents." />}
      </List.Root>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        tone="danger"
        title={`Delete ${documentCount(asked)}?`}
        description="This deletes them and their comments for everyone. You can’t undo this."
        confirmLabel={`Delete ${documentCount(asked)}`}
        finalFocus={returnFocus}
        onConfirm={() => {
          // The documents are deleted on a server; the application would return its promise here.
          returnFocus.current = list.current;
          setDocuments((current) => current.filter((item) => !selected.includes(item.id)));
          setResult(`${documentCount(selected.length)} deleted.`);
          setSelected([]);
        }}
      />
    </Column>
  );
}

const initialDocuments = [
  { id: 'brief', name: 'Launch brief', editor: 'Alex Morgan' },
  { id: 'notes', name: 'Meeting notes', editor: 'Sam Lee' },
  { id: 'draft', name: 'Draft agenda', editor: 'Jordan Kim' },
  { id: 'budget', name: 'Budget 2026', editor: 'Priya Shah' },
];
