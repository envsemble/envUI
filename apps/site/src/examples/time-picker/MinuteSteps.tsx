import { Row, TimePicker } from '@envsemble/envui';

export default function MinuteSteps() {
  return (
    <Row wrap gap={4}>
      <div style={{ inlineSize: 'min(100%, 12rem)' }}>
        <TimePicker label="Every 15 minutes" locale="en-GB" defaultValue="18:00" />
      </div>
      <div style={{ inlineSize: 'min(100%, 12rem)' }}>
        <TimePicker label="Every 5 minutes" locale="en-GB" defaultValue="18:05" minuteStep={5} />
      </div>
      <div style={{ inlineSize: 'min(100%, 12rem)' }}>
        <TimePicker label="Every minute" locale="en-GB" defaultValue="18:07" minuteStep={1} />
      </div>
    </Row>
  );
}
