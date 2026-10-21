import { Card, Text } from '@envsemble/envui';

export default function WordyCard() {
  return (
    <Card
      title="Research into how teams of every size decide on pricing"
      style={{ inlineSize: 'min(100%, 20rem)' }}
    >
      <Text emphasis="muted">
        Over the spring we interviewed twelve teams and ran a survey, and this card collects the
        notes, the recordings, the survey results and our first conclusions, which we will update as
        the research goes on.
      </Text>
    </Card>
  );
}
