import { Column, LineArt, Surface, Text } from '@envsemble/envui';

const projects = [
  { name: 'Website refresh', drawing: 'golden-section', due: 'Due March 12' },
  { name: 'Mobile release', drawing: 'pappus-chain', due: 'Due March 20' },
  { name: 'Data migration', drawing: 'gothic-tracery', due: 'Due March 27' },
] as const;

export default function OnEveryCard() {
  return (
    <Column gap={3} style={{ inlineSize: 'min(100%, 20rem)' }}>
      {projects.map(({ name, drawing, due }) => (
        <Surface
          key={name}
          background="default"
          padding={4}
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          <LineArt
            drawing={drawing}
            style={{ position: 'absolute', insetBlock: 0, insetInlineEnd: 0, inlineSize: '40%' }}
          />
          <Column gap={1} style={{ position: 'relative' }}>
            <Text render={<h3 />} variant="title">
              {name}
            </Text>
            <Text variant="body-sm">{due}</Text>
          </Column>
        </Surface>
      ))}
    </Column>
  );
}
