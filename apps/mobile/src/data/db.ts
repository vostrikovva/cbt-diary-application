import { File } from "expo-file-system";
import * as SQLite from "expo-sqlite";

import { PRESET_TAGS } from "../domain/constants";
import { isDekHex } from "../security/bytes";

const DB_NAME = "smer-diary.db";
const ENC_TMP = "smer-diary-enc.db";

let sessionDek: string | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!sessionDek || !dbPromise) {
    throw new Error("Дневник заблокирован");
  }
  return dbPromise;
}

export async function unlockDatabase(dekHex: string): Promise<void> {
  if (!isDekHex(dekHex)) {
    throw new Error("Некорректный ключ");
  }
  await lockDatabase();
  sessionDek = dekHex;
  dbPromise = openEncryptedDb(dekHex);
  await dbPromise;
}

export async function lockDatabase(): Promise<void> {
  const pending = dbPromise;
  dbPromise = null;
  sessionDek = null;
  if (!pending) {
    return;
  }
  const db = await pending.catch(() => null);
  if (db) {
    await db.closeAsync();
  }
}

async function openEncryptedDb(dekHex: string): Promise<SQLite.SQLiteDatabase> {
  const keyed = await tryOpenWithKey(dekHex);
  if (keyed) {
    await applySchema(keyed);
    return keyed;
  }
  if (await looksLikePlaintext()) {
    await migratePlaintext(dekHex);
    const migrated = await tryOpenWithKey(dekHex);
    if (!migrated) {
      throw new Error("Не удалось зашифровать дневник");
    }
    await applySchema(migrated);
    return migrated;
  }
  const created = await SQLite.openDatabaseAsync(DB_NAME);
  await applyKey(created, dekHex);
  await applySchema(created);
  return created;
}

async function tryOpenWithKey(dekHex: string): Promise<SQLite.SQLiteDatabase | null> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await applyKey(db, dekHex);
  try {
    await db.getFirstAsync("SELECT count(*) AS c FROM sqlite_master");
    return db;
  } catch {
    await db.closeAsync();
    return null;
  }
}

async function looksLikePlaintext(): Promise<boolean> {
  const db = await SQLite.openDatabaseAsync(DB_NAME, { useNewConnection: true });
  try {
    await db.getFirstAsync("SELECT count(*) AS c FROM sqlite_master");
    await db.closeAsync();
    return true;
  } catch {
    await db.closeAsync().catch(() => undefined);
    return false;
  }
}

async function migratePlaintext(dekHex: string): Promise<void> {
  const directory = String(SQLite.defaultDatabaseDirectory);
  const tmpFile = new File(directory, ENC_TMP);
  if (tmpFile.exists) {
    tmpFile.delete();
  }
  const plain = await SQLite.openDatabaseAsync(DB_NAME, { useNewConnection: true });
  const attachPath = sqliteFsPath(directory, ENC_TMP).replace(/'/g, "''");
  await plain.execAsync(`ATTACH DATABASE '${attachPath}' AS encrypted KEY "x'${dekHex}'";`);
  await plain.getFirstAsync("SELECT sqlcipher_export('encrypted') AS ok");
  await plain.execAsync("DETACH DATABASE encrypted;");
  await plain.closeAsync();
  await SQLite.deleteDatabaseAsync(DB_NAME);
  deleteSidecars(DB_NAME);
  const dest = new File(directory, DB_NAME);
  await tmpFile.move(dest);
  deleteSidecars(ENC_TMP);
}

function deleteSidecars(name: string): void {
  const directory = String(SQLite.defaultDatabaseDirectory);
  for (const suffix of [`${name}-wal`, `${name}-shm`]) {
    const file = new File(directory, suffix);
    if (file.exists) {
      file.delete();
    }
  }
}

function sqliteFsPath(directory: string, name: string): string {
  const withoutScheme = directory.replace(/^file:\/\//, "");
  const trimmed = withoutScheme.endsWith("/") ? withoutScheme.slice(0, -1) : withoutScheme;
  return `${trimmed}/${name}`;
}

async function applyKey(db: SQLite.SQLiteDatabase, dekHex: string): Promise<void> {
  await db.execAsync(`PRAGMA key = "x'${dekHex}'";`);
}

async function applySchema(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE,
      is_preset INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY NOT NULL,
      situation TEXT NOT NULL,
      occurred_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS entry_thoughts (
      id TEXT PRIMARY KEY NOT NULL,
      entry_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      label TEXT NOT NULL,
      intensity INTEGER NOT NULL,
      FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS entry_emotions (
      id TEXT PRIMARY KEY NOT NULL,
      entry_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      label TEXT NOT NULL,
      intensity INTEGER NOT NULL,
      FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS entry_reactions (
      id TEXT PRIMARY KEY NOT NULL,
      entry_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      label TEXT NOT NULL,
      intensity INTEGER NOT NULL,
      FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS entry_tags (
      entry_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (entry_id, tag_id),
      FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );
  `);

  for (const tag of PRESET_TAGS) {
    await db.runAsync(
      "INSERT OR IGNORE INTO tags (id, name, is_preset) VALUES (?, ?, 1)",
      tag.id,
      tag.name,
    );
  }
}

export async function wipeDatabaseFile(): Promise<void> {
  await lockDatabase();
  try {
    await SQLite.deleteDatabaseAsync(DB_NAME);
    deleteSidecars(DB_NAME);
  } catch {
    // file may not exist yet
  }
}
