import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Theme } from '@envsemble/envui';
import '@envsemble/envui/styles.css';
import './Fixture.css';
import { RichTextEditingFixture } from './RichTextEditor.fixture.js';

// RichText.html has the #root.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme theme="light">
      <main className="fixture-main">
        <RichTextEditingFixture />
      </main>
    </Theme>
  </StrictMode>,
);
