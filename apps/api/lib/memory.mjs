import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const DB_PATH = process.env.HENRY_DB || path.resolve(process.cwd(), 'data/henry.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS kv (
  user  TEXT NOT NULL,
  key   TEXT NOT NULL,
  value TEXT,
  PRIMARY KEY(user, key)
);
CREATE TABLE IF NOT EXISTS turns (
  user    TEXT NOT NULL,
  ts      INTEGER NOT NULL,
  role    TEXT NOT NULL,
  content TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS turns_user_ts ON turns(user, ts);
`);

export function getKV(user, key) {
  const row = db.prepare('SELECT value FROM kv WHERE user=? AND key=?').get(user, key);
  return row?.value ?? null;
}
export function setKV(user, key, value) {
  db.prepare(`
    INSERT INTO kv(user, key, value) VALUES(?, ?, ?)
    ON CONFLICT(user, key) DO UPDATE SET value=excluded.value
  `).run(user, key, value);
}
export function addTurn(user, role, content, ts = Date.now()) {
  db.prepare('INSERT INTO turns(user, ts, role, content) VALUES(?, ?, ?, ?)').run(user, ts, role, content);
}
export function recentTurns(user, limit = 40) {
  const rows = db.prepare('SELECT role, content FROM turns WHERE user=? ORDER BY ts DESC LIMIT ?').all(user, limit);
  return rows.reverse(); // chronological
}
export function clearTurns(user) {
  db.prepare('DELETE FROM turns WHERE user=?').run(user);
}
