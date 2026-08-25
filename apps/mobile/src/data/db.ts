import * as SQLite from "expo-sqlite";

import { PRESET_TAGS } from "../domain/constants";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openDb();
  }
  return dbPromise;
}

async function openDb(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync("smer-diary.db");
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

  return db;
}
