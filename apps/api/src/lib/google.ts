import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';

const DB_PATH = path.join(process.env.HOME || process.cwd(), 'henry', 'data', 'google-tokens.json');

type Tok = {
  access_token: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
};
type Db = Record<string, Tok>;

function readDb(): Db {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
  catch { return {}; }
}
function writeDb(db: Db) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function saveTokens(userId: string, tok: Tok){
  const db = readDb(); db[userId] = tok; writeDb(db);
}
export function loadTokens(userId: string): Tok | null {
  const db = readDb(); return db[userId] || null;
}

export function getOAuth2Client() {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI = 'http://127.0.0.1:3000/oauth/google/callback',
  } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET');
  }

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}
