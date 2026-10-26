import { Column, DropZone, List, Progress } from '@envsemble/envui';

const take = () => undefined;

export default function ZoneStaysReady() {
  return (
    // Shown part way through two uploads.
    <Column gap={4} style={{ inlineSize: 'min(100%, 24rem)' }}>
      <DropZone size="sm" multiple label="Add files" onDropAccepted={take} />
      <List.Root aria-label="Files">
        <List.Item label="annual-review.pdf">
          <Progress
            label="Uploading"
            value={1.5}
            max={2.4}
            valueText="1.5 of 2.4 MB"
            aria-valuetext="annual-review.pdf, 1.5 of 2.4 MB"
          />
        </List.Item>
        <List.Item label="team-photo.jpg">
          <Progress
            label="Uploading"
            value={0.2}
            max={1.1}
            valueText="0.2 of 1.1 MB"
            aria-valuetext="team-photo.jpg, 0.2 of 1.1 MB"
          />
        </List.Item>
      </List.Root>
    </Column>
  );
}
