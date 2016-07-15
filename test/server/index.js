const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

module.exports = http.createServer((request, response) => {
  const uri = url.parse(request.url).pathname;
  const filename = path.join(process.cwd(), 'server', uri);
  const contentTypesByExtension = {
    '.html': 'text/html',
    '.js':   'text/javascript'
  };
  fs.readFile(filename, 'binary', (err, file) => {
    if (err) {
      response.writeHead(404, {'Content-Type': 'text/plain'});
      response.write('');
      response.end();
      return;
    }
    const headers = {};
    const contentType = contentTypesByExtension[path.extname(filename)];
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    response.writeHead(200, headers);
    response.write(file, 'binary');
    response.end();
  });
});
