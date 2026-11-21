// Draws TeaTime's app icons as PNGs, with no dependencies (ported from EagleEye's):
// npm run icons -w frontend. A tea bowl in tea-brown on the journal's cream, with an amber seal on
// it, after the Warm journal look (docs/design/README.md). The maskable icon keeps the bowl inside
// the safe zone that Android and Chromium crop to. A designed icon can replace these later; the
// file names stay.
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

const PAPER = [243, 235, 221]; // --color-bg
const INK = [110, 63, 30]; // --color-accent
const TEA = [138, 86, 15]; // --color-highlight-ink
const AMBER = [184, 120, 28]; // --color-highlight

/** One pixel's colour, at (dx, dy) from the centre in units of the icon's size; `k` scales the drawing. */
function shade(dx, dy, k) {
  const x = dx / k;
  const y = dy / k;
  // The bowl: the lower half of a disc, under a rim.
  const inBowl = y > -0.05 && Math.hypot(x, y + 0.05) < 0.36;
  const onRim = Math.abs(y + 0.05) < 0.035 && Math.abs(x) < 0.4;
  const inFoot = y > 0.3 && y < 0.36 && Math.abs(x) < 0.14;
  // The tea's surface, seen just over the rim, and a round seal on the bowl.
  const inTea = y < -0.05 && y > -0.12 && Math.abs(x) < 0.32 && Math.hypot(x / 0.34, (y + 0.05) / 0.09) < 1;
  const inSeal = Math.hypot(x - 0.12, y - 0.12) < 0.07;
  // Two strands of steam.
  const steam = (cx) => Math.abs(x - cx - 0.035 * Math.sin((y + 0.2) * 22)) < 0.022 && y > -0.42 && y < -0.17;
  if (inSeal) return AMBER;
  if (inBowl || onRim || inFoot) return INK;
  if (inTea) return TEA;
  if (steam(-0.09) || steam(0.09)) return INK;
  return PAPER;
}

function png(size, k) {
  const samples = 4; // 4×4 supersampling per pixel, for smooth edges
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = [0];
    for (let x = 0; x < size; x++) {
      const acc = [0, 0, 0];
      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const px = shade((x + (sx + 0.5) / samples) / size - 0.5, (y + (sy + 0.5) / samples) / size - 0.5, k);
          for (let i = 0; i < 3; i++) acc[i] += px[i];
        }
      }
      row.push(...acc.map((v) => Math.round(v / (samples * samples))));
    }
    rows.push(Buffer.from(row));
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const icons = [
  ["icon-192.png", 192, 1],
  ["icon-512.png", 512, 1],
  ["apple-touch-icon.png", 180, 1],
  ["icon-maskable-512.png", 512, 0.8],
];
for (const [name, size, k] of icons) {
  writeFileSync(new URL(`../public/${name}`, import.meta.url), png(size, k));
  console.log(`public/${name} (${size}×${size})`);
}
