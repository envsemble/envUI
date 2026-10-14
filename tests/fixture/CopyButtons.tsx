import { useState } from 'react';
import {
  Button,
  CopyButton,
  Dialog,
  IconButton,
  Surface,
  Theme,
  Tooltip,
  type ThemeValue,
} from '@envsemble/envui';
import { Settings } from '@envsemble/envui/icons/Settings';

export function CopyButtonsFixture({ theme }: { theme: ThemeValue }) {
  const [copied, setCopied] = useState('');
  const [presses, setPresses] = useState(0);
  return (
    <Theme theme={theme} data-testid={`copy-buttons-${theme}`} className="fixture-section">
      <div className="fixture-actions">
        <CopyButton
          value="https://example.com/r/quarterly-report"
          aria-label={`Copy link ${theme}`}
          onCopy={setCopied}
        />
        <CopyButton value={() => `RPT-${2040 + 1}`} variant="outlined" onCopy={setCopied}>
          Copy ID {theme}
        </CopyButton>
        <CopyButton
          value={() =>
            new Promise<string>((resolve) => setTimeout(() => resolve('Later text'), 400))
          }
          aria-label={`Copy later ${theme}`}
          onCopy={setCopied}
        />
        <CopyButton
          value="Custom"
          aria-label={`Copy custom ${theme}`}
          copiedLabel="Kopiert"
          failedLabel="Nicht kopiert"
        />
        <CopyButton
          value="Skipped"
          aria-label={`Copy skipped ${theme}`}
          onClick={(event) => {
            setPresses((count) => count + 1);
            event.preventDefault();
          }}
          onCopy={setCopied}
        />
        <Tooltip content="Copy the address of the plan">
          <CopyButton value="Plan address" aria-label={`Copy plan ${theme}`} onCopy={setCopied} />
        </Tooltip>
        <CopyButton value="Unavailable" aria-label={`Copy unavailable ${theme}`} disabled />
      </div>
      <output data-testid="copied">{copied}</output>
      <output data-testid="presses">{presses}</output>
      {/* A compact toolbar: the copy action takes the 2 rem height of the controls beside it. */}
      <Surface
        tone="row"
        padding={2}
        corners="standard"
        density="compact"
        className="fixture-toolbar"
        data-testid="toolbar"
      >
        <span className="fixture-shrink-label">RPT-2041</span>
        <CopyButton variant="text" value="RPT-2041" aria-label={`Copy report ID ${theme}`} />
        <IconButton icon={<Settings />} aria-label="Report settings" />
      </Surface>
      <div className="fixture-toolbar" data-testid="sizes">
        <CopyButton value="Standard" aria-label="Copy standard" />
        <CopyButton value="Compact" size="compact" aria-label="Copy compact" />
        <CopyButton value="Compact label" size="compact">
          Copy compact label
        </CopyButton>
      </div>
      <div className="fixture-shrink-row" data-testid="narrow">
        <span className="fixture-shrink-label">
          A long value that needs more room than there is
        </span>
        <CopyButton value="Narrow" aria-label="Copy narrow" />
      </div>
      <Dialog title={`Share ${theme}`} trigger={<Button>Share {theme}</Button>}>
        <CopyButton
          value="https://example.com/r/shared"
          aria-label={`Copy shared link ${theme}`}
          onCopy={setCopied}
        />
      </Dialog>
    </Theme>
  );
}
