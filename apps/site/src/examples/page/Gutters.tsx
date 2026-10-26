import { Page, Surface, Text } from '@envsemble/envui';

export default function Gutters() {
  return (
    // The gutter follows the window class of the region the page sits in: 1 rem in a compact one,
    // 1.5 rem from medium.
    <Surface background="muted" padding={0}>
      <Page width="md">
        <Surface background="default" padding={4}>
          <Text>The page's content, inside its gutters.</Text>
        </Surface>
      </Page>
    </Surface>
  );
}
