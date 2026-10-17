import { AppShell, NavList, Tree } from '@envsemble/envui';

export function Frame({ children, layout, files }) {
  return (
    <>
      <AppShell.Root
        topbar={layout}
        navigationLabel="Files"
        navigation={<Tree items={files} aria-label="Files" />}
      >
        {children}
      </AppShell.Root>
      <AppShell.Root
        navigationLabel="Main"
        navigation={
          <NavList.Root>
            <NavList.Item href="/">Home</NavList.Item>
          </NavList.Root>
        }
      >
        {children}
      </AppShell.Root>
    </>
  );
}
