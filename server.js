const { readFile, stat } = require('node:fs/promises');
const { join, resolve, relative, isAbsolute } = require('node:path');
const http = require('node:http');

const root = resolve('/var/www/public');

http.createServer(async (req, res) => {
  const url = req.url ?? '/';
  const filename = url.split('?')[0]?.replace(/^\/+/, '') ?? 'index.html';
  const target = resolve(join(root, filename));

  // VARIANT 4: path.relative()-based containment check, handles both
  // separators without an OR of two startsWith() calls.
  const rel = relative(root, target);
  if (rel.startsWith('..') || isAbsolute(rel)) {
    res.writeHead(403);
    res.end();
    return;
  }

  const st = await stat(target);
  if (st.isFile()) {
    const data = await readFile(target);
    res.end(data);
  } else {
    res.writeHead(404);
    res.end();
  }
});
