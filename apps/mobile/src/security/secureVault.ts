import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

export type UnlockMethod = "system" | "pin";

const KEYS = {
  method: "smer.unlockMethod",
  dek: "smer.dek",
  pinWrap: "smer.pinWrap",
  recoveryWrap: "smer.recoveryWrap",
  recoveryDisplay: "smer.recoveryDisplay",
} as const;

const deviceOnly = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

const authOptions: SecureStore.SecureStoreOptions = {
  ...deviceOnly,
  requireAuthentication: true,
  authenticationPrompt: "Разблокируйте дневник",
};

export async function hasDeviceUserPresence(): Promise<boolean> {
  const level = await LocalAuthentication.getEnrolledLevelAsync();
  return level !== LocalAuthentication.SecurityLevel.NONE;
}

export async function readUnlockMethod(): Promise<UnlockMethod | null> {
  const value = await SecureStore.getItemAsync(KEYS.method, deviceOnly);
  if (value === "system" || value === "pin") {
    return value;
  }
  return null;
}

export async function writeUnlockMethod(method: UnlockMethod): Promise<void> {
  await SecureStore.setItemAsync(KEYS.method, method, deviceOnly);
}

export async function writeSystemDek(dekHex: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.dek, dekHex, authOptions);
}

export async function readSystemDek(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.dek, authOptions);
}

export async function deleteSystemDek(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.dek, deviceOnly);
}

export async function writePinWrap(json: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.pinWrap, json, deviceOnly);
}

export async function readPinWrap(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.pinWrap, deviceOnly);
}

export async function deletePinWrap(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.pinWrap, deviceOnly);
}

export async function writeRecoveryWrap(json: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.recoveryWrap, json, deviceOnly);
}

export async function readRecoveryWrap(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.recoveryWrap, deviceOnly);
}

export async function writeRecoveryDisplay(json: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.recoveryDisplay, json, deviceOnly);
}

export async function readRecoveryDisplay(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.recoveryDisplay, deviceOnly);
}

export async function wipeVaultSecrets(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.method, deviceOnly),
    SecureStore.deleteItemAsync(KEYS.dek, deviceOnly),
    SecureStore.deleteItemAsync(KEYS.pinWrap, deviceOnly),
    SecureStore.deleteItemAsync(KEYS.recoveryWrap, deviceOnly),
    SecureStore.deleteItemAsync(KEYS.recoveryDisplay, deviceOnly),
  ]);
}
