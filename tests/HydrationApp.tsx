import { useState } from 'react';
import {
  Theme,
  Input,
  Checkbox,
  Select,
  Dialog,
  Button,
  ToastProvider,
  useToast,
} from '@envsemble/ui';

function NotificationTrigger() {
  const toast = useToast();
  return <Button onClick={() => toast.show({ message: 'Hydrated notice' })}>Notify</Button>;
}

export function HydrationApp() {
  const [name, setName] = useState('Server value');
  const [checked, setChecked] = useState<boolean | 'mixed'>('mixed');
  return (
    <Theme theme="dark">
      <ToastProvider>
        <Input
          label="Hydrated input"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Checkbox label="Hydrated choice" checked={checked} onCheckedChange={setChecked} />
        <Select
          label="Hydrated select"
          defaultValue="one"
          options={[
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two' },
          ]}
        />
        <Dialog title="Hydrated dialog" trigger={<Button>Open hydrated dialog</Button>}>
          <p>Server-rendered content</p>
        </Dialog>
        <NotificationTrigger />
        <output>{name}</output>
      </ToastProvider>
    </Theme>
  );
}
