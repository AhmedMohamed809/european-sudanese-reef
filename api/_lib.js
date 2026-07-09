// Shared helpers for the members-admin API (CommonJS, zero dependencies).
// Files under /api starting with "_" are not exposed as routes by Vercel.
const crypto = require('crypto');

const OWNER  = process.env.GH_OWNER  || 'AhmedMohamed809';
const REPO   = process.env.GH_REPO   || 'european-sudanese-reef';
const BRANCH = process.env.GH_BRANCH || 'main';
const TOKEN  = process.env.GITHUB_TOKEN;
const PASSWORD = process.env.ADMIN_PASSWORD;

const MEMBERS_PATH = 'members.json';
const IMG_DIR = 'assets/img';
const ALLOWED_EXT = { jpg: 'jpg', jpeg: 'jpg', png: 'png', webp: 'webp' };

// Constant-time password check against ADMIN_PASSWORD.
function isAuthed(req) {
  if (!PASSWORD) return false;
  const hdr = req.headers['authorization'] || '';
  const provided = hdr.startsWith('Bearer ') ? hdr.slice(7) : '';
  const a = Buffer.from(String(provided));
  const b = Buffer.from(String(PASSWORD));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function requireEnv() {
  const missing = [];
  if (!TOKEN) missing.push('GITHUB_TOKEN');
  if (!PASSWORD) missing.push('ADMIN_PASSWORD');
  return missing;
}

async function gh(path, opts = {}) {
  const res = await fetch('https://api.github.com' + path, {
    ...opts,
    headers: {
      'Authorization': 'Bearer ' + TOKEN,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'esr-members-admin',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch (_) { body = text; }
  if (!res.ok) {
    const msg = (body && body.message) ? body.message : ('GitHub API ' + res.status);
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return body;
}

// Read members.json from the repo. Returns { list, sha }.
async function readMembers() {
  try {
    const data = await gh(`/repos/${OWNER}/${REPO}/contents/${MEMBERS_PATH}?ref=${BRANCH}`);
    const json = Buffer.from(data.content || '', 'base64').toString('utf8');
    const list = JSON.parse(json || '[]');
    return { list: Array.isArray(list) ? list : [], sha: data.sha };
  } catch (e) {
    if (e.status === 404) return { list: [], sha: null };
    throw e;
  }
}

// Commit one or more files in a single commit.
// files: [{ path, contentBase64 }] | [{ path, contentUtf8 }] | [{ path, remove: true }]
async function commitFiles(files, message) {
  const ref = await gh(`/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
  const baseSha = ref.object.sha;
  const baseCommit = await gh(`/repos/${OWNER}/${REPO}/git/commits/${baseSha}`);
  const baseTreeSha = baseCommit.tree.sha;

  const tree = [];
  for (const f of files) {
    if (f.remove) {
      tree.push({ path: f.path, mode: '100644', type: 'blob', sha: null });
      continue;
    }
    const blob = await gh(`/repos/${OWNER}/${REPO}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify(
        f.contentBase64 != null
          ? { content: f.contentBase64, encoding: 'base64' }
          : { content: f.contentUtf8, encoding: 'utf-8' }
      ),
    });
    tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
  }

  const newTree = await gh(`/repos/${OWNER}/${REPO}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: baseTreeSha, tree }),
  });
  const newCommit = await gh(`/repos/${OWNER}/${REPO}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message, tree: newTree.sha, parents: [baseSha] }),
  });
  await gh(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: newCommit.sha }),
  });
  return newCommit.sha;
}

function slugId() {
  return crypto.randomBytes(4).toString('hex');
}

// Safe, unique image filename inside assets/img (no path traversal, known ext).
function makeImageName(ext) {
  const clean = ALLOWED_EXT[String(ext || '').toLowerCase()];
  if (!clean) return null;
  return `member-${slugId()}.${clean}`;
}

function safeMemberFile(name) {
  // Only allow a bare filename that lives directly in assets/img.
  return typeof name === 'string' && /^[A-Za-z0-9._-]+$/.test(name) && !name.includes('..');
}

module.exports = {
  OWNER, REPO, BRANCH, MEMBERS_PATH, IMG_DIR, ALLOWED_EXT,
  isAuthed, requireEnv, gh, readMembers, commitFiles, makeImageName, safeMemberFile,
};
