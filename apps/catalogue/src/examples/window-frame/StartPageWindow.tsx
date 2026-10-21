import type { CSSProperties } from 'react';
import { Button, Column, EmptyState, Page, Scaffold, TopBar } from '@envsemble/envui';
import { NoteAdd } from '@envsemble/envui/icons/NoteAdd';

/** Stands in for the window: a Scaffold fills its container, the window's height by default. */
const preview: CSSProperties = { blockSize: '20rem' };

export default function StartPageWindow() {
  return (
    // A window without navigation: the title bar across the top, and the body scrolling below it,
    // so the window controls drawn over the title bar never cover a scrollbar.
    <Scaffold
      landmarks={false}
      style={preview}
      topBarSpan="full"
      topBar={<TopBar titleBar title="Northwind Notes" />}
    >
      <Page width="sm">
        <Column align="center">
          <EmptyState
            align="center"
            icon={<NoteAdd />}
            title="Start writing"
            description="Your notes stay on this device until you share them."
            headingLevel={2}
            action={<Button>New note</Button>}
          />
        </Column>
      </Page>
    </Scaffold>
  );
}
