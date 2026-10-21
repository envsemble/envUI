import { Stack, Column as EnvColumn, type StackProps } from '@envsemble/envui';

type Column = 'name' | 'updated';

export function Toolbar({ vertical, ...props }: StackProps & { vertical: boolean }) {
  const sort: Column = 'name';
  return (
    <EnvColumn gap={4} {...props} data-sort={sort}>
      <Stack direction={vertical ? 'column' : 'row'}>A</Stack>
      <EnvColumn gap={2}>B</EnvColumn>
    </EnvColumn>
  );
}

export const layouts = { Stack };
