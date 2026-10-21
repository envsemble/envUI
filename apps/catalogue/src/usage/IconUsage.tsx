import { Column, Text } from '@envsemble/envui';
import { CodeBlock } from '@envsemble/envui/content';
import * as symbols from '@envsemble/envui/icons';

/** The catalogue sends its selected icon to this Usage-only import example. */
export function IconUsageDetails({ name, filled }: { name: string | null; filled: boolean }) {
  if (!name || !Object.hasOwn(symbols, name)) return null;
  return (
    <Column gap={4} render={<section />}>
      <Text render={<h2 />} variant="headline">
        {name}
      </Text>
      <CodeBlock
        language="tsx"
        label="React import"
        copyable
      >{`import { ${name} } from '@envsemble/envui/icons/${name}';\n\n<${name}${filled ? ' filled' : ''} />`}</CodeBlock>
    </Column>
  );
}
