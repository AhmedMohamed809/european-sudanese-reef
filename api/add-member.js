// POST /api/add-member  -> add a member (name, optional title, photo) to the repo.
// Body JSON: { name: string, title?: string, imageBase64?: string, imageExt?: 'jpg'|'png'|'webp' }
// Commits the photo into assets/img/ and the entry into members.json in one commit.
const { isAuthed, requireEnv, readMembers, commitFiles, makeImageName } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const missing = requireEnv();
  if (missing.length) return res.status(500).json({ error: 'Server not configured', missing });
  if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (_) { body = null; } }
  if (!body) return res.status(400).json({ error: 'Invalid JSON body' });

  const name = (body.name || '').toString().trim();
  const title = (body.title || '').toString().trim();
  if (!name) return res.status(400).json({ error: 'Name is required' });
  if (name.length > 120 || title.length > 80) return res.status(400).json({ error: 'Name or title too long' });

  const files = [];
  const member = { n: name };
  if (title) member.r = title;

  if (body.imageBase64) {
    const fname = makeImageName(body.imageExt);
    if (!fname) return res.status(400).json({ error: 'Unsupported image type (use jpg, png, or webp)' });
    const b64 = String(body.imageBase64).replace(/^data:[^;]+;base64,/, '');
    // ~5MB base64 ceiling as a safety net (client downsizes well below this).
    if (b64.length > 7_000_000) return res.status(413).json({ error: 'Image too large' });
    files.push({ path: `assets/img/${fname}`, contentBase64: b64 });
    member.f = fname;
  } else {
    member.f = '';
  }

  try {
    const { list } = await readMembers();
    list.push(member);
    files.push({ path: 'members.json', contentUtf8: JSON.stringify(list, null, 2) + '\n' });
    const sha = await commitFiles(files, `Add member ${name} via admin dashboard`);
    return res.status(200).json({ ok: true, member, commit: sha, count: list.length });
  } catch (e) {
    return res.status(502).json({ error: 'Could not save member', detail: e.message });
  }
};
