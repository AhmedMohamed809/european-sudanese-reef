// POST /api/login  -> validate admin email + password.
// Body JSON: { email?: string, password: string }
// Only needs ADMIN_PASSWORD (and optionally ADMIN_EMAIL) — no GitHub token,
// so login works as soon as those are set, even before GITHUB_TOKEN.
const { checkLogin } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Server not configured', missing: ['ADMIN_PASSWORD'] });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (_) { body = null; } }
  if (!body) return res.status(400).json({ error: 'Invalid JSON body' });

  const email = (body.email || '').toString();
  const password = (body.password || '').toString();
  if (!checkLogin(email, password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  // Whether the dashboard can actually save yet (needs the GitHub token).
  const canSave = !!process.env.GITHUB_TOKEN;
  return res.status(200).json({ ok: true, canSave });
};
