import { Row, TimePicker } from '@envsemble/envui';

export default function ClockConventions() {
  return (
    <Row wrap gap={4}>
      <div style={{ inlineSize: 'min(100%, 12rem)' }}>
        <TimePicker label="New York" locale="en-US" defaultValue="18:45" />
      </div>
      <div style={{ inlineSize: 'min(100%, 12rem)' }}>
        <TimePicker label="Berlin" locale="de-DE" defaultValue="18:45" />
      </div>
    </Row>
  );
}
