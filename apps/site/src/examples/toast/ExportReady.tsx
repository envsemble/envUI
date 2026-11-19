import { useState } from 'react';
import { Button, ToastProvider, useToast } from '@envsemble/envui';
import { IconDownload } from '@envsemble/envui/icons/Download';

function ExportButton() {
  const toast = useToast();
  const [exporting, setExporting] = useState(false);
  const exportMembers = () => {
    setExporting(true);
    window.setTimeout(() => {
      setExporting(false);
      const id = toast.show({
        tone: 'info',
        message: 'Export ready: members.csv',
        actions: [
          {
            label: 'Download',
            onClick: () => toast.dismiss(id),
          },
        ],
      });
    }, 2000);
  };
  return (
    <Button
      variant="secondary"
      start={<IconDownload />}
      pending={exporting}
      onClick={exportMembers}
    >
      Export members
    </Button>
  );
}

export default function ExportReady() {
  return (
    <ToastProvider>
      <ExportButton />
    </ToastProvider>
  );
}
