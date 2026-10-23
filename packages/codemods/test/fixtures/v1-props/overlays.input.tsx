import {
  Alert,
  CommandPalette,
  Dialog,
  HoverCard,
  Popover,
  Spinner,
  Toast,
  useToast,
} from '@envsemble/envui';

export function Overlays({ items, query, setQuery, open }) {
  const toast = useToast();
  return (
    <Toast.Provider defaultPlacement="bottom-right">
      <Alert tone="error">Save failed</Alert>
      <Dialog title="Details" size="wide" />
      <Popover width="standard" trigger={<button />}>
        Details
      </Popover>
      <HoverCard width="wide" trigger={<a href="/people" />}>
        Person
      </HoverCard>
      <Spinner size="small" />
      <Spinner size="large" label="Loading" />
      <CommandPalette
        open={open}
        onOpenChange={() => {}}
        aria-label="Go to"
        query={query}
        onQueryChange={setQuery}
        items={items}
        onSelect={() => {}}
        closeOnSelect={false}
      />
      <button
        onClick={() =>
          toast.show({ message: 'Saved', variant: 'success', placement: 'bottom-right' })
        }
      />
      <button onClick={() => toast.show({ message: 'Failed', variant: 'error' })} />
    </Toast.Provider>
  );
}
