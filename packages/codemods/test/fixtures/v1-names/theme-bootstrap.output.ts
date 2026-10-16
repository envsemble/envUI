import { createThemeBootstrapScript } from "@envsemble/envui/theme-bootstrap";

type StorageKey = "env-theme";

export const key: StorageKey = "env-theme";
export const options = { defaultThemeStorageKey: "env-theme", storageKey: "env-theme" };
export const script = createThemeBootstrapScript({ storageKey: "env-theme" });
export const length = "env-theme".length;
