import { Badge, Row } from '@envsemble/envui';
import { Archive } from '@envsemble/envui/icons/Archive';
import { CheckCircle } from '@envsemble/envui/icons/CheckCircle';
import { Error as ErrorIcon } from '@envsemble/envui/icons/Error';
import { RadioButtonChecked } from '@envsemble/envui/icons/RadioButtonChecked';
import { TaskAlt } from '@envsemble/envui/icons/TaskAlt';
import { Warning } from '@envsemble/envui/icons/Warning';

// Each tone with words and an icon, so nobody has to tell colors apart.
export default function Status() {
  return (
    <Row wrap gap={2}>
      <Badge tone="neutral" icon={<Archive />}>
        Archived
      </Badge>
      <Badge tone="primary" icon={<RadioButtonChecked />}>
        Current
      </Badge>
      <Badge tone="success" icon={<CheckCircle />}>
        Ready
      </Badge>
      <Badge tone="warning" icon={<Warning />}>
        Due soon
      </Badge>
      <Badge tone="danger" icon={<ErrorIcon />}>
        Failed
      </Badge>
      <Badge tone="done" icon={<TaskAlt />}>
        Completed
      </Badge>
    </Row>
  );
}
