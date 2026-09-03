import * as Crypto from "expo-crypto";

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export async function generateRecoveryKey(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return formatCrockford(encodeCrockford(bytes));
}

export function normalizeRecoveryKey(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/[IL]/g, "1")
    .replace(/O/g, "0")
    .replace(/[^0-9A-HJKMNP-TV-Z]/g, "");
}

function encodeCrockford(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

function formatCrockford(raw: string): string {
  const chunks: string[] = [];
  for (let index = 0; index < raw.length; index += 4) {
    chunks.push(raw.slice(index, index + 4));
  }
  return chunks.join("-");
}
