import type { CSSProperties } from 'react';
import { Button, Column, Page, Scaffold, TopBar, Text } from '@envsemble/envui';
import { NoteAdd } from '@envsemble/envui/icons/NoteAdd';

/** Stands in for the window: a Scaffold fills its container, the window's height by default. */
const preview: CSSProperties = { blockSize: '20rem' };

export default function StartPageWindow() {
  return (
    // A window without navigation: the title bar across the top, and the body scrolling below it,
    // so the window controls drawn over the title bar never cover a scrollbar.
    <Scaffold
      scroll="body"
      landmarks={false}
      style={preview}
      topBarSpan="full"
      topBar={<TopBar titleBar title="Northwind Notes" />}
    >
      <Page width="sm">
        <Column align="center">
          <Column
            gap={4}
            padding={5}
            align="center"
            justify="center"
            style={{ textAlign: 'center' }}
          >
            <Text render={<span />} emphasis="muted">
              <NoteAdd width="2.5rem" height="2.5rem" />
            </Text>
            <Column gap={2} align="center" style={{ maxInlineSize: '30rem' }}>
              <Text render={<h3 />} variant="title">
                Start writing
              </Text>
              <Text variant="body-sm">Your notes stay on this device until you share them.</Text>
            </Column>
            <Button>New note</Button>
          </Column>
        </Column>
      </Page>
    </Scaffold>
  );
}
