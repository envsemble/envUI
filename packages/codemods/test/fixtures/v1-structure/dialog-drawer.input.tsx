import { Button, Dialog } from '@envsemble/envui';

export function Panels({ placement }) {
  return (
    <>
      <Dialog title="Filters" placement="right" trigger={<Button>Filters</Button>}>
        Filters
      </Dialog>
      <Dialog title="Report" placement="right" size="wide" modal={false} />
      <Dialog title="Search" placement="top" />
      <Dialog title="Somewhere" placement={placement} />
    </>
  );
}
