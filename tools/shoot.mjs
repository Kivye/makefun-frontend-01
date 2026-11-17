import {createRequire} from 'node:module';
import {readdir,mkdir,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE);
export async function browser(){const cache=join(process.env.HOME,'.cache/ms-playwright');const dir=(await readdir(cache)).find(n=>n.startsWith('chromium-'));return chromium.launch({executablePath:join(cache,dir,'chrome-linux/chrome'),headless:true,args:['--no-sandbox','--ignore-certificate-errors','--proxy-bypass-list=<-loopback>'],proxy:{server:'http://127.0.0.1:18080'}})}
if(process.argv[1]===fileURLToPath(import.meta.url)){const root=fileURLToPath(new URL('../',import.meta.url)),b=await browser(),page=await b.newPage({viewport:{width:1280,height:800}});page.on('pageerror',e=>console.error(e));await mkdir(join(root,'screenshots'),{recursive:true});let first=true;for(const shot of JSON.parse(await readFile(join(root,'shots.json'),'utf8'))){await page.goto('http://127.0.0.1:8081/'+shot.route);await page.waitForFunction(()=>window.__shotReady===true,null,{timeout:90000});if(first){await page.locator('#sort').click();first=false}await page.screenshot({path:join(root,'screenshots',shot.file),type:'jpeg',quality:82});console.log(shot.file,await page.locator('footer').innerText())}await b.close()}
