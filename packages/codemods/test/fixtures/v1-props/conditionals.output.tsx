import { Alert, Avatar, Button, Card, Text, useToast } from '@envsemble/envui';

export function Diagnostics({ failed, layout, section, expanded, tone, big, wide }) {
  const toast = useToast();
  toast.show({ message: 'Saved', tone: failed ? 'danger' : 'success' });
  return (
    <>
      <Alert tone={failed ? 'danger' : 'info'}>Check the form</Alert>
      <Alert tone={failed && 'danger'}>Check the form</Alert>
      <Alert tone={tone ?? 'danger'}>Check the form</Alert>
      <Avatar size={layout === 'stacked' ? 'lg' : undefined} />
      <Avatar size={big ? (wide ? 'xl' : 'lg') : 'sm'} />
      <Text variant={section ? 'title' : 'headline'} emphasis={section ? 'subtle' : 'muted'}>
        Title
      </Text>
      <Text emphasis={section ? 'subtle' : tone}>Body</Text>
      <Button variant={expanded ? 'secondary' : 'outline'}>Ask</Button>
      <Button variant={expanded ? 'important' : 'secondary'}>Publish</Button>
      <Card>Card</Card>
    </>
  );
}
