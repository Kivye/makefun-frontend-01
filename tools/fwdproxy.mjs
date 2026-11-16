// Local development bridge: loopback stays local; HTTPS tunnels use the environment egress proxy.
import http from 'node:http';
import net from 'node:net';
import tls from 'node:tls';

const proxyAddress = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
const upstream = proxyAddress ? new URL(proxyAddress) : null;
const authorization = upstream?.username
  ? 'Basic ' + Buffer.from(`${decodeURIComponent(upstream.username)}:${decodeURIComponent(upstream.password)}`).toString('base64')
  : null;

const server = http.createServer((request, response) => {
  try {
    const target = new URL(request.url);
    if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname)) {
      response.writeHead(403).end('Only loopback HTTP is allowed; remote requests must use HTTPS.');
      return;
    }
    const headers = { ...request.headers, host: target.host };
    delete headers['proxy-authorization'];
    delete headers['proxy-connection'];
    const localRequest = http.request(target, { method: request.method, headers }, upstreamResponse => {
      response.writeHead(upstreamResponse.statusCode, upstreamResponse.headers);
      upstreamResponse.pipe(response);
    });
    localRequest.on('error', () => {
      if (!response.headersSent) response.writeHead(502);
      response.end('Local server unavailable');
    });
    localRequest.setTimeout(20000, () => localRequest.destroy(new Error('Loopback timeout')));
    request.pipe(localRequest);
  } catch {
    response.writeHead(400).end('Invalid target');
  }
});

server.on('connect', (request, client, head) => {
  if (!upstream) {
    client.end('HTTP/1.1 502 Bad Gateway\r\n\r\nMissing HTTPS_PROXY');
    return;
  }
  const options = { host: upstream.hostname, port: Number(upstream.port || (upstream.protocol === 'https:' ? 443 : 80)) };
  const socket = upstream.protocol === 'https:' ? tls.connect(options) : net.connect(options);
  const fail = () => {
    if (!client.destroyed) client.end('HTTP/1.1 502 Bad Gateway\r\n\r\n');
    socket.destroy();
  };
  socket.on('error', fail);
  client.on('error', () => socket.destroy());
  client.on('close', () => socket.destroy());
  socket.setTimeout(30000, () => socket.destroy());
  socket.once(upstream.protocol === 'https:' ? 'secureConnect' : 'connect', () => {
    socket.write(`CONNECT ${request.url} HTTP/1.1\r\nHost: ${request.url}\r\n${authorization ? `Proxy-Authorization: ${authorization}\r\n` : ''}Connection: keep-alive\r\n\r\n`);
    let buffer = Buffer.alloc(0);
    const handshake = chunk => {
      buffer = Buffer.concat([buffer, chunk]);
      const end = buffer.indexOf('\r\n\r\n');
      if (end < 0) {
        if (buffer.length > 16384) fail();
        return;
      }
      socket.removeListener('data', handshake);
      if (!/^HTTP\/1\.[01] 200 /.test(buffer.toString('latin1', 0, end))) {
        fail();
        return;
      }
      socket.setTimeout(0);
      client.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (buffer.length > end + 4) client.write(buffer.subarray(end + 4));
      if (head.length) socket.write(head);
      socket.pipe(client);
      client.pipe(socket);
    };
    socket.on('data', handshake);
  });
});

server.on('clientError', (_error, socket) => socket.end('HTTP/1.1 400 Bad Request\r\n\r\n'));
server.listen(Number(process.argv[2] || 18080), '127.0.0.1', () => console.log('Development bridge listening on loopback'));
