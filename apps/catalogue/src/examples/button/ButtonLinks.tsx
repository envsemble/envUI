import { ActionGroup, Button } from '@envsemble/envui';

export default function ButtonLinks() {
  return (
    <ActionGroup>
      <Button href="/projects">Open projects</Button>
      <Button variant="text" href="/help">
        Read help
      </Button>
      <Button variant="text" href="/guide" underline>
        Read the guide
      </Button>
    </ActionGroup>
  );
}
