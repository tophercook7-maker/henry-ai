import express from 'express';
import { google } from 'googleapis';
import { getOAuth2Client, saveTokens } from '../lib/google';

const router = express.Router();

// Start OAuth for Drive (read-only by default). Add ?mode=rw to request drive.file.
router.get('/oauth/google/start', async (req, res) => {
  try {
    const mode = (req.query.mode as string) || 'ro';
    const oAuth2Client = getOAuth2Client();

    const scopes = mode === 'rw'
      ? ['https://www.googleapis.com/auth/drive.file']
      : ['https://www.googleapis.com/auth/drive.readonly'];

    const url = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
    });
    res.redirect(url);
  } catch (e:any) {
    res.status(500).send(`OAuth start failed: ${e?.message||e}`);
  }
});

// OAuth callback
router.get('/oauth/google/callback', async (req, res) => {
  try {
    const code = req.query.code as string;
    if (!code) return res.status(400).send('Missing code');

    const oAuth2Client = getOAuth2Client();
    const { tokens } = await oAuth2Client.getToken(code);
    // Single-user dev: save under "default". Later: map to your user id.
    saveTokens('default', tokens as any);

    res.send(`<html><body style="font-family:sans-serif;background:#0f1116;color:#eef2f8">
      <h2>Google connected ✅</h2>
      <p>You can close this window and go back to Henry.</p>
    </body></html>`);
  } catch (e:any) {
    res.status(500).send(`OAuth callback failed: ${e?.message||e}`);
  }
});

export default router;
