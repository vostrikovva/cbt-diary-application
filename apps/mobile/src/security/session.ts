import * as Crypto from "expo-crypto";

import { lockDatabase, unlockDatabase, wipeDatabaseFile } from "../data/db";
import { bytesToHex, isDekHex } from "./bytes";
import { generateRecoveryKey, normalizeRecoveryKey } from "./recoveryKey";
import {
  deletePinWrap,
  deleteSystemDek,
  hasDeviceUserPresence,
  readPinWrap,
  readRecoveryDisplay,
  readRecoveryWrap,
  readSystemDek,
  readUnlockMethod,
  wipeVaultSecrets,
  writePinWrap,
  writeRecoveryDisplay,
  writeRecoveryWrap,
  writeSystemDek,
  writeUnlockMethod,
  type UnlockMethod,
} from "./secureVault";
import { openWithDek, sealWithDek, unwrapSecret, wrapSecret } from "./wrap";

export const PIN_LENGTH = 6;
const PIN_PATTERN = /^\d{6}$/;

export type SetupResult = {
  recoveryKey: string;
  method: UnlockMethod;
  dekHex: string;
};

async function persistRecovery(dekHex: string, recoveryKey: string): Promise<void> {
  const normalized = normalizeRecoveryKey(recoveryKey);
  const wrap = await wrapSecret(dekHex, normalized);
  const display = await sealWithDek(dekHex, recoveryKey);
  await writeRecoveryWrap(wrap);
  await writeRecoveryDisplay(display);
}

export async function setupVault(options: { pin?: string }): Promise<SetupResult> {
  const dekHex = bytesToHex(await Crypto.getRandomBytesAsync(32));
  const recoveryKey = await generateRecoveryKey();
  await persistRecovery(dekHex, recoveryKey);
  const useSystem = await hasDeviceUserPresence();
  if (useSystem) {
    await writeSystemDek(dekHex);
    await writeUnlockMethod("system");
    await unlockDatabase(dekHex);
    return { recoveryKey, method: "system", dekHex };
  }
  const pin = options.pin;
  if (!pin || !PIN_PATTERN.test(pin)) {
    throw new Error("Задайте PIN из 6 цифр");
  }
  await writePinWrap(await wrapSecret(dekHex, pin));
  await writeUnlockMethod("pin");
  await unlockDatabase(dekHex);
  return { recoveryKey, method: "pin", dekHex };
}

export async function unlockWithSystem(): Promise<string> {
  const dekHex = await readSystemDek();
  if (!dekHex || !isDekHex(dekHex)) {
    throw new Error("Системный вход недоступен. Используйте ключ восстановления.");
  }
  await unlockDatabase(dekHex);
  return dekHex;
}

export async function unlockWithPin(pin: string): Promise<string> {
  if (!PIN_PATTERN.test(pin)) {
    throw new Error("Неверный PIN");
  }
  const wrap = await readPinWrap();
  if (!wrap) {
    throw new Error("PIN не задан");
  }
  try {
    const dekHex = await unwrapSecret(wrap, pin);
    await unlockDatabase(dekHex);
    return dekHex;
  } catch {
    throw new Error("Неверный PIN");
  }
}

export async function unlockWithRecovery(input: string): Promise<{
  dekHex: string;
  needsAppPin: boolean;
}> {
  const wrap = await readRecoveryWrap();
  if (!wrap) {
    throw new Error("Ключ восстановления не задан");
  }
  try {
    const dekHex = await unwrapSecret(wrap, normalizeRecoveryKey(input));
    await unlockDatabase(dekHex);
    const presence = await hasDeviceUserPresence();
    const method = await readUnlockMethod();
    if (method === "system") {
      if (presence) {
        await writeSystemDek(dekHex);
        return { dekHex, needsAppPin: false };
      }
      await deleteSystemDek();
      await writeUnlockMethod("pin");
      return { dekHex, needsAppPin: true };
    }
    const pinWrap = await readPinWrap();
    return { dekHex, needsAppPin: !pinWrap };
  } catch {
    throw new Error("Неверный ключ восстановления");
  }
}

export async function setAppPin(dekHex: string, pin: string): Promise<void> {
  if (!PIN_PATTERN.test(pin)) {
    throw new Error("PIN должен быть из 6 цифр");
  }
  await writePinWrap(await wrapSecret(dekHex, pin));
  await writeUnlockMethod("pin");
}

export async function changePin(dekHex: string, currentPin: string, nextPin: string): Promise<void> {
  if (!PIN_PATTERN.test(nextPin)) {
    throw new Error("Новый PIN должен быть из 6 цифр");
  }
  const wrap = await readPinWrap();
  if (!wrap) {
    throw new Error("PIN не задан");
  }
  try {
    const opened = await unwrapSecret(wrap, currentPin);
    if (opened !== dekHex) {
      throw new Error("Неверный PIN");
    }
  } catch {
    throw new Error("Неверный PIN");
  }
  await writePinWrap(await wrapSecret(dekHex, nextPin));
}

export async function migrateToSystem(dekHex: string): Promise<void> {
  if (!(await hasDeviceUserPresence())) {
    throw new Error("Сначала поставьте код блокировки на телефоне");
  }
  await writeSystemDek(dekHex);
  await deletePinWrap();
  await writeUnlockMethod("system");
}

export async function rotateRecovery(dekHex: string): Promise<string> {
  const recoveryKey = await generateRecoveryKey();
  await persistRecovery(dekHex, recoveryKey);
  return recoveryKey;
}

export async function revealRecovery(dekHex: string): Promise<string> {
  const sealed = await readRecoveryDisplay();
  if (!sealed) {
    throw new Error("Ключ восстановления недоступен");
  }
  return openWithDek(sealed, dekHex);
}

export async function lockVault(): Promise<void> {
  await lockDatabase();
}

export async function wipeVault(): Promise<void> {
  await wipeDatabaseFile();
  await wipeVaultSecrets();
}

export async function currentUnlockMethod(): Promise<UnlockMethod | null> {
  return readUnlockMethod();
}

export type VaultGateBootstrap =
  | { kind: "setup"; useSystem: boolean }
  | { kind: "locked"; method: UnlockMethod; error?: string }
  | { kind: "unlocked"; dekHex: string; method: UnlockMethod };

export async function bootstrapVaultGate(): Promise<VaultGateBootstrap> {
  const stored = await readUnlockMethod();
  if (!stored) {
    return { kind: "setup", useSystem: await hasDeviceUserPresence() };
  }
  if (stored === "system") {
    try {
      const dekHex = await unlockWithSystem();
      return { kind: "unlocked", dekHex, method: "system" };
    } catch {
      return {
        kind: "locked",
        method: "system",
        error: "Не удалось войти. Введите ключ восстановления или повторите попытку.",
      };
    }
  }
  return { kind: "locked", method: stored };
}

export { hasDeviceUserPresence, readUnlockMethod };
