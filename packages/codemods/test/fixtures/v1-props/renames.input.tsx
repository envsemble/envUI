import {
  AnimatedNumber,
  Avatar,
  Card,
  Combobox,
  OrganizationSwitcher,
  PanelDock,
} from '@envsemble/envui';

export function Renames({ people, organizations, panels, price, name }) {
  return (
    <>
      <Card heading="Pricing research" headingLevel={2}>
        Interviews from twelve teams.
      </Card>
      <Card heading={name} />
      <Avatar name="Sam Lee" label />
      <Avatar name="Priya Shah" label={false} />
      <AnimatedNumber value={price} format={(value) => `€${value}`} />
      <Combobox
        label="Owner"
        items={[
          { value: 'alex', label: 'Alex Morgan', leading: <Avatar name="Alex Morgan" /> },
          { label: 'Team', items: [{ value: 'sam', label: 'Sam Lee', leading: <span /> }] },
        ]}
      />
      <Combobox label="Reviewer" items={people} />
      <OrganizationSwitcher
        items={[{ id: 'northwind', name: 'Northwind', description: 'Admin' }]}
        value="northwind"
        onValueChange={() => {}}
        className="org-trigger"
      />
      <OrganizationSwitcher items={organizations} value={null} onValueChange={() => {}} />
      <PanelDock.Root
        panels={panels}
        onModeChange={() => {}}
        onClose={() => {}}
        showLabel={(label) => `Show ${label}`}>
        {() => null}
      </PanelDock.Root>
    </>
  );
}
