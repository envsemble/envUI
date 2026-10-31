import { Graphic, List } from '@envsemble/envui';

/** An icon of the application's own, as an SVG component with a viewBox. */
function PipelineIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M5 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm14 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm-7 12a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM8 5h8v2H8Zm3 2h2v8h-2Z" />
    </svg>
  );
}

export default function ListIcons() {
  const pipeline = (
    <Graphic alt="" tint="text">
      <PipelineIcon />
    </Graphic>
  );
  return (
    <List.Root aria-label="Pipelines" style={{ inlineSize: '100%' }}>
      <List.Item start={pipeline} label="Website refresh" description="Runs on every push" />
      <List.Item start={pipeline} label="Mobile release" description="Runs every night" />
    </List.Root>
  );
}
