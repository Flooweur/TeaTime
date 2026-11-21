/**
 * Light or dark (SPEC §7; decisions of 2026-11-20 and 2026-11-21): a switch in Settings, kept on
 * this device only. Until it is first set, the app follows the device's own setting, and it can go
 * back to that. index.html applies the kept choice before the first paint.
 */
import { createStore, useStore } from "./store";

export type ThemeChoice = "device" | "light" | "dark";

const KEY = "teatime.theme";

function read(): ThemeChoice {
  try {
    const value = localStorage.getItem(KEY);
    return value === "light" || value === "dark" ? value : "device";
  } catch {
    return "device";
  }
}

const theme = createStore<ThemeChoice>(read());

/** Applies a choice to the page: `data-theme` on <html>, or none to follow the device. */
function apply(choice: ThemeChoice): void {
  if (choice === "device") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = choice;
}

export function setTheme(choice: ThemeChoice): void {
  try {
    if (choice === "device") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, choice);
  } catch {
    // Storage refused (a private window): the choice holds until the page is closed.
  }
  apply(choice);
  theme.set(choice);
}

export const useTheme = (): ThemeChoice => useStore(theme);
