import * as ui from '@envsemble/envui';

// 1.0 namespaces destructured and used through their members are 1.0 code.
const { Toast, Menu } = ui;
export const settings = (
  <Toast.Provider>
    <Menu.Root trigger="Settings">
      <Menu.Item>Profile</Menu.Item>
    </Menu.Root>
  </Toast.Provider>
);

// Used as the 0.x components, they are reported.
export function Legacy() {
  const { Menu: LegacyMenu, Toast: LegacyToast } = ui;
  return (
    <LegacyMenu trigger="Settings">
      <LegacyToast />
    </LegacyMenu>
  );
}

// Assigning destructures too.
let Input;
({ Input } = ui);
export const field = Input;
