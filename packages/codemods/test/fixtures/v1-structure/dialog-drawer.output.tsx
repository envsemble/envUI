import { Button, Dialog, Drawer } from '@envsemble/envui';

export function Panels({ placement }) {
  return (
    <>
      <Drawer side="end" title="Filters" trigger={<Button>Filters</Button>}>
        Filters
      </Drawer>
      <Drawer side="end" title="Report" width="lg" modal={false} />
      <Dialog title="Search" placement="top" />
      <Dialog title="Somewhere" placement={placement} />
    </>
  );
}
