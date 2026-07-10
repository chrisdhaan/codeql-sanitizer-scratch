const { readFile, stat } = require('node:fs/promises');
const { join, resolve, relative, isAbsolute } = require('node:path');
const http = require('node:http');

const root = resolve('/var/www/public');

// VARIANT 5: same path.relative() check as Variant 4, but routed through a
// separately-defined exported function — mirrors production's actual
// structure (isWithinRoot() needs to stay a testable, exported function).
function isWithinRoot(root, target) {
  const rel = relative(root, target);
  return !(rel.startsWith('..') || isAbsolute(rel));
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
