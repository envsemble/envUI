import { Alert, Avatar, Button, Card, Text, useToast } from '@envsemble/envui';

export function Diagnostics({ failed, layout, section, expanded, tone, big, wide }) {
  const toast = useToast();
  toast.show({ message: 'Saved', variant: failed ? 'error' : 'success' });
  return (
    <>
      <Alert tone={failed ? 'error' : 'info'}>Check the form</Alert>
      <Alert tone={failed && 'error'}>Check the form</Alert>
      <Alert tone={tone ?? 'error'}>Check the form</Alert>
      <Avatar size={layout === 'stacked' ? 'large' : 'standard'} />
      <Avatar size={big ? (wide ? 'display' : 'large') : 'small'} />
      <Text variant={section ? 'section-heading' : 'page-heading'} tone={section ? 'quiet' : 'muted'}>
        Title
      </Text>
      <Text tone={section ? 'quiet' : tone}>Body</Text>
      <Button variant={expanded ? 'secondary' : 'outlined'}>Ask</Button>
      <Button variant={expanded ? 'important' : 'secondary'}>Publish</Button>
      <Card layout={wide ? 'action' : 'content'}>Card</Card>
    </>
  );
}
