import { Button, Column, LineArt, Text } from '@envsemble/envui';

export default function AboveAnEmptyState() {
  return (
    <Column gap={4} align="center" style={{ inlineSize: 'min(100%, 18rem)', textAlign: 'center' }}>
      {/* The drawing's box, above the message, about the drawing's own shape. */}
      <div style={{ inlineSize: '11rem', blockSize: '7rem' }}>
        <LineArt drawing="pappus-chain" align="center" />
      </div>
      <Column gap={2}>
        <Text render={<h3 />} variant="title">
          No projects yet
        </Text>
        <Text variant="body-sm">Projects you create or join show here.</Text>
      </Column>
      <Button>Create project</Button>
    </Column>
  );
}
