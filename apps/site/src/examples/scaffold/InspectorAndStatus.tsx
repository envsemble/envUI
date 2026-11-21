import {
  Column,
  NavigationDrawer,
  Page,
  PageHeader,
  Row,
  Surface,
  Text,
  TopBar,
  Scaffold,
  type Destination,
} from '@envsemble/envui';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { IconFolder } from '@envsemble/envui/icons/Folder';

const destinations: Destination[] = [
  { label: 'Files', icon: <IconDescription />, href: '/files', current: true },
  { label: 'Shared', icon: <IconFolder />, href: '/shared' },
];

export default function InspectorAndStatus() {
  return (
    <Scaffold
      scroll="body"
      landmarks={false}
      navigationForms={{ compact: 'none', medium: 'drawer' }}
      style={{ blockSize: '18rem' }}
      topBar={<TopBar title="Northwind" />}
      navigation={{
        drawer: (
          <NavigationDrawer aria-label="Main, with an inspector" destinations={destinations} />
        ),
      }}
      aside={
        <Surface
          render={<aside aria-label="Inspector" />}
          background="default"
          padding={4}
          style={{ inlineSize: '12rem', minBlockSize: '100%' }}
        >
          <Column gap={2}>
            <Text variant="title" render={<h3 />}>
              Inspector
            </Text>
            <Text emphasis="muted">launch-plan.md, 4 KB</Text>
          </Column>
        </Surface>
      }
      bottomBar={
        <Surface background="default" padding={2}>
          <Row gap={4}>
            <Text variant="caption">Synced</Text>
            <Text variant="caption">Ln 12, Col 4</Text>
          </Row>
        </Surface>
      }
    >
      <Page header={<PageHeader title="launch-plan.md" headingLevel={3} />}>
        <Text emphasis="muted">The plan for the Northwind launch.</Text>
      </Page>
    </Scaffold>
  );
}
