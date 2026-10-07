import { Stack, Text } from '@envsemble/envui';
import { CodeBlock } from '@envsemble/envui/content';
import * as symbols from '@envsemble/envui/icons';

/** The catalogue sends its selected icon to this Usage-only import example. */
export function IconUsageDetails({ name, filled }: { name: string | null; filled: boolean }) {
  if (!name || !Object.hasOwn(symbols, name)) return null;
  return (
    <Stack as="section">
      <Text as="h2" variant="page-heading">
        {name}
      </Text>
      <CodeBlock
        language="tsx"
        label="React import"
        copyable
      >{`import { ${name} } from '@envsemble/envui/icons/${name}';\n\n<${name}${filled ? ' filled' : ''} />`}</CodeBlock>
    </Stack>
  );
}
