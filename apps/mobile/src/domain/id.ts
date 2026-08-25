function webRandomUUID(): string | null {
  try {
    const randomUUID = globalThis.crypto?.randomUUID;
    if (typeof randomUUID !== "function") {
      return null;
    }
    return randomUUID.call(globalThis.crypto);
  } catch {
    return null;
  }
}

function fallbackUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const nibble = Math.floor(Math.random() * 16);
    const value = char === "x" ? nibble : (nibble & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function newId(): string {
  return webRandomUUID() ?? fallbackUUID();
}
