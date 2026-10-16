import { useState } from 'react';
import { Button, Toast, useToast, Stack } from '@envsemble/envui';
import { Download } from '@envsemble/envui/icons/Download';

function ExportButton() {
  const toast = useToast();
  const [exporting, setExporting] = useState(false);
  const exportMembers = () => {
    setExporting(true);
    // The export runs on a server; a timer stands in for it here.
    window.setTimeout(() => {
      setExporting(false);
      toast.show({
        variant: 'info',
        message: 'Your export is ready: members.csv is in Downloads.',
        // People may be elsewhere when it ends, so it stays until they dismiss it.
        duration: Infinity,
      });
    }, 2000);
  };
  return (
    <Stack direction="row" wrap align="center" gap={4}>
      <Button
        variant="secondary"
        startIcon={<Download />}
        pending={exporting}
        onClick={exportMembers}
      >
        Export members
      </Button>
    </Stack>
  );
}

export default function ExportReady() {
  return (
    <Toast.Provider>
      <ExportButton />
    </Toast.Provider>
  );
}
