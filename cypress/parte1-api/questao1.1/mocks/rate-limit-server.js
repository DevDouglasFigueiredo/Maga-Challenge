const { createServer } = require('node:http');
const { once } = require('node:events');
const tokenFixture = require('./token-expiration-fixture');

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

    const url = new URL(request.url, `http://${loopbackHost}`);
    if (request.method === 'GET' && url.pathname === '/api/users/2') {
      if (request.headers.authorization !== `Bearer ${tokenFixture.token}`) {
        response.writeHead(401, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'invalid_token', message: 'Invalid token' }));
        return;
      }

      // Relógio enviado exclusivamente pela simulação; não é um contrato do ReqRes.
      const simulatedNow = url.searchParams.get('now');
      if (simulatedNow === null || !/^\d+$/.test(simulatedNow)) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'invalid_simulated_time' }));
        return;
      }

      if (Number(simulatedNow) >= tokenFixture.tokenExpiresAt) {
        response.writeHead(401, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'token_expired', message: 'Token expired' }));
        return;
      }

      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ data: { id: 2 } }));
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
