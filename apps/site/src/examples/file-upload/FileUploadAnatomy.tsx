import { Button, Column, DropZone, List, Progress } from '@envsemble/envui';

const take = () => undefined;

export default function FileUploadAnatomy() {
  return (
    <Column gap={4} style={{ inlineSize: 'min(100%, 26rem)' }}>
      <DropZone size="sm" multiple label="Add files" onFilesAccepted={take} />
      <List.Root aria-label="Files">
        <List.Item
          label="annual-review.pdf"
          description="2.4 MB"
          action={
            <Button variant="text" aria-label="Remove annual-review.pdf">
              Remove
            </Button>
          }
        />
        <List.Item
          label="team-photo.jpg"
          action={
            <Button variant="text" aria-label="Remove team-photo.jpg">
              Remove
            </Button>
          }
        >
          <Progress
            label="Uploading"
            value={0.4}
            max={1.1}
            valueText="0.4 of 1.1 MB"
            aria-valuetext="team-photo.jpg, 0.4 of 1.1 MB"
          />
        </List.Item>
      </List.Root>
    </Column>
  );
}
