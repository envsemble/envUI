import type { ReactNode } from 'react';
import { Column, Link, Text } from '@envsemble/envui';

const repository = 'https://github.com/envsemble/envUI';
const issues = `${repository}/issues`;
const updated = 'November 16, 2026';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Column gap={3} render={<section />}>
      <Text render={<h2 />} variant="title">
        {title}
      </Text>
      {children}
    </Column>
  );
}

function Points({ children }: { children: ReactNode }) {
  return (
    <Column gap={2} render={<ul />} className="site-legal-points">
      {children}
    </Column>
  );
}

const Updated = () => (
  <Text emphasis="muted" variant="body-sm">
    Last updated {updated}
  </Text>
);

const changes = (what: string) => (
  <Section title="Changes and questions">
    <Text>
      If {what} change, this page changes with them, and its date above. Questions go to{' '}
      <Link href={issues}>the issues on GitHub</Link>.
    </Text>
  </Section>
);

const privacy = (
  <>
    <Updated />
    <Text>
      envUI is a React component library made by envsemble, and this site is its catalogue and
      documentation. This page says what the package and the site do with your data.
    </Text>
    <Section title="The package">
      <Points>
        <li>
          <Text>
            <strong>No telemetry.</strong> <code>@envsemble/envui</code> sends nothing anywhere: it
            makes no network requests of its own and collects no usage statistics.
          </Text>
        </li>
        <li>
          <Text>
            <strong>What it keeps in the browser is the application&apos;s choice.</strong>{' '}
            useStoredThemePreference keeps the chosen theme in the browser&apos;s local storage,
            under a key the application names.
          </Text>
        </li>
      </Points>
    </Section>
    <Section title="This site">
      <Points>
        <li>
          <Text>No analytics and no tracking.</Text>
        </li>
        <li>
          <Text>
            Your display settings, the theme, contrast, scale and motion, and the width of the
            navigation are kept in your browser&apos;s local storage, so the site looks the same
            next time. Some examples keep their own state there too, such as a drawer&apos;s or a
            pane&apos;s width.
          </Text>
        </li>
        <li>
          <Text>The site sets no cookies.</Text>
        </li>
        <li>
          <Text>
            The fonts, pictures and code all come from this site; your browser asks no other site
            for anything until you follow a link, such as to GitHub.
          </Text>
        </li>
        <li>
          <Text>
            The site is hosted on Cloudflare, which handles each request, your IP address included,
            to serve and protect the site, under Cloudflare&apos;s privacy policy.
          </Text>
        </li>
      </Points>
    </Section>
    {changes('they')}
  </>
);

const terms = (
  <>
    <Updated />
    <Text>envUI is free and open source. These terms cover using it and this site.</Text>
    <Section title="The license">
      <Text>
        envUI is under the <Link href={`${repository}/blob/main/LICENSE`}>MIT license</Link>, and
        that license is the terms of the software: you may use, copy, change and share it, as long
        as you keep its copyright and license notice. It comes as is, without warranty of any kind,
        and envsemble is not liable for what comes of using it. Bundled third-party assets and
        dependencies keep their own notices and licenses, which the package ships.
      </Text>
    </Section>
    <Section title="Names and logos">
      <Text>
        The license covers the code, not the envUI and envsemble names, logos or icons, which remain
        envsemble&apos;s.
      </Text>
    </Section>
    <Section title="This site">
      <Text>The site&apos;s documentation and examples come as is, to show how envUI works.</Text>
    </Section>
    {changes('these terms')}
  </>
);

export const legalContents = { privacy, terms };
