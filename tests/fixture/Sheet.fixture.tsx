import { useRef, useState } from 'react';
import {
  Button,
  DialogClose,
  NavigationDrawer,
  Sheet,
  Column,
  Row,
  Text,
  TextField,
  type DialogOpenChangeReason,
} from '@envsemble/envui';

export const mount = 'standalone';

/**
 * Side sheets at both edges, named by a title or by aria-label, one holding a NavigationDrawer, one whose
 * first element is a field,
 * one in right-to-left text, a bottom sheet, and two taller than the window.
 */
export default function SheetFixture() {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<DialogOpenChangeReason | ''>('');
  const main = useRef<HTMLElement>(null);
  const [sheetWidth, setSheetWidth] = useState(30);
  const [committedWidth, setCommittedWidth] = useState<number>();
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
          <NavigationDrawer
            aria-label="Sections"
            destinations={[
              { label: 'Overview', href: '#overview', current: true },
              { label: 'People', href: '#people' },
            ]}
          />
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
      <Row wrap gap={3}>
        {/* Taller than a short window: their bodies scroll, between the heading and the actions. */}
        {(['end', 'bottom'] as const).map((side) => (
          <Sheet
            key={side}
            side={side}
            title={`Long ${side}`}
            trigger={<Button variant="secondary">{`Open long ${side}`}</Button>}
            actions={<DialogClose variant="primary">Show 5 projects</DialogClose>}
          >
            <TextField label="Owner" name="owner" />
            <div style={{ blockSize: '150vh' }}>
              <Text>A long list.</Text>
            </div>
          </Sheet>
        ))}
      </Row>
      <div dir="rtl">
        <Sheet title="Details" trigger={<Button variant="secondary">Open details rtl</Button>}>
          <Text>In right-to-left text.</Text>
        </Sheet>
      </div>
      <Row wrap gap={3}>
        <Sheet
          title="Resizable"
          resizable
          trigger={<Button variant="secondary">Open resizable</Button>}
        >
          <Text>Drag the inner edge.</Text>
        </Sheet>
        <Sheet
          title="Kept width"
          side="start"
          resizable
          width={sheetWidth}
          onWidthChange={(next, details) => {
            setSheetWidth(next);
            if (details.committed) setCommittedWidth(next);
          }}
          trigger={<Button variant="secondary">Open kept width</Button>}
        >
          {/* Taller than the window, so the sheet scrolls. */}
          <div style={{ blockSize: '150vh' }}>
            <Text>A long list.</Text>
          </div>
        </Sheet>
        {/* A CSS length, which a resizable sheet ignores and warns of while developing. */}
        <Sheet
          title="Resizable css width"
          resizable
          width="min(30rem, 90%)"
          trigger={<Button variant="secondary">Open resizable css width</Button>}
        >
          <Text>Starts at the default width.</Text>
        </Sheet>
        <div dir="rtl">
          <Sheet
            title="Resizable rtl"
            resizable
            trigger={<Button variant="secondary">Open resizable rtl</Button>}
          >
            <Text>In right-to-left text.</Text>
          </Sheet>
        </div>
        <Sheet
          side="bottom"
          title="Bottom resizable"
          resizable
          trigger={<Button variant="secondary">Open bottom resizable</Button>}
        >
          <Text>A bottom sheet doesn't resize.</Text>
        </Sheet>
        <output data-testid="sheet-width">{sheetWidth}</output>
        <output data-testid="sheet-committed">{committedWidth ?? ''}</output>
      </Row>
      <main ref={main} tabIndex={-1} data-testid="sheet-main">
        <output data-testid="sheet-reason">{reason}</output>
      </main>
    </Column>
  );
}
