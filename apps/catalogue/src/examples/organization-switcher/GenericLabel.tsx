import { Button, Menu } from '@envsemble/envui';
import { UnfoldMore } from '@envsemble/envui/icons/UnfoldMore';

export default function GenericLabel() {
  return (
    <Menu.Root
      aria-label="Organizations"
      trigger={
        <Button variant="secondary" endIcon={<UnfoldMore />}>
          Switch organization
        </Button>
      }
    >
      <Menu.RadioGroup label="Organizations" value="northwind" onValueChange={() => {}}>
        <Menu.RadioItem value="northwind">Northwind Labs</Menu.RadioItem>
        <Menu.RadioItem value="contoso">Contoso</Menu.RadioItem>
      </Menu.RadioGroup>
    </Menu.Root>
  );
}
