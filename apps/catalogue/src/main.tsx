import { createRoot } from 'react-dom/client';
import '@envsemble/envui/styles.css';
import './styles/index.css';
import App from './App';
import { PaletteCustomizationProvider } from './theme/PaletteCustomization';
import { frameRequest } from './template/FrameAddress';
import { TemplateFrame } from './template/TemplateFrame';

// ?frame=<page>/<Name> on any address shows that template's screen alone, as the template pages'
// previews and the tests open it; every other address is the catalogue.
const frame = frameRequest(window.location.search);

createRoot(document.getElementById('root')!).render(
  frame ? (
    <TemplateFrame request={frame} />
  ) : (
    <PaletteCustomizationProvider>
      <App />
    </PaletteCustomizationProvider>
  ),
);
