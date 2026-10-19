import { Badge, Stack } from '@envsemble/envui';
import { CheckCircle } from '@envsemble/envui/icons/CheckCircle';
import { Folder } from '@envsemble/envui/icons/Folder';
import { TaskAlt } from '@envsemble/envui/icons/TaskAlt';

export default function WithIcon() {
  return (
    <Stack direction="row" wrap align="center" gap={4}>
      <Badge tone="success" icon={<CheckCircle />}>
        Approved
      </Badge>
      <Badge tone="done" icon={<TaskAlt />}>
        Completed
      </Badge>
      <Badge variant="outline" icon={<Folder />}>
        Shared drafts
      </Badge>
    </Stack>
  );
}
