import { useToast, notify } from '@envsemble/envui';

export function Save({ options }) {
  const toast = useToast();
  const { show: announce } = useToast();
  return () => {
    toast.show({ title: 'Saved', variant: 'error', placement: 'bottom-right' });
    useToast().show({ title: 'Direct', variant: 'success' });
    announce({ title: 'Destructured', placement: 'top-center' });
    toast.show(options);
    notify({ kind: 'info' });
  };
}
