import { createRoot } from 'react-dom/client';
import '@envsemble/envui/styles.css';
import './Documentation.css';
import App from './App';
import { PaletteCustomizationProvider } from './theme/PaletteCustomization';

createRoot(document.getElementById('root')!).render(
  <PaletteCustomizationProvider>
    <App />
  </PaletteCustomizationProvider>,
);
