import { createRoot } from 'react-dom/client';
import App from './App';
// After App: its envUI components bring envUI's style sheets, which declare the order of the env
// cascade layers that the site's style sheets build on.
import './styles/index.css';
import { PaletteCustomizationProvider } from './theme/PaletteCustomization';

createRoot(document.getElementById('root')!).render(
  <PaletteCustomizationProvider>
    <App />
  </PaletteCustomizationProvider>,
);
