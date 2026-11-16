import http from 'node:http';
import net from 'node:net';
const upstream=new URL(process.env.HTTPS_PROXY||process.env.HTTP_PROXY);
const server=http.createServer((req,res)=>{
 const u=new URL(req.url);const local=['127.0.0.1','localhost'].includes(u.hostname);
 const q=http.request({hostname:local?u.hostname:upstream.hostname,port:local?(u.port||80):upstream.port,path:local?u.pathname+u.search:req.url,method:req.method,headers:{...req.headers,host:u.host}},r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res)});q.on('error',e=>{res.writeHead(502);res.end(e.message)});req.pipe(q);
});
server.on('connect',(req,client,head)=>{
 const socket=net.connect(Number(upstream.port)||80,upstream.hostname,()=>socket.write('CONNECT '+req.url+' HTTP/1.1\r\nHost: '+req.url+'\r\n\r\n'));
 let buffer=Buffer.alloc(0);
 const handshake=data=>{buffer=Buffer.concat([buffer,data]);const i=buffer.indexOf('\r\n\r\n');if(i<0)return;socket.off('data',handshake);if(!buffer.toString().startsWith('HTTP/1.1 200')&&!buffer.toString().startsWith('HTTP/1.0 200')){client.end(buffer);socket.destroy();return}client.write('HTTP/1.1 200 Connection Established\r\n\r\n');if(head.length)socket.write(head);const rest=buffer.subarray(i+4);if(rest.length)client.write(rest);socket.pipe(client);client.pipe(socket)};
 socket.on('data',handshake);socket.on('error',()=>client.destroy());client.on('error',()=>socket.destroy());client.on('close',()=>socket.destroy());
});
server.listen(18080,'127.0.0.1',()=>console.log('Forward proxy 127.0.0.1:18080 via HTTPS_PROXY'));
