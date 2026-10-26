import { useState } from 'react';
import { Button, Toast, useToast } from '@envsemble/envui';
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
        tone: 'info',
        message: 'Your export is ready: members.csv is in Downloads.',
        // People may be elsewhere when it ends, so it stays until they dismiss it.
        duration: Infinity,
      });
    }, 2000);
  };
  return (
    <Button
      variant="secondary"
      startIcon={<Download />}
      pending={exporting}
      onClick={exportMembers}
    >
      Export members
    </Button>
  );
}

export default function ExportReady() {
  return (
    <Toast.Provider>
      <ExportButton />
    </Toast.Provider>
  );
}
