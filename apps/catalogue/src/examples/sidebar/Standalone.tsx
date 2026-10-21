import { NavList, Sidebar, SidebarTrigger, Column, Row, Text, TextField } from '@envsemble/envui';
import { Lock } from '@envsemble/envui/icons/Lock';
import { Person } from '@envsemble/envui/icons/Person';
import { Tune } from '@envsemble/envui/icons/Tune';

export default function Standalone() {
  return (
    <Sidebar.Provider>
      <Column gap={3}>
        <Row align="center" gap={2}>
          <SidebarTrigger />
          <Text variant="title">Settings</Text>
        </Row>
        <Row gap={4}>
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
          <Column gap={3} style={{ flex: 1 }}>
            <TextField label="Display name" defaultValue="Alex Morgan" />
          </Column>
        </Row>
      </Column>
    </Sidebar.Provider>
  );
}
