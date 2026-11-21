import { describe, expect, it } from "vitest";
import { keyBytes, madeWith } from "./push";

// A VAPID public key's shape: 65 bytes, URL-safe base64 without padding.
const KEY = "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM";

const subscriptionWith = (bytes: Uint8Array | null) =>
  ({ options: { applicationServerKey: bytes ? bytes.buffer : null } }) as unknown as PushSubscription;

describe("this device's pushes (SPEC §3.8)", () => {
  it("reads a VAPID key as the 65 bytes subscribe takes", () => {
    const bytes = keyBytes(KEY);
    expect(bytes.length).toBe(65);
    expect(bytes[0]).toBe(0x04);
  });

  it("tells a subscription made with the server's key from one made with another", () => {
    expect(madeWith(subscriptionWith(keyBytes(KEY)), KEY)).toBe(true);
    const other = keyBytes(KEY);
    other[10] = (other[10] ?? 0) ^ 1;
    expect(madeWith(subscriptionWith(other), KEY)).toBe(false);
    expect(madeWith(subscriptionWith(null), KEY)).toBe(false);
  });
});
