(async()=>{
 'use strict';
 const cfg=window.CUSTOMER_CONFIG;let cloud=null,user=null;
 try{if(location.origin===cfg.endpoint){cloud=window.WorkBuddyCloud.createWorkBuddyCloud(cfg);const r=await cloud.auth.getSession();if(r.error)throw Error(r.error.message);user=r.data?.user||r.data;if(!user?.id)user=null;}}
 catch(e){document.body.textContent='登录状态暂时无法确认，请刷新重试：'+e.message;return;}
 const owner=user?.id||'guest',prefix='qiyaoji-client:'+owner+':',raw=window.localStorage;
 const scoped={getItem:k=>raw.getItem(prefix+k),setItem:(k,v)=>raw.setItem(prefix+k,String(v)),removeItem:k=>raw.removeItem(prefix+k),clear:()=>{for(const k of Object.keys(raw))if(k.startsWith(prefix))raw.removeItem(k);},key:i=>Object.keys(raw).filter(k=>k.startsWith(prefix))[i]?.slice(prefix.length)||null};
 Object.defineProperty(scoped,'length',{get:()=>Object.keys(raw).filter(k=>k.startsWith(prefix)).length});
 Object.defineProperty(window,'localStorage',{value:new Proxy(scoped,{ownKeys:()=>Object.keys(raw).filter(k=>k.startsWith(prefix)).map(k=>k.slice(prefix.length)),getOwnPropertyDescriptor:()=>({enumerable:true,configurable:true}),get:(t,k)=>k in t?t[k]:typeof k==='string'?t.getItem(k):undefined,set:(t,k,v)=>{t.setItem(k,v);return true;}})});
 const open=indexedDB.open.bind(indexedDB);indexedDB.open=(name,version)=>version===undefined?open(prefix+name):open(prefix+name,version);
 window.CustomerSession={cloud,user,owner};window.wmCloud=()=>cloud;window.WM_USER=user;
 // Auth switching reloads all stores and controllers; old drafts cannot leak into another account.
 cloud?.auth.onAuthStateChange((event,s)=>{const next=event==='SIGNED_OUT'?'guest':s?.user?.id;if(next&&next!==owner)location.reload();});
 for(const old of document.querySelectorAll('script[type="application/qiyaoji-deferred"]')){const s=document.createElement('script');for(const a of old.attributes)if(a.name!=='type')s.setAttribute(a.name,a.value);if(s.src){await new Promise((resolve,reject)=>{s.onload=resolve;s.onerror=()=>reject(Error('资源加载失败：'+s.src));document.body.append(s);});}else{s.textContent=old.textContent;document.body.append(s);}old.remove();}
})().catch(e=>{const n=document.createElement('p');n.textContent='页面初始化失败，请刷新：'+e.message;document.body.prepend(n);});
