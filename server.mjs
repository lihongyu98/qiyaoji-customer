import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('./public/',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.ogg':'audio/ogg'};
http.createServer(async(req,res)=>{
 try{
  const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(p==='/__customer_health'){res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({app:'qiyaoji-customer-original',mode:'local'}));}
  if(p.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json; charset=utf-8'});return res.end(JSON.stringify({error:'本地客户版预览尚未连接云端模型服务；邮箱和标注同步需在原 WorkBuddy 域名使用。'}));}
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
  const target=path.resolve(root,'.'+(p==='/'?'/desktop.html':p));
  if(!target.startsWith(root)||!types[path.extname(target)]){res.writeHead(404);return res.end();}
  const body=await readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(18806,'127.0.0.1',()=>console.log('http://127.0.0.1:18806/desktop.html'));
