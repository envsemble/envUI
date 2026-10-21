import { Column, Surface, Text } from '@envsemble/envui';

export default function SurfaceLoading({ project }: { project?: { name: string; brief: string } }) {
  // A detail pane that is a skeleton until its project arrives: the text it will hold is bars.
  return (
    <Surface skeleton={!project} style={{ inlineSize: '22rem' }}>
      <Column gap={3}>
        <Text render={<h3 />} variant="title">
          {project?.name}
        </Text>
        <Text>{project?.brief}</Text>
      </Column>
    </Surface>
  );
}
