import { Stack, Textarea } from '@envsemble/envui';

const plan = [
  'Goals for the quarter',
  '',
  'Ship the new onboarding.',
  'Hire two designers.',
  'Move the team to the new office.',
  'Review the budget in June.',
  'Plan the summer offsite.',
].join('\n');

export default function TextareaSizing() {
  return (
    // As wide as a form column.
    <Stack style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Textarea label="Description" name="description" rows={4} defaultValue={plan} />
      <Textarea
        label="Reply"
        name="reply"
        sizing="content"
        rows={1}
        placeholder="Write a reply to Sam Lee"
      />
    </Stack>
  );
}
