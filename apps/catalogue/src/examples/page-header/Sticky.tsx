import type { CSSProperties } from 'react';
import { Button, Page, PageHeader, Column, Text } from '@envsemble/envui';

const sections = ['Summary', 'Revenue', 'Costs', 'Outlook'];

export default function Sticky() {
  return (
    // A scrolling box stands in for the application's main region.
    <div
      style={
        {
          blockSize: '18rem',
          overflow: 'auto',
          // In a box of its own that scrolls, the header sticks at the box's top edge.
          '--env-frame-sticky-top': '0px',
        } as CSSProperties
      }
    >
      <Page
        width="md"
        header={
          // Level 2 under this page's own heading; a page's own header keeps the default, 1.
          <PageHeader
            headingLevel={2}
            sticky
            title="Annual report"
            actions={<Button variant="secondary">Download</Button>}
          />
        }
      >
        <Column gap={6}>
          {sections.map((section) => (
            <Column key={section} gap={2} render={<section />}>
              <Text variant="title" render={<h3 />}>
                {section}
              </Text>
              <Text>
                The header stays at the top of the page as it scrolls, and publishes its height as
                --env-page-header-block-size for content that sticks below it.
              </Text>
            </Column>
          ))}
        </Column>
      </Page>
    </div>
  );
}
