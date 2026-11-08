import {
  Button,
  Graphic,
  List,
  PageHeader,
  Text,
  TopBar,
  type GraphicSize,
} from '@envsemble/envui';
import { IconFolder } from '@envsemble/envui/icons/Folder';

// Pictures whose files are wider than tall and far larger than any step, so a box that took its
// size from the file would show it: a 96 by 48 px PNG and a 192 by 96 px SVG.
const png =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAwCAYAAADuFn/PAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAvklEQVR4nO2VQQEEQQyD1sD5HgH4zcngUR4xAE36/XgrT2PwBf+pB5gAEjAbQg3AB9EEcTP9ABIwG0INwAfRBHEz/QASMBtCDcAH0QRxM/0AEjAbQg3AB9EEcTP9ABIwG0INwAfRBHEz/QASMBtCDcAH0QRxM/0AEjAbQg3AB9EEcTP9ABIwG0INwAfRBHEz/QASMBtCDcAH0QRxM/0AEjAbQg3AB9EEcTP9ABIwG0INwAfRBHEz/QASMBuCmT/G1NI7mgDopgAAAABJRU5ErkJggg==';
const svg = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="192" height="96" viewBox="0 0 192 96"><rect width="192" height="96" fill="#0d9488"/></svg>',
)}`;

/** An application's own icon component as it is often written: the file's size and color. */
function IconPipeline() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="#000"
      data-testid="own-svg"
    >
      <path d="M5 3a3 3 0 1 1 0 6a3 3 0 1 1 0-6zM19 3a3 3 0 1 1 0 6a3 3 0 1 1 0-6zM12 15a3 3 0 1 1 0 6a3 3 0 1 1 0-6zM8 5h8v2H8zM11 7h2v8h-2z" />
    </svg>
  );
}

const sizes: GraphicSize[] = ['icon', 'sm', 'md', 'lg', 'xl'];

export default function GraphicFixture() {
  return (
    <section className="fixture-section" data-testid="graphics">
      <div data-testid="graphic-sizes">
        {sizes.map((size) => (
          <span key={size}>
            <Graphic src={png} alt="" size={size} data-testid={`png-${size}`} />
            <Graphic src={svg} alt="" size={size} data-testid={`svg-file-${size}`} />
            <Graphic alt="" size={size} data-testid={`svg-${size}`}>
              <IconPipeline />
            </Graphic>
          </span>
        ))}
      </div>
      <Text render={<p />} data-testid="graphic-text" style={{ fontSize: '1.5rem' }}>
        Connect <Graphic src={png} alt="" size="text" data-testid="png-text" /> Acme
      </Text>
      <div data-testid="graphic-fill-box" style={{ inlineSize: '14rem', blockSize: '6rem' }}>
        <Graphic src={png} alt="" size="fill" data-testid="png-fill" />
      </div>
      {/* A container with no height of its own: fill takes its width and its height from the
          aspect, or a square for a file in the text color. */}
      <div data-testid="graphic-fill-auto" style={{ inlineSize: '16rem' }}>
        <Graphic src={png} alt="" size="fill" aspect="16/9" fit="cover" data-testid="fill-aspect" />
        <div>
          <Graphic src={svg} alt="" size="fill" tint="text" data-testid="fill-mask" />
        </div>
      </div>
      <Graphic src={png} alt="" size="lg" aspect="4/3" fit="cover" data-testid="step-aspect" />
      <div style={{ color: 'rgb(200, 0, 0)' }}>
        <Graphic alt="Acme" size="md" data-testid="own-colors">
          <IconPipeline />
        </Graphic>
        <Graphic alt="Acme" size="md" tint="text" data-testid="tint-svg">
          <IconPipeline />
        </Graphic>
        <Graphic src={svg} alt="Acme" size="md" tint="text" data-testid="tint-file" />
        <Graphic alt="" size="md" tint="text" data-testid="tint-masked">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <mask id="fixture-graphic-mask">
              <rect width="24" height="24" fill="#fff" />
            </mask>
            <rect width="24" height="24" fill="#000" mask="url(#fixture-graphic-mask)" />
          </svg>
        </Graphic>
      </div>
      <div>
        <Graphic src={png} alt="Acme" size="md" data-testid="named" />
        <Graphic src={png} alt="" size="md" data-testid="decorative" />
        <Graphic alt="Acme" size="md" data-testid="named-svg">
          <IconPipeline />
        </Graphic>
      </div>
      <div className="fixture-actions">
        <Button variant="outline" startIcon={<img src={png} alt="" />} data-testid="button-img">
          Sign in with Acme
        </Button>
        <Button
          variant="outline"
          startIcon={<Graphic src={png} alt="" />}
          data-testid="button-graphic"
        >
          Sign in with Acme
        </Button>
        <Button variant="outline" startIcon={<IconPipeline />} data-testid="button-svg">
          Build pipeline
        </Button>
      </div>
      <List.Root aria-label="Projects">
        <List.Item start={<IconPipeline />} label="Build pipeline" data-testid="list-svg" />
        <List.Item
          start={<img src={png} alt="" />}
          label="Website refresh"
          data-testid="list-img"
        />
        <List.Item
          start={
            <Graphic alt="" tint="text">
              <IconPipeline />
            </Graphic>
          }
          label="Quarterly report"
          data-testid="list-graphic"
        />
      </List.Root>
      <TopBar
        title="Acme"
        start={<Graphic src={png} alt="" data-testid="top-bar-graphic" />}
        data-testid="top-bar"
      />
      <TopBar title="Folders" start={<IconFolder />} data-testid="top-bar-symbol" />
      <PageHeader
        title="Acme"
        start={<Graphic src={png} alt="" data-testid="page-header-graphic" />}
      />
    </section>
  );
}
