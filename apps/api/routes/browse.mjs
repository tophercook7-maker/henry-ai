import { fetch } from 'undici';

/** Adds POST /browse {url} -> {ok, status, title, text} */
export function route(app){
  app.post('/browse', async (req, res) => {
    try{
      const { url } = req.body || {};
      if(!url || typeof url !== 'string' || !/^https?:\/\//i.test(url)){
        return res.status(400).json({ ok:false, error:'missing or bad url' });
      }

      const r = await fetch(url, { redirect:'follow', headers:{'user-agent':'HenryAI/1.0 (+local)'} });
      const ct = (r.headers.get('content-type') || '').toLowerCase();
      const isText = /text\/|application\/(json|xml|xhtml)/.test(ct);
      const raw = isText ? await r.text() : '';
      const titleMatch = raw.match(/<title[^>]*>([^<]*)<\/title>/i);
      const title = (titleMatch && titleMatch[1] || '').trim();
      const text = raw.replace(/<script[\s\S]*?<\/script>/gi,'')
                      .replace(/<style[\s\S]*?<\/style>/gi,'')
                      .replace(/<[^>]+>/g,' ')
                      .replace(/\s+/g,' ')
                      .trim()
                      .slice(0, 20000);

      res.json({ ok:true, status:r.status, title, contentType:ct, text });
    }catch(e){
      res.status(502).json({ ok:false, error:String(e?.message || e) });
    }
  });
}
