// Local HTTP passes directly; CONNECT uses the configured HTTPS egress proxy.
import http from 'node:http';
import net from 'node:net';
import tls from 'node:tls';
const configured=process.env.HTTPS_PROXY||process.env.https_proxy||process.env.HTTP_PROXY;
const upstream=configured?new URL(configured):null;
const credential=upstream?.username?'Basic '+Buffer.from(decodeURIComponent(upstream.username)+':'+decodeURIComponent(upstream.password)).toString('base64'):'';
const server=http.createServer((request,response)=>{
  try {
    const url=new URL(request.url);
    if (!['localhost','127.0.0.1','[::1]'].includes(url.hostname)) {response.writeHead(403).end('Use HTTPS for remote requests');return;}
    const headers={...request.headers,host:url.host};
    delete headers['proxy-authorization'];delete headers['proxy-connection'];
    const relay=http.request(url,{method:request.method,headers},reply=>{response.writeHead(reply.statusCode,reply.headers);reply.pipe(response);});
    relay.on('error',()=>{if (!response.headersSent) response.writeHead(502);response.end();});
    relay.setTimeout(20000,()=>relay.destroy());request.pipe(relay);
  } catch {response.writeHead(400).end('Invalid target');}
});
server.on('connect',(request,client,head)=>{
  if (!upstream) {client.end('HTTP/1.1 502 Bad Gateway\r\n\r\n');return;}
  const secure=upstream.protocol==='https:', options={host:upstream.hostname,port:Number(upstream.port||(secure?443:80))};
  const socket=secure?tls.connect(options):net.connect(options);
  const stop=()=>{socket.destroy();client.destroy();};
  socket.on('error',stop);client.on('error',stop);client.on('close',()=>socket.destroy());socket.setTimeout(30000,stop);
  socket.once(secure?'secureConnect':'connect',()=>{
    socket.write('CONNECT '+request.url+' HTTP/1.1\r\nHost: '+request.url+'\r\n'+(credential?'Proxy-Authorization: '+credential+'\r\n':'')+'\r\n');
    let buffer=Buffer.alloc(0);
    function handshake(chunk) {
      buffer=Buffer.concat([buffer,chunk]);
      const end=buffer.indexOf('\r\n\r\n');
      if (end<0) {if (buffer.length>16384) stop();return;}
      socket.off('data',handshake);
      if (!/^HTTP\/1\.[01] 200\b/.test(buffer.toString('latin1',0,end))) {stop();return;}
      socket.setTimeout(0);client.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (buffer.length>end+4) client.write(buffer.subarray(end+4));
      if (head.length) socket.write(head);
      socket.pipe(client);client.pipe(socket);
    }
    socket.on('data',handshake);
  });
});
server.on('clientError',(_error,socket)=>socket.destroy());
server.listen(Number(process.argv[2]||18080),'127.0.0.1',()=>console.log('Forward proxy listening on 127.0.0.1:18080'));
