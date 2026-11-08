import { Text } from '@envsemble/envui';
import { Code } from '@envsemble/envui/code';

export default function InlineCode() {
  return (
    <Text>
      Run <Code>npm run build</Code> before you deploy.
    </Text>
  );
}
