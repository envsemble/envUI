import { Box, SearchTrigger } from '@envsemble/envui';

export default function SearchTriggerAnatomy() {
  return (
    <Box style={{ inlineSize: '16rem' }}>
      {/* A sidebar's width, which an application's frame sets. */}
      <SearchTrigger fullWidth listen={false} />
    </Box>
  );
}
