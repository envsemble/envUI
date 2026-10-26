import { Badge } from '@envsemble/envui';
import { CheckCircle } from '@envsemble/envui/icons/CheckCircle';

export default function BadgeAnatomy() {
  return (
    <Badge tone="success" icon={<CheckCircle />}>
      Approved
    </Badge>
  );
}
