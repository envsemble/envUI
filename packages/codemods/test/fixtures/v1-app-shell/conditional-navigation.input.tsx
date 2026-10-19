import { AppShell, NavList } from '@envsemble/envui';

export function Frame({ children, admin, members, links, pages, pathname }) {
  return (
    <>
      <AppShell.Root
        navigationLabel="Primary"
        navigation={
          <>
            <NavList.Item href="/">Home</NavList.Item>
            {admin ? <NavList.Item href="/admin">Admin</NavList.Item> : null}
            {members && <NavList.Item href="/members">Members</NavList.Item>}
            {pages.map((page) => (
              <NavList.Item key={page.href} href={page.href} selected={page.href === pathname}>
                {page.label}
              </NavList.Item>
            ))}
          </>
        }
      >
        {children}
      </AppShell.Root>
      <AppShell.Root
        navigationLabel="Secondary"
        navigation={
          <>
            <NavList.Item href="/">Home</NavList.Item>
            {links}
          </>
        }
      >
        {children}
      </AppShell.Root>
    </>
  );
}
