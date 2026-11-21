// Every test: an in-memory IndexedDB (fake-indexeddb), and the screens' DOM cleaned after each one.
import "fake-indexeddb/auto";
import { afterEach } from "vitest";

afterEach(async () => {
  if (typeof document !== "undefined") {
    const { cleanup } = await import("@testing-library/react");
    cleanup();
  }
});
