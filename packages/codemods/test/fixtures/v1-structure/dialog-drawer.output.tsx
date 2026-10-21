import { Button, Dialog, Sheet } from '@envsemble/envui';

export function Panels({ placement }) {
  return (
    <>
      <Sheet side="end" title="Filters" trigger={<Button>Filters</Button>}>
        Filters
      </Sheet>
      <Sheet side="end" title="Report" width="lg" modal={false} />
      <Dialog title="Search" placement="top" />
      <Dialog title="Somewhere" placement={placement} />
    </>
  );
}
