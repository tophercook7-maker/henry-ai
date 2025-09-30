import express from 'express';
import { google } from 'googleapis';
import { getOAuth2Client, loadTokens } from '../lib/google';

const router = express.Router();

// List recent files (read-only)
router.get('/drive/list', async (req, res) => {
  try {
    const tokens = loadTokens('default');
    if (!tokens) return res.status(401).json({ error: 'Not connected' });

    const auth = getOAuth2Client();
    auth.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth });
    const r = await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name, mimeType, modifiedTime, owners(displayName))',
      orderBy: 'modifiedTime desc'
    });
    res.json({ files: r.data.files || [] });
  } catch (e:any) {
    res.status(500).json({ error: e?.message || 'Drive list failed' });
  }
});

// (Optional) Create a file (requires drive.file scope)
router.post('/drive/create', express.json(), async (req, res) => {
  try {
    const tokens = loadTokens('default');
    if (!tokens) return res.status(401).json({ error: 'Not connected' });

    const auth = getOAuth2Client();
    auth.setCredentials(tokens);

    const { name = 'henry-note.txt', content = 'Hello from Henry' } = req.body || {};
    const drive = google.drive({ version: 'v3', auth });

    const file = await drive.files.create({
      requestBody: { name, mimeType: 'text/plain' },
      media: { mimeType: 'text/plain', body: content }
    });

    res.json({ id: file.data.id, name });
  } catch (e:any) {
    res.status(500).json({ error: e?.message || 'Drive create failed' });
  }
});

export default router;
