import { Pagination, useToast } from '@envsemble/envui';

declare const load: (page: number) => void;

export const loads = <Pagination page={1} pageSize={60} total={245} onPageChange={load} />;
export const links = <Pagination page={1} pageSize={60} pageHref={(page) => `?page=${page}`} />;
export const both = (
  <Pagination page={1} pageSize={60} onPageChange={load} pageHref={(page) => `?page=${page}`} />
);
// @ts-expect-error
export const leadsNowhere = <Pagination page={1} pageSize={60} />;

export function useNotices() {
  const toast = useToast();
  toast.show({ message: 'Moved to Trash', actions: [{ label: 'Undo', onClick: () => {} }] });
  toast.show({ message: 'Uploaded', actions: [{ label: 'View', href: '/report' }] });
  // @ts-expect-error
  toast.show({ message: 'Moved to Trash', actions: [{ label: 'Undo' }] });
  // @ts-expect-error
  toast.show({ message: 'Moved to Trash', action: { label: 'Undo', onClick: () => {} } });
}
