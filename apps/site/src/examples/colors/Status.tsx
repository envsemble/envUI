import { Badge, Row } from '@envsemble/envui';
import { IconArchive } from '@envsemble/envui/icons/Archive';
import { IconCheckCircle } from '@envsemble/envui/icons/CheckCircle';
import { IconError } from '@envsemble/envui/icons/Error';
import { IconRadioButtonChecked } from '@envsemble/envui/icons/RadioButtonChecked';
import { IconTaskAlt } from '@envsemble/envui/icons/TaskAlt';
import { IconWarning } from '@envsemble/envui/icons/Warning';

// Each tone with words and an icon, so nobody has to tell colors apart.
export default function Status() {
  return (
    <Row wrap gap={2}>
      <Badge tone="neutral" icon={<IconArchive />}>
        Archived
      </Badge>
      <Badge tone="primary" icon={<IconRadioButtonChecked />}>
        Current
      </Badge>
      <Badge tone="success" icon={<IconCheckCircle />}>
        Ready
      </Badge>
      <Badge tone="warning" icon={<IconWarning />}>
        Due soon
      </Badge>
      <Badge tone="danger" icon={<IconError />}>
        Failed
      </Badge>
      <Badge tone="done" icon={<IconTaskAlt />}>
        Completed
      </Badge>
    </Row>
  );
}
