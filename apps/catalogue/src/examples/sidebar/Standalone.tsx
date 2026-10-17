import { NavList, Sidebar, SidebarTrigger, Stack, Text, TextField } from '@envsemble/envui';
import { Lock } from '@envsemble/envui/icons/Lock';
import { Person } from '@envsemble/envui/icons/Person';
import { Tune } from '@envsemble/envui/icons/Tune';

export default function Standalone() {
  return (
    <Sidebar.Provider>
      <Stack gap={3}>
        <Stack direction="row" align="center" gap={2}>
          <SidebarTrigger />
          <Text variant="title">Settings</Text>
        </Stack>
        <Stack direction="row" gap={4}>
          <Sidebar.Root label="Settings sections">
            <Sidebar.Content>
              <NavList.Root>
                <NavList.Item icon={<Person />} selected>
                  Profile
                </NavList.Item>
                <NavList.Item icon={<Lock />}>Security</NavList.Item>
                <NavList.Item icon={<Tune />}>Preferences</NavList.Item>
              </NavList.Root>
            </Sidebar.Content>
          </Sidebar.Root>
          <Stack gap={3} style={{ flex: 1 }}>
            <TextField label="Display name" defaultValue="Alex Morgan" />
          </Stack>
        </Stack>
      </Stack>
    </Sidebar.Provider>
  );
}
