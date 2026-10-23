import { Stack, type StackProps } from '@envsemble/envui';

type Column = 'name' | 'updated';

export function Toolbar({ vertical, ...props }: StackProps & { vertical: boolean }) {
  const sort: Column = 'name';
  return (
    <Stack {...props} data-sort={sort}>
      <Stack direction={vertical ? 'column' : 'row'}>A</Stack>
      <Stack wrap gap={2}>B</Stack>
    </Stack>
  );
}

export const layouts = { Stack };
