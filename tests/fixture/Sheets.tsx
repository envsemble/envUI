import { useRef, useState } from 'react';
import {
  Button,
  DialogClose,
  Sheet,
  Link,
  Column,
  Row,
  Text,
  TextField,
  type DialogOpenChangeReason,
} from '@envsemble/envui';

/**
 * Side sheets at both edges, named by a title or by aria-label, one whose first element is a field,
 * one in right-to-left text, and a bottom sheet.
 */
export function SheetsFixture() {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<DialogOpenChangeReason | ''>('');
  const main = useRef<HTMLElement>(null);
  return (
    <Column gap={4} className="fixture-section">
      <Row wrap gap={3}>
        <Sheet
          title="Filters"
          description="Narrow the list."
          trigger={<Button variant="secondary">Open filters</Button>}
          actions={<DialogClose variant="primary">Apply</DialogClose>}
        >
          <TextField label="Owner" name="owner" />
        </Sheet>
        <Sheet
          side="start"
          aria-label="Navigation"
          width="min(18rem, 100vw - 2rem)"
          trigger={<Button variant="secondary">Open navigation</Button>}
        >
          <nav aria-label="Sections">
            <Column gap={2}>
              <Link href="#overview">Overview</Link>
              <Link href="#people">People</Link>
            </Column>
          </nav>
        </Sheet>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Open controlled
        </Button>
        <Sheet
          title="Controlled"
          width="lg"
          open={open}
          closeButton={false}
          onOpenChange={(next, details) => {
            setOpen(next);
            setReason(details.reason);
          }}
          finalFocus={main}
        >
          <Text>Opened by the application.</Text>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </Sheet>
        <Sheet
          title="Search"
          closeButton={false}
          trigger={<Button variant="secondary">Open search</Button>}
        >
          <TextField label="Query" name="query" />
        </Sheet>
      </Row>
      <Sheet
        side="bottom"
        title="Choices"
        trigger={<Button variant="secondary">Open choices</Button>}
      >
        <Text>Choose how to share.</Text>
      </Sheet>
      <div dir="rtl">
        <Sheet title="Details" trigger={<Button variant="secondary">Open details rtl</Button>}>
          <Text>In right-to-left text.</Text>
        </Sheet>
      </div>
      <main ref={main} tabIndex={-1} data-testid="sheet-main">
        <output data-testid="sheet-reason">{reason}</output>
      </main>
    </Column>
  );
}
