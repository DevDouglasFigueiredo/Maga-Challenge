const { createServer } = require('node:http');
const { once } = require('node:events');

const loopbackHost = '127.0.0.1';
const systemAssignedPort = 0;

async function startRateLimitServer() {
  const server = createServer((request, response) => {
    if (request.method === 'GET' && request.url === '/users/github') {
      response.writeHead(403, {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': '0',
      });
      response.end(JSON.stringify({ message: 'API rate limit exceeded' }));
      return;
    }

    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: 'Not Found' }));
  });

  server.listen(systemAssignedPort, loopbackHost);
  await once(server, 'listening');
  server.unref();

  return {
    url: `http://${loopbackHost}:${server.address().port}`,
    close() {
      return new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    },
  };
}

module.exports = { startRateLimitServer };
