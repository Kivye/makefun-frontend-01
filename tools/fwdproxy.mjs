// Chromium sends loopback HTTP here; remote CONNECT is carried by the egress proxy.
import http from 'node:http';
import net from 'node:net';
import tls from 'node:tls';
const setting=process.env.HTTPS_PROXY||process.env.https_proxy||process.env.HTTP_PROXY;
const gateway=setting?new URL(setting):null;
const auth=gateway?.username?'Basic '+Buffer.from(decodeURIComponent(gateway.username)+':'+decodeURIComponent(gateway.password)).toString('base64'):'';
const bridge=http.createServer((req,res)=>{
  try {
    const url=new URL(req.url);
    if(!['127.0.0.1','localhost','[::1]'].includes(url.hostname)) {res.writeHead(403).end('HTTPS required');return;}
    const headers={...req.headers,host:url.host};delete headers['proxy-authorization'];delete headers['proxy-connection'];
    const local=http.request(url,{method:req.method,headers},reply=>{res.writeHead(reply.statusCode,reply.headers);reply.pipe(res);});
    local.on('error',()=>{if(!res.headersSent)res.writeHead(502);res.end('Loopback unavailable');});
    local.setTimeout(20000,()=>local.destroy());req.pipe(local);
  } catch {res.writeHead(400).end('Invalid proxy URL');}
});
bridge.on('connect',(req,client,head)=>{
  if(!gateway) {client.end('HTTP/1.1 502 Bad Gateway\r\n\r\n');return;}
  const secure=gateway.protocol==='https:';
  const options={host:gateway.hostname,port:Number(gateway.port||(secure?443:80))};
  const remote=secure?tls.connect(options):net.connect(options);
  const fail=()=>{remote.destroy();client.destroy();};
  remote.on('error',fail);client.on('error',fail);client.on('close',()=>remote.destroy());
  remote.setTimeout(30000,fail);
  remote.once(secure?'secureConnect':'connect',()=>{
    remote.write(`CONNECT ${req.url} HTTP/1.1\r\nHost: ${req.url}\r\n${auth?'Proxy-Authorization: '+auth+'\r\n':''}\r\n`);
    let bytes=Buffer.alloc(0);
    const handshake=chunk=>{
      bytes=Buffer.concat([bytes,chunk]);const end=bytes.indexOf('\r\n\r\n');
      if(end<0) {if(bytes.length>16384)fail();return;}
      remote.off('data',handshake);
      if(!/^HTTP\/1\.[01] 200\b/.test(bytes.toString('latin1',0,end))) {fail();return;}
      remote.setTimeout(0);client.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if(bytes.length>end+4)client.write(bytes.subarray(end+4));if(head.length)remote.write(head);
      remote.pipe(client);client.pipe(remote);
    };
    remote.on('data',handshake);
  });
});
bridge.on('clientError',(_error,socket)=>socket.destroy());
bridge.listen(Number(process.argv[2]||18080),'127.0.0.1',()=>console.log('Forward proxy ready on loopback'));
