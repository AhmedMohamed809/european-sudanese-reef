// POST /api/delete-member  -> remove a member (and its photo) from the repo.
// Body JSON: { index: number }  (index into the current members list)
// Removes the entry from members.json and deletes its image, in one commit.
const { isAuthed, requireEnv, readMembers, commitFiles, safeMemberFile } = require('./_lib');

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

  const index = Number(body.index);
  if (!Number.isInteger(index) || index < 0) return res.status(400).json({ error: 'Valid index required' });

  try {
    const { list } = await readMembers();
    if (index >= list.length) return res.status(404).json({ error: 'Member not found' });
    const [removed] = list.splice(index, 1);

    const files = [{ path: 'members.json', contentUtf8: JSON.stringify(list, null, 2) + '\n' }];
    // Delete the photo too, but only if no other member still uses it.
    const stillUsed = list.some((m) => m.f && m.f === removed.f);
    if (removed && removed.f && safeMemberFile(removed.f) && !stillUsed) {
      files.push({ path: `assets/img/${removed.f}`, remove: true });
    }
    const sha = await commitFiles(files, `Remove member ${removed && removed.n ? removed.n : ''} via admin dashboard`);
    return res.status(200).json({ ok: true, removed, commit: sha, count: list.length });
  } catch (e) {
    return res.status(502).json({ error: 'Could not delete member', detail: e.message });
  }
};
