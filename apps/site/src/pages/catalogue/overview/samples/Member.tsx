import {
  Avatar,
  Badge,
  Button,
  Card,
  Switch,
  TextField,
} from '@envsemble/envui';

export const Member = () => (
  <Card
    title="Priya Shah"
    description="Product designer at Northwind"
    meta={<Badge tone="primary">Admin</Badge>}
    headerEnd={<Avatar name="Priya Shah" />}
    actions={<Button>Save changes</Button>}
  >
    <TextField label="Role" defaultValue="Designer" />
    <Switch label="Can publish" defaultChecked />
  </Card>
);
