import { gcm } from "@noble/ciphers/aes.js";
import { pbkdf2Async } from "@noble/hashes/pbkdf2.js";
import { sha256 } from "@noble/hashes/sha2.js";
import * as Crypto from "expo-crypto";

import { bytesToHex, hexToBytes } from "./bytes";

const ITERATIONS = 120_000;
const SALT_LEN = 16;
const NONCE_LEN = 12;
const KEY_LEN = 32;

export type SecretWrap = {
  v: 1;
  salt: string;
  nonce: string;
  ct: string;
  iterations: number;
};

function isSecretWrap(value: unknown): value is SecretWrap {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    record.v === 1 &&
    typeof record.salt === "string" &&
    typeof record.nonce === "string" &&
    typeof record.ct === "string" &&
    typeof record.iterations === "number" &&
    record.iterations >= 0
  );
}

export function parseSecretWrap(json: string): SecretWrap {
  const parsed: unknown = JSON.parse(json);
  if (!isSecretWrap(parsed)) {
    throw new Error("Повреждены данные разблокировки");
  }
  return parsed;
}

export async function wrapSecret(secretHex: string, password: string): Promise<string> {
  const salt = await Crypto.getRandomBytesAsync(SALT_LEN);
  const nonce = await Crypto.getRandomBytesAsync(NONCE_LEN);
  const key = await pbkdf2Async(sha256, password, salt, { c: ITERATIONS, dkLen: KEY_LEN });
  const cipher = gcm(key, nonce);
  const ct = cipher.encrypt(hexToBytes(secretHex));
  const payload: SecretWrap = {
    v: 1,
    salt: bytesToHex(salt),
    nonce: bytesToHex(nonce),
    ct: bytesToHex(ct),
    iterations: ITERATIONS,
  };
  return JSON.stringify(payload);
}

export async function unwrapSecret(json: string, password: string): Promise<string> {
  const wrap = parseSecretWrap(json);
  if (wrap.iterations < 1000) {
    throw new Error("Повреждены данные разблокировки");
  }
  const key = await pbkdf2Async(sha256, password, hexToBytes(wrap.salt), {
    c: wrap.iterations,
    dkLen: KEY_LEN,
  });
  const cipher = gcm(key, hexToBytes(wrap.nonce));
  return bytesToHex(cipher.decrypt(hexToBytes(wrap.ct)));
}

export async function sealWithDek(dekHex: string, plaintext: string): Promise<string> {
  const nonce = await Crypto.getRandomBytesAsync(NONCE_LEN);
  const salt = await Crypto.getRandomBytesAsync(SALT_LEN);
  const cipher = gcm(hexToBytes(dekHex), nonce);
  const ct = cipher.encrypt(new TextEncoder().encode(plaintext));
  const payload: SecretWrap = {
    v: 1,
    salt: bytesToHex(salt),
    nonce: bytesToHex(nonce),
    ct: bytesToHex(ct),
    iterations: 0,
  };
  return JSON.stringify(payload);
}

export function openWithDek(json: string, dekHex: string): string {
  const parsed: unknown = JSON.parse(json);
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Повреждены данные разблокировки");
  }
  const record = parsed as Record<string, unknown>;
  if (record.v !== 1 || typeof record.nonce !== "string" || typeof record.ct !== "string") {
    throw new Error("Повреждены данные разблокировки");
  }
  const cipher = gcm(hexToBytes(dekHex), hexToBytes(record.nonce));
  return new TextDecoder().decode(cipher.decrypt(hexToBytes(record.ct)));
}
