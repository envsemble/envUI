import { Button, ListDetail } from '@envsemble/envui';

export function Projects({ selected, setSelected, rest }) {
  return (
    <>
      <ListDetail.Root {...rest} />
      <ListDetail.Root
        detailShown={selected !== null}
        onBack={() => setSelected(null)}
        backLabel="All projects"
        stackBelow="44rem"
        defaultListSize={30}
        resizeLabel="Resize project list"
      >
        <ListDetail.List label="Projects">
          <Button onClick={() => setSelected('a')}>Project A</Button>
        </ListDetail.List>
        <ListDetail.Detail label="Project A">Details</ListDetail.Detail>
      </ListDetail.Root>
    </>
  );
}
