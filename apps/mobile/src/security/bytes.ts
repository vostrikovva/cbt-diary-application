export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error("Некорректный ключ");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    const octet = hex.slice(index * 2, index * 2 + 2);
    const value = Number.parseInt(octet, 16);
    if (Number.isNaN(value)) {
      throw new Error("Некорректный ключ");
    }
    bytes[index] = value;
  }
  return bytes;
}

export function isDekHex(value: string): boolean {
  return /^[0-9a-f]{64}$/.test(value);
}
