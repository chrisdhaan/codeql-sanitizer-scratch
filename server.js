const { readFile, stat } = require('node:fs/promises');
const { join, resolve } = require('node:path');
const http = require('node:http');

const root = resolve('/var/www/public');

http.createServer(async (req, res) => {
  const url = req.url ?? '/';
  const filename = url.split('?')[0]?.replace(/^\/+/, '') ?? 'index.html';
  const target = resolve(join(root, filename));

  // VARIANT: BAD — no containment check at all.
  const st = await stat(target);
  if (st.isFile()) {
    const data = await readFile(target);
    res.end(data);
  } else {
    res.writeHead(404);
    res.end();
  }
});
