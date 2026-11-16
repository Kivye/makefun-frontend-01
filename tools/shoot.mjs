import {chromium} from 'playwright-core';
import {mkdirSync,readFileSync,statSync} from 'node:fs';
const browser=await chromium.launch({headless:true,proxy:{server:'http://127.0.0.1:18080',bypass:'<-loopback>'},args:['--no-sandbox','--proxy-bypass-list=<-loopback>']});
try{
const context=await browser.newContext({viewport:{width:1280,height:800},ignoreHTTPSErrors:true});
const page=await context.newPage();
page.on('pageerror',e=>console.error(e));
page.on('requestfailed',r=>console.error('request failed',r.url(),r.failure()));
mkdirSync('screenshots',{recursive:true});
await page.goto('http://127.0.0.1:8081/');
await page.waitForFunction(()=>window.__shotReady===true,{},{timeout:180000});
for(const shot of JSON.parse(readFileSync('shots.json'))){
 await page.evaluate(hash=>{window.__shotReady=false;if(location.hash===hash)location.hash='';location.hash=hash},shot.route);
 await page.waitForFunction(()=>window.__shotReady===true,{},{timeout:180000});
 await page.screenshot({path:'screenshots/'+shot.file,type:'jpeg',quality:82});
 if(statSync('screenshots/'+shot.file).size>262144)throw Error('oversized shot');
 console.log(shot.file,await page.locator('footer').innerText(),statSync('screenshots/'+shot.file).size);
}
}finally{await browser.close()}
