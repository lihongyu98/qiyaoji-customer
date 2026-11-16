(function(root){
  'use strict';
  function matches(p,filters={},query=''){
    const tags=p.taxonomy||{};
    if(filters.track&&p.track!==filters.track)return false;
    if(filters.learning&&tags.learning!==filters.learning)return false;
    for(const dimension of ['task','method','scene'])if(filters[dimension]&&!(tags[dimension]||[]).includes(filters[dimension]))return false;
    const search=String(query).trim().toLocaleLowerCase();
    return !search||[p.name,p.title,p.hook,p.problem,...(tags.path||[])].join(' ').toLocaleLowerCase().includes(search);
  }
  function label(pack,dimension,id){return pack.taxonomy?.dimensions?.[dimension]?.values?.[id]?.[0]||id;}
  const api={matches,label};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.QiyaojiTaxonomy=api;
})(typeof window==='undefined'?globalThis:window);
