import { defaultThemeStorageKey } from "@envsemble/envui/theme-bootstrap";
import { createThemeBootstrapScript } from "@envsemble/envui/theme-bootstrap";

type StorageKey = typeof defaultThemeStorageKey;

export const key: StorageKey = defaultThemeStorageKey;
export const options = { defaultThemeStorageKey, storageKey: defaultThemeStorageKey };
export const script = createThemeBootstrapScript({ storageKey: defaultThemeStorageKey });
export const length = defaultThemeStorageKey.length;
