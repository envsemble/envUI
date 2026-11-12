import { Button, Tabs } from '@envsemble/envui';

export const mount = 'standalone';

const views = ['Summary', 'Files', 'Activity', 'Members', 'Settings'];

/**
 * A rail with more tabs than fit, its first tab chosen, in a narrow frame that is positioned and set
 * in from the page's start.
 */
export default function TabsScrollingFixture() {
  return (
    <div
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        paddingInlineStart: '20rem',
        inlineSize: '40rem',
      }}
    >
      <Tabs
        aria-label="Project views"
        items={views.map((view) => ({
          value: view,
          button: <Button>{view}</Button>,
          content: null,
        }))}
      />
    </div>
  );
}
