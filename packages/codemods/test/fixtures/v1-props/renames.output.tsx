import {
  AnimatedNumber,
  Avatar,
  Card,
  Combobox,
  PanelDock,
} from '@envsemble/envui';

export function Renames({ people, panels, price, name }) {
  return (
    <>
      <Card title="Pricing research" headingLevel={2}>
        Interviews from twelve teams.
      </Card>
      <Card title={name} />
      <Avatar name="Sam Lee" named />
      <Avatar name="Priya Shah" named={false} />
      <AnimatedNumber value={price} formatValue={(value) => `€${value}`} />
      <Combobox
        label="Owner"
        items={[
          { value: 'alex', label: 'Alex Morgan', start: <Avatar name="Alex Morgan" /> },
          { label: 'Team', items: [{ value: 'sam', label: 'Sam Lee', start: <span /> }] },
        ]}
      />
      <Combobox label="Reviewer" items={people} />
      <PanelDock.Root
        panels={panels}
        onModeChange={() => {}}
        onClose={() => {}}
        openLabel={(label) => `Show ${label}`}>
        {() => null}
      </PanelDock.Root>
    </>
  );
}
