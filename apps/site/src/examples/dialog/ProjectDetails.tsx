import { Button, Dialog, Text } from '@envsemble/envui';

export default function ProjectDetails() {
  return (
    <Dialog
      trigger={<Button variant="secondary">View project</Button>}
      title="Northwind launch"
      description="Owned by Priya Shah · Due 14 November"
    >
      <Text>
        Plans, milestones and responsibilities for the launch, shared with everyone in the
        workspace.
      </Text>
    </Dialog>
  );
}
