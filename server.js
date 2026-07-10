const { readFile, stat } = require('node:fs/promises');
const { join, resolve } = require('node:path');
const http = require('node:http');

const root = resolve('/var/www/public');

// VARIANT 1: two literal-separator checks OR'd, routed through a
// separately-defined function — mirrors the real production shape that
// still triggered js/path-injection after the "make it literal" fix.
function isWithinRoot(root, target) {
  return target.startsWith(root + '/') || target.startsWith(root + '\\');
}

http.createServer(async (req, res) => {
  const url = req.url ?? '/';
  const filename = url.split('?')[0]?.replace(/^\/+/, '') ?? 'index.html';
  const target = resolve(join(root, filename));

  if (!isWithinRoot(root, target)) {
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
