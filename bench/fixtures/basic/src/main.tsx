import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Theme } from '@envsemble/envui';
import '@envsemble/envui/styles.css';
import './app.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme theme="light">
      <App />
    </Theme>
  </StrictMode>,
);
