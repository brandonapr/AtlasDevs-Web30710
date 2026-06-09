import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 3000;
const PUBLIC_DIR = path.resolve('dist/web');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  let filePath = path.join(PUBLIC_DIR, urlPath);

  // If path is a directory, serve index.html
  if (filePath.endsWith(path.sep) || (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory())) {
    filePath = path.join(filePath, 'index.html');
  }

  // Rewrite / routing rules matching render.yaml
  const exists = fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  if (!exists) {
    const routes = ['/menu', '/orden', '/login', '/admin', '/caja', '/cocina', '/mesera'];
    const matchedRoute = routes.find(route => urlPath === route || urlPath.startsWith(route + '/'));
    if (matchedRoute) {
      filePath = path.join(PUBLIC_DIR, matchedRoute, 'index.html');
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Not Found');
      return;
    }
  }

  const ext = path.extname(filePath);
  res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
