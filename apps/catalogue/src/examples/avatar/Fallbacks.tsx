import { Avatar, Stack } from '@envsemble/envui';

/** Stands in for the URL of a profile picture from the application's account data. */
const picture =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#2f6f62"/><circle cx="32" cy="26" r="12" fill="#f2d3b8"/><path d="M10 64c2-14 11-21 22-21s20 7 22 21z" fill="#f2d3b8"/></svg>',
  );

export default function Fallbacks() {
  return (
    <Stack direction="row" wrap align="center" gap={4}>
      <Avatar name="Priya Shah" src={picture} size="large" label />
      {/* A picture that fails to load shows the default person picture, without an error. */}
      <Avatar name="Jordan Ellis" src="data:image/png;base64,missing" size="large" label />
      <Avatar name="Northwind Labs" fallback="initials" size="large" label />
    </Stack>
  );
}
