/**
 * Writes the VAPID keys to an env file, once (ported from EagleEye): `npm run vapid -w backend --
 * .env` (dev: backend/.env). Keys already there are kept, so the devices keep their subscriptions.
 * It prints the public key only: the private one never reaches the terminal, a log, git or the app.
 */
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import webpush from "web-push";
import { DEFAULT_VAPID_SUBJECT } from "../src/config.js";

const file = process.argv[2];
if (!file) {
  console.error("Usage: npm run vapid -w backend -- <env file>");
  process.exit(1);
}
const text = existsSync(file) ? readFileSync(file, "utf8") : "";
const has = (key: string) => new RegExp(`^${key}=\\S+`, "m").test(text);
if (has("VAPID_PUBLIC_KEY") && has("VAPID_PRIVATE_KEY")) {
  console.log(`The VAPID keys are already in ${file}: kept.`);
  process.exit(0);
}
if (has("VAPID_PUBLIC_KEY") || has("VAPID_PRIVATE_KEY")) {
  console.error(`${file} holds one VAPID key without the other: remove it, then run this again.`);
  process.exit(1);
}
const keys = webpush.generateVAPIDKeys();
const lines = [
  "# Web push (backend/README.md), written by npm run vapid: never commit or share the private key.",
  `VAPID_PUBLIC_KEY=${keys.publicKey}`,
  `VAPID_PRIVATE_KEY=${keys.privateKey}`,
  ...(has("VAPID_SUBJECT") ? [] : [`VAPID_SUBJECT=${DEFAULT_VAPID_SUBJECT}`]),
];
appendFileSync(file, `${text && !text.endsWith("\n") ? "\n" : ""}${lines.join("\n")}\n`);
console.log(`Wrote the VAPID keys to ${file}. The public key: ${keys.publicKey}`);
