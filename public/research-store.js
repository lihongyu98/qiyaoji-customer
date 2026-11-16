(function () {
  'use strict';
  let connection;
  function database() {
    if(!connection)connection=new Promise((resolve,reject)=>{
      const request=indexedDB.open('qiyaoji_evidence_v1',2);
      request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains('drafts'))db.createObjectStore('drafts',{keyPath:'pid'});if(!db.objectStoreNames.contains('sources'))db.createObjectStore('sources',{keyPath:'id'});};
      request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();connection=null;};resolve(db);};
      request.onerror=()=>{connection=null;reject(request.error);};
      request.onblocked=()=>{connection=null;reject(new Error('请关闭其他版本页面后重试'));};
    });
    return connection;
  }
  async function upsertDraft(record){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('drafts','readwrite'),store=tx.objectStore('drafts'),request=store.get(record.pid);request.onsuccess=()=>store.put({source_text:'',keys:[],scope:'abstract',...(request.result||{}),...record});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
  window.SevenKeysDrafts={
    async get(pid){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('drafts','readonly');const req=tx.objectStore('drafts').get(pid);tx.oncomplete=()=>resolve(req.result||null);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});},
    put:upsertDraft,
    async putGuided(pid,course){return upsertDraft({pid,guided_study:structuredClone(course)});},
    async preserveSource(pid,text,scope,metadata=null){
      let hash;
      if(crypto.subtle){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');}
      else hash=Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('');
      const id=pid+':'+hash,db=await database();
      await new Promise((resolve,reject)=>{const tx=db.transaction('sources','readwrite');tx.objectStore('sources').put({id,pid,text,scope,metadata,created_at:new Date().toISOString()});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});
      return id;
    },
    async getSource(id){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('sources','readonly');const req=tx.objectStore('sources').get(id);tx.oncomplete=()=>resolve(req.result||null);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
  };
})();
