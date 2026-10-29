import { useState } from 'react';
import { Button, ToastProvider, useToast } from '@envsemble/envui';
import { IconDownload } from '@envsemble/envui/icons/Download';

function ExportButton() {
  const toast = useToast();
  const [exporting, setExporting] = useState(false);
  const exportMembers = () => {
    setExporting(true);
    // The export runs on a server; a timer stands in for it here.
    window.setTimeout(() => {
      setExporting(false);
      const id = toast.show({
        tone: 'info',
        message: 'Export ready: members.csv',
        // An action keeps it until people dismiss it: they may be elsewhere when it ends.
        action: {
          label: 'Download',
          onClick: () => {
            // The application downloads the file here.
            toast.dismiss(id);
          },
        },
      });
    }, 2000);
  };
  return (
    <Button
      variant="secondary"
      startIcon={<IconDownload />}
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
