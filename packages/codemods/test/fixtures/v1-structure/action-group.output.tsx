import { ActionGroup, Button, IconButton, Stack } from '@envsemble/envui';

export function FormActions({ stacked, onCancel }) {
  return (
    <>
      <Stack direction="row" wrap align="center" gap={4} justify="end">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </Stack>
      <Stack direction="row" wrap align="center" gap={4} render={<footer />}>
        <Button>Start</Button>
      </Stack>
      <Stack gap={2}>
        <Button fullWidth>Continue</Button>
        <IconButton icon={<span />} aria-label="More" />
        <IconButton icon={<span />} aria-label="Help" />
        <a href="/help">Help</a>
      </Stack>
      <ActionGroup stacked={stacked}>
        <Button>Unknown</Button>
      </ActionGroup>
    </>
  );
}
