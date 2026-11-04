import type { CSSProperties } from 'react';
import { Button, Column, Page, Scaffold, Text, TopBar } from '@envsemble/envui';
import { IconSearchOff } from '@envsemble/envui/icons/SearchOff';

/** Stands in for the window: a Scaffold fills its container, the window's height by default. */
const preview: CSSProperties = { blockSize: '22rem' };

export default function WholePage() {
  return (
    // The frame stays, so people keep the way to every other place; only the page says what's wrong.
    <Scaffold scroll="body" landmarks={false} style={preview} topBar={<TopBar title="Northwind" />}>
      <Page>
        {/* Centred in the room the page would take, with a larger icon. */}
        <Column gap={4} padding={5} align="center" justify="center" style={{ textAlign: 'center' }}>
          <Text render={<span />} emphasis="muted">
            <IconSearchOff width="2.5rem" height="2.5rem" />
          </Text>
          <Column gap={2} align="center" style={{ maxInlineSize: '30rem' }}>
            {/* The page's heading: its one h1 in an application, h3 inside this page of examples. */}
            <Text render={<h3 />} variant="title">
              Page not found
            </Text>
            <Text variant="body-sm">
              The address may be mistyped, or the page may have moved. Check it, or go back to Home.
            </Text>
          </Column>
          <Button variant="secondary" href="#home">
            Go to Home
          </Button>
        </Column>
      </Page>
    </Scaffold>
  );
}
