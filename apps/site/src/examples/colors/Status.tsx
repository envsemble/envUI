import { Badge, Row } from '@envsemble/envui';
import { IconArchive } from '@envsemble/envui/icons/Archive';
import { IconCheckCircle } from '@envsemble/envui/icons/CheckCircle';
import { IconError } from '@envsemble/envui/icons/Error';
import { IconRadioButtonChecked } from '@envsemble/envui/icons/RadioButtonChecked';
import { IconTaskAlt } from '@envsemble/envui/icons/TaskAlt';
import { IconWarning } from '@envsemble/envui/icons/Warning';

export default function Status() {
  return (
    <Row wrap gap={2}>
      <Badge tone="neutral" start={<IconArchive />}>
        Archived
      </Badge>
      <Badge tone="primary" start={<IconRadioButtonChecked />}>
        Current
      </Badge>
      <Badge tone="success" start={<IconCheckCircle />}>
        Ready
      </Badge>
      <Badge tone="warning" start={<IconWarning />}>
        Due soon
      </Badge>
      <Badge tone="danger" start={<IconError />}>
        Failed
      </Badge>
      <Badge tone="done" start={<IconTaskAlt />}>
        Completed
      </Badge>
    </Row>
  );
}
