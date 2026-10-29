import { useId } from 'react';
import { Button, Column, Menu, Text } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconGroups3 } from '@envsemble/envui/icons/Groups3';
import { IconUnfoldMore } from '@envsemble/envui/icons/UnfoldMore';

export default function OrganizationSwitcherAnatomy() {
  const headingId = useId();
  return (
    <Menu.Root
      aria-label="Organizations"
      align="start"
      defaultOpen
      trigger={
        <Button variant="secondary" endIcon={<IconUnfoldMore />}>
          Northwind Labs
        </Button>
      }
    >
      <Menu.Header>
        <Column align="center" gap={2} padding={3}>
          <IconGroups3 width="2rem" height="2rem" />
          <Text variant="headline" id={headingId}>
            Organizations
          </Text>
        </Column>
      </Menu.Header>
      <Menu.RadioGroup aria-labelledby={headingId} value="northwind" onValueChange={() => {}}>
        <Menu.RadioItem value="northwind" description="Admin">
          Northwind Labs
        </Menu.RadioItem>
        <Menu.RadioItem value="contoso" description="Member">
          Contoso
        </Menu.RadioItem>
      </Menu.RadioGroup>
      <Menu.Separator />
      <Menu.Item icon={<IconAdd />}>Create organization</Menu.Item>
    </Menu.Root>
  );
}
