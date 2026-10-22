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
    <Toast.Provider>
      <Alert tone="danger">Save failed</Alert>
      <Dialog title="Details" width="lg" />
      <Popover trigger={<button />}>
        Details
      </Popover>
      <HoverCard width="lg" trigger={<a href="/people" />}>
        Person
      </HoverCard>
      <Spinner size="sm" />
      <Spinner size="lg" label="Loading" />
      <CommandPalette
        open={open}
        onOpenChange={() => {}}
        aria-label="Go to"
        inputValue={query}
        onInputValueChange={setQuery}
        items={items}
        onAction={() => {}}
        closeOnAction={false}
      />
      <button
        onClick={() =>
          toast.show({ message: 'Saved', tone: 'success', placement: 'bottom-end' })
        }
      />
      <button onClick={() => toast.show({ message: 'Failed', tone: 'danger' })} />
    </Toast.Provider>
  );
}
