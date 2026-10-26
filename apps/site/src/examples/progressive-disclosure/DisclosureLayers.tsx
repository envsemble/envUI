import {
  Button,
  Checkbox,
  Column,
  Disclosure,
  IconButton,
  Menu,
  Row,
  TextField,
} from '@envsemble/envui';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';

export default function DisclosureLayers() {
  return (
    <Column gap={4} style={{ inlineSize: 'min(100%, 22rem)' }}>
      <TextField label="File name" defaultValue="quarterly-report" />
      <Disclosure title="Advanced options" defaultOpen>
        <Checkbox label="Include archived projects" />
      </Disclosure>
      <Row gap={2} align="center">
        <Button variant="primary">Export</Button>
        <Menu.Root
          aria-label="More actions"
          trigger={<IconButton icon={<MoreVert />} aria-label="More actions" />}
        >
          <Menu.Item>Schedule export</Menu.Item>
        </Menu.Root>
      </Row>
    </Column>
  );
}
