// GET /api/members  -> current members list (live from the repo).
// Requires the admin password (Bearer) so it doubles as the login check.
const { isAuthed, requireEnv, readMembers } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const missing = requireEnv();
  if (missing.length) return res.status(500).json({ error: 'Server not configured', missing });
  if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { list } = await readMembers();
    return res.status(200).json({ members: list });
  } catch (e) {
    return res.status(502).json({ error: 'Could not read members', detail: e.message });
  }
};
