import { useToast, notify } from '@envsemble/envui';

export function Save({ options }) {
  const toast = useToast();
  const { show: announce } = useToast();
  return () => {
    toast.show({ title: 'Saved', tone: 'danger', placement: 'bottom-end' });
    useToast().show({ title: 'Direct', tone: 'success' });
    announce({ title: 'Destructured', placement: 'top-center' });
    toast.show(options);
    notify({ tone: 'info' });
  };
}
