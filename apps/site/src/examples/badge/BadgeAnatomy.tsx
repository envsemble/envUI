import { Badge } from '@envsemble/envui';
import { IconCheckCircle } from '@envsemble/envui/icons/CheckCircle';

export default function BadgeAnatomy() {
  return (
    <Badge tone="success" start={<IconCheckCircle />}>
      Approved
    </Badge>
  );
}
