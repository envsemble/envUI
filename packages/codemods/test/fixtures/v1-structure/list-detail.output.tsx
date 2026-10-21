import { Button, ListDetail, Panes } from '@envsemble/envui';

export function Projects({ selected, setSelected, rest }) {
  return (
    <>
      <ListDetail.Root {...rest} />
      <Panes.Root
        behavior="list-detail"
        open={selected !== null}
        onOpenChange={() => setSelected(null)}
        backLabel="All projects">
        <Panes.List label="Projects">
          <Button onClick={() => setSelected('a')}>Project A</Button>
        </Panes.List>
        <Panes.Detail label="Project A">Details</Panes.Detail>
      </Panes.Root>
    </>
  );
}
