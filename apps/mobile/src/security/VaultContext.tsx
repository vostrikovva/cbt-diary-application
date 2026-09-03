import { createContext, useContext } from "react";

import type { UnlockMethod } from "./secureVault";

export type VaultContextValue = {
  dekHex: string;
  method: UnlockMethod;
  setMethod: (method: UnlockMethod) => void;
  lockNow: () => void;
};

export const VaultContext = createContext<VaultContextValue | null>(null);

export function useVault(): VaultContextValue {
  const value = useContext(VaultContext);
  if (!value) {
    throw new Error("Дневник заблокирован");
  }
  return value;
}
