// Local development bridge: loopback stays local; HTTPS tunnels use the environment egress proxy.
import http from 'node:http';
import net from 'node:net';
import tls from 'node:tls';
const egress = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const upstream = egress ? new URL(egress) : null;
const auth = upstream?.username ? 'Basic ' + Buffer.from(decodeURIComponent(upstream.username) + ':' + decodeURIComponent(upstream.password)).toString('base64') : null;
const server = http.createServer((req,res) => {
  try {
    const url = new URL(req.url);
    if (!['127.0.0.1','localhost','[::1]'].includes(url.hostname)) { res.writeHead(403).end('Only loopback HTTP is allowed; remote requests must use HTTPS.'); return; }
    const headers = {...req.headers,host:url.host}; delete headers['proxy-authorization']; delete headers['proxy-connection'];
    const remote = http.request(url,{method:req.method,headers},reply=>{res.writeHead(reply.statusCode,reply.headers);reply.pipe(res);});
    remote.on('error',()=>{if(!res.headersSent)res.writeHead(502);res.end('Local server unavailable');});req.pipe(remote);
  } catch { res.writeHead(400).end('Invalid target'); }
});
server.on('connect',(req,client,head)=>{
  if (!upstream) { client.end('HTTP/1.1 502 Bad Gateway\r\n\r\nMissing HTTPS_PROXY'); return; }
  const options = {host:upstream.hostname,port:Number(upstream.port || (upstream.protocol==='https:'?443:80))};
  const socket = upstream.protocol === 'https:' ? tls.connect(options) : net.connect(options);
  const fail = () => { if (!client.destroyed) client.end('HTTP/1.1 502 Bad Gateway\r\n\r\n'); socket.destroy(); };
  socket.on('error',fail); client.on('error',()=>socket.destroy()); client.on('close',()=>socket.destroy());
  socket.setTimeout(30000,()=>socket.destroy());
  socket.once(upstream.protocol==='https:'?'secureConnect':'connect',()=>{
    socket.write(`CONNECT ${req.url} HTTP/1.1\r\nHost: ${upstream.host}\r\n${auth?'Proxy-Authorization: '+auth+'\r\n':''}Connection: keep-alive\r\n\r\n`);
    let buffer = Buffer.alloc(0);
    const handshake = chunk => {
      buffer = Buffer.concat([buffer,chunk]); const end = buffer.indexOf('\r\n\r\n');
      if (end < 0) { if(buffer.length>16384)fail(); return; }
      socket.removeListener('data',handshake);
      if (!/^HTTP\/1\.[01] 200 /.test(buffer.toString('latin1',0,end))) { fail(); return; }
      socket.setTimeout(0); client.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (buffer.length>end+4) client.write(buffer.subarray(end+4));
      if (head.length) socket.write(head); socket.pipe(client); client.pipe(socket);
    };
    socket.on('data',handshake);
  });
});
server.on('clientError',(_error,socket)=>socket.end('HTTP/1.1 400 Bad Request\r\n\r\n'));
server.listen(Number(process.argv[2] || 18080),'127.0.0.1',()=>console.log('Development bridge listening on loopback'));
