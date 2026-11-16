(function () {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let source = '', rows = [], current = null, opening = 0, revision = 0, sourceMeta=null;
  let writes = Promise.resolve(), saveSequence = 0;
  let lastPid;try{lastPid=localStorage.getItem('qiyaoji_research_last_pid');}catch{}
  function setContext(pid){if(!G.byPid[pid])return;lastPid=pid;try{localStorage.setItem('qiyaoji_research_last_pid',pid);}catch{}}
  function persist(){
    if(!current||!document.getElementById('rk-text'))return;
    revision++;
    const sequence=++saveSequence;
    const record={pid:current.pid,paper:{pid:current.pid,title:current.title,link:current.link},source_text:document.getElementById('rk-text').value,source_meta:sourceMeta,scope:document.getElementById('rk-scope').value,keys:structuredClone(rows),updated_at:new Date().toISOString()};
    const status=document.getElementById('rk-save');if(status)status.textContent='正在保存到本机…';
    writes=writes.catch(()=>{}).then(()=>SevenKeysDrafts.put(record)).then(()=>{if(sequence===saveSequence&&document.getElementById('rk-save'))document.getElementById('rk-save').textContent='✓ 已保存到本机浏览器';}).catch(()=>{if(sequence===saveSequence&&document.getElementById('rk-save'))document.getElementById('rk-save').textContent='保存失败：请立即导出备份。浏览器存储可能不可用或已满。';});
  }
  const storageKey = 'qiyaoji_research_focus';
  let focused = true;
  try { focused = localStorage.getItem(storageKey) !== 'false'; } catch {}
  document.documentElement.dataset.focus = String(focused);
  const navigation = document.querySelector('header');
  const launch = document.createElement('button'); launch.className='btn gold';launch.textContent='七钥抽取';launch.onclick=()=>open(lastPid||G.curPid);
  navigation.append(launch);
  const focus = document.createElement('button');focus.className='btn';
  function label(){focus.textContent=focused?'专注模式 · 开':'专注模式 · 关';}
  focus.onclick=()=>{focused=!focused;document.documentElement.dataset.focus=String(focused);try{localStorage.setItem(storageKey,String(focused));}catch{}label();};label();navigation.append(focus);
  document.title='七钥纪 · 论文精读与证据工作台';
  const classic = document.getElementById('btnClassic');if(classic) classic.hidden=true; // target page is absent from both site directories
  const main=document.getElementById('main');
  if (document.getElementById('bigTitle')?.textContent.includes('欢迎来到')) {
    G.modal('欢迎使用七钥纪 · 论文精读工作台','<div class="research-banner"><h2>用七个问题读懂一篇论文</h2><p>先确定研究问题与贡献，再核对方法、实验、量化结果和局限。每个结论保留原文依据；材料不足时留空。</p></div><p>你可以先体验本地七钥抽取，无需登录或模型额度。导出证据卡后保存到自己的电脑。</p><div class="research-actions"><button class="btn gold" id="rk-welcome-start">开始抽取体验</button><button class="btn" id="rk-welcome-map">浏览论文库</button></div>');
    document.getElementById('rk-welcome-start').onclick=()=>open(G.curPid);
    document.getElementById('rk-welcome-map').onclick=()=>{G.closeModal();G.openMap();};
  }
  const banner=document.createElement('section');banner.className='research-banner';
  banner.innerHTML='<h2>从研究问题，到可追溯的证据</h2><p>选择论文 → 定位七类候选 → 对照原文复核 → 导出阅读卡。七把钥匙是阅读框架；缺失的信息可以留空，完成度不代表结论正确。</p>';
  const begin=document.createElement('button');begin.className='btn gold';begin.textContent='开始七钥抽取';begin.onclick=()=>open(G.curPid);banner.append(begin);main.prepend(banner);
  const original=G.openPaper;
  G.openPaper=function(...args){setContext(args[0]);const result=original.apply(this,args);const area=document.getElementById('main');const bar=document.createElement('div');bar.className='research-actions';const b=document.createElement('button');b.className='btn gold';b.textContent='按七钥抽取与复核';b.onclick=()=>open(args[0]);bar.append(b);const note=document.createElement('span');note.className='rk-meta';note.textContent='候选 ≠ 已核实结论 · 请保留原文依据';bar.append(note);area.prepend(bar);return result;};
  function open(pid){
    const token=++opening;current=G.byPid[pid||lastPid]||G.papers[0];setContext(current.pid);rows=[];source='';revision=0;sourceMeta=null;
    G.modal('七钥 · 证据抽取工作台', '<div class="rk-meta">'+escape(current.title)+' · '+escape(current.pid)+'</div><p>本地候选定位，不调用模型、不上传原文。它找出可能相关的句段，字段归属与摘要由你复核。</p><div class="rk-layout"><div class="rk-source"><label for="rk-paper">论文</label><select id="rk-paper" style="width:100%">'+G.papers.filter((p,index)=>index<20||p.pid===current.pid).map(p=>'<option value="'+escape(p.pid)+'"'+(p.pid===current.pid?' selected':'')+'>'+escape(p.no+' · '+p.title)+'</option>').join('')+'</select><div class="research-actions"><button class="btn" id="rk-abstract">载入库内摘要</button><label class="btn">导入 TXT / MD <input id="rk-file" type="file" accept=".txt,.md,text/plain,text/markdown" style="max-width:180px"></label></div><label for="rk-scope">材料范围</label> <select id="rk-scope"><option value="abstract">摘要</option><option value="fulltext">正文文本（用户提供）</option><option value="excerpts">原文节选（非全文）</option></select><p class="rk-meta">PDF 请先转为文本；这里不解析图表或扫描页。位置按导入文本的字符偏移记录，不虚构页码。</p><label for="rk-text">待抽取原文（最多20万字符）</label><textarea id="rk-text" maxlength="200000" placeholder="载入摘要，或粘贴有权处理的论文正文…"></textarea><div class="research-actions"><button class="btn gold" id="rk-run">定位七类候选</button><button class="btn" id="rk-export">导出证据卡 JSON</button></div><div id="rk-message" role="status" aria-live="polite"></div></div><div><div class="rk-state" id="rk-progress">尚未抽取</div><div id="rk-results"></div></div></div>');
    document.getElementById('bigModal').dataset.workspace='research';
    const saveStatus=document.createElement('p');saveStatus.id='rk-save';saveStatus.className='rk-meta';saveStatus.setAttribute('role','status');saveStatus.textContent='正在恢复本机草稿…';document.getElementById('rk-message').before(saveStatus);
    const edit=document.createElement('button');edit.className='btn';edit.textContent='编辑原文（重置候选）';edit.onclick=()=>{if(rows.length&&!confirm('编辑原文将重置当前候选与复核结果，是否继续？'))return;clear();document.getElementById('rk-text').focus();};document.getElementById('rk-run').after(edit);
    if(window.WM_LOCAL_PDF&&window.QIYAOJI_CORE20?.papers.some(p=>p.pid===current.pid)){
      const pdf=document.createElement('button');pdf.className='btn';pdf.textContent='载入本地PDF正文';document.getElementById('rk-abstract').after(pdf);
      pdf.onclick=async()=>{
        if((rows.length||document.getElementById('rk-text').value)&&!confirm('载入PDF文本会替换当前草稿材料与复核结果。已保存的阅读记录不受影响。是否继续？'))return;
        pdf.disabled=true;pdf.textContent='正在载入正文…';const selectedPid=current.pid,loadingRevision=revision;
        try{const response=await fetch('/papers/'+current.no+'/text.json',{signal:AbortSignal.timeout(10000)});const payload=await response.json();if(token!==opening||current.pid!==selectedPid)return;if(revision!==loadingRevision){message('草稿在载入期间已变化，请再次载入PDF。');return;}if(!response.ok)throw new Error(payload.error||'正文载入失败');
          if(typeof payload.text!=='string'||payload.text.length>200000||!Array.isArray(payload.pages))throw new Error('正文格式无效');
          document.getElementById('rk-text').value=payload.text;document.getElementById('rk-scope').value=payload.partial?'excerpts':'fulltext';clear();source=payload.text;sourceMeta={kind:'local_pdf_text',pages:payload.pages,total_pages:payload.total_pages,loaded_pages:payload.loaded_pages,partial:payload.partial,pdf_sha256:payload.pdf_sha256};rows=SevenKeys.extract(source,payload.partial?'excerpts':'fulltext');render();
          message('已载入 '+payload.loaded_pages+'/'+payload.total_pages+' 页的文本。'+(payload.partial?'达到20万字符上限，当前只是节选。':'')+payload.note);
        }catch(error){if(token===opening)message(error.message||'正文载入失败');}finally{if(token===opening){pdf.disabled=false;pdf.textContent='载入本地PDF正文';}}
      };
    }
    const search=document.createElement('input');search.type='search';search.placeholder='搜索其他论文标题或编号';search.setAttribute('aria-label','搜索标注论文');search.style.width='100%';document.getElementById('rk-paper').before(search);
    search.oninput=()=>{const query=search.value.trim().toLowerCase();const choices=G.papers.filter(p=>(p.pid+' '+p.title+' '+(p.cn||'')).toLowerCase().includes(query)).slice(0,40);const select=document.getElementById('rk-paper');select.replaceChildren();const hint=document.createElement('option');hint.value='';hint.textContent=choices.length?'请选择搜索结果（最多40篇）':'未找到论文';select.append(hint);choices.forEach(p=>{const option=document.createElement('option');option.value=p.pid;option.textContent=p.no+' · '+p.title;select.append(option);});};
    document.getElementById('rk-paper').onchange=e=>{if(e.target.value)open(e.target.value);};
    document.getElementById('rk-abstract').onclick=()=>{if(document.getElementById('rk-text').value&&!confirm('替换当前原文并清除复核结果？'))return;document.getElementById('rk-text').value=current.abs||'';document.getElementById('rk-scope').value='abstract';clear();};
    document.getElementById('rk-text').oninput=clear;document.getElementById('rk-scope').onchange=clear;
    document.getElementById('rk-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(file.size>800000){message('文件过大，请截取正文文本。');return;}if(document.getElementById('rk-text').value&&!confirm('替换当前原文并清除复核结果？'))return;const text=await file.text();if(token!==opening)return;if(text.length>200000){message('文本超过20万字符，请分段导入。');return;}document.getElementById('rk-text').value=text;document.getElementById('rk-scope').value='fulltext';clear();};
    document.getElementById('rk-run').onclick=()=>{const text=document.getElementById('rk-text').value;if(text.trim().length<40){message('请先提供至少40个字符的原文。');return;}if(rows.length&&!confirm('重新抽取会清除当前复核结果，是否继续？'))return;source=text;rows=SevenKeys.extract(source,document.getElementById('rk-scope').value);render();message('候选已定位；无候选不等于文章没有提及。请手动复核，草稿自动保存在本机。');};
    document.getElementById('rk-export').onclick=()=>{if(!rows.length){message('请先定位候选。');return;}const payload={schema:'qiyaoji.evidence.v1',paper:{pid:current.pid,title:current.title,link:current.link},created_at:new Date().toISOString(),method:'local-rule-candidates',offset_unit:'UTF-16 code units',source_text:source,source_meta:sourceMeta,keys:rows};G.dl(JSON.stringify(payload,null,2),'seven-keys-'+current.no+'.json','application/json');};
    const recovery=document.createElement('label');recovery.className='btn';recovery.textContent='恢复证据卡 JSON ';
    const fileInput=document.createElement('input');fileInput.type='file';fileInput.accept='.json,application/json';fileInput.style.maxWidth='180px';recovery.append(fileInput);document.getElementById('rk-export').after(recovery);
    fileInput.onchange=async()=>{const file=fileInput.files[0];if(!file)return;if(file.size>4000000){message('证据卡超过4MB，无法导入。');return;}try{const card=SevenKeys.validate(JSON.parse(await file.text()));if(token!==opening)return;if(card.paper?.pid!==current.pid)throw new Error('证据卡属于另一篇论文，请先切换论文');if(rows.length&&!confirm('用证据卡替换当前草稿？'))return;source=card.source_text;sourceMeta=card.source_meta||null;rows=card.keys;document.getElementById('rk-text').value=source;document.getElementById('rk-scope').value=rows[0].scope;render();message('证据卡已恢复；人工确认是原标注者的声明，仍请复核。');}catch(error){if(token===opening)message('未导入：'+error.message);}};
    writes.then(()=>SevenKeysDrafts.get(current.pid)).then(draft=>{if(token!==opening||revision!==0||!document.getElementById('rk-text'))return;if(draft){if(draft.keys?.length)SevenKeys.validate(draft);if(typeof draft.source_text!=='string'||draft.source_text.length>200000)throw new Error('草稿格式无效');source=draft.source_text;sourceMeta=draft.source_meta||null;rows=draft.keys||[];document.getElementById('rk-text').value=source;document.getElementById('rk-scope').value=draft.scope||'abstract';render();saveStatus.textContent='✓ 已恢复本机草稿';}else saveStatus.textContent='草稿自动保存在本机；请定期导出备份。';}).catch(()=>{if(token===opening)saveStatus.textContent='草稿恢复失败，可从JSON备份恢复。';});
  }
  function message(text){document.getElementById('rk-message').textContent=text;}
  function clear(){rows=[];source='';sourceMeta=null;document.getElementById('rk-text').readOnly=false;document.getElementById('rk-scope').disabled=false;document.getElementById('rk-results').textContent='';document.getElementById('rk-progress').textContent='原文更新后，请重新定位候选。';persist();}
  function progress(){document.getElementById('rk-progress').textContent=rows.filter(r=>r.status!=='unreviewed').length+'/7 已处理 · '+rows.filter(r=>r.status==='reviewed').length+' 项人工确认 · '+(rows[0]?.scope==='abstract'?'仅摘要，正文与图表未核验':rows[0]?.scope==='excerpts'?'原文节选，不能代表全文覆盖':'用户提供文本，未检查是否为完整正文');document.getElementById('rk-text').readOnly=rows.length>0;document.getElementById('rk-scope').disabled=rows.length>0;persist();}
  function render(){
    const target=document.getElementById('rk-results');target.textContent='';
    rows.forEach((row,index)=>{
      row.candidates.forEach(candidate=>{const page=sourceMeta?.pages?.find(p=>candidate.start>=p.start&&candidate.end<=p.end);if(page)candidate.page=page.page;else delete candidate.page;});
      const card=document.createElement('section');card.className='rk-card';
      const definition=SevenKeys.definitions.find(d=>d[0]===row.key);row.title=definition[1];row.hint=definition[2];
      card.innerHTML='<h3>'+String(index+1).padStart(2,'0')+' · '+escape(row.title)+' <small>'+escape(row.key)+'</small></h3><p class="rk-meta">'+escape(row.hint)+'</p>';
      row.candidates.forEach((candidate,evidenceIndex)=>{const label=document.createElement('label');label.className='rk-evidence';const check=document.createElement('input');check.type='checkbox';check.checked=!!candidate.selected;check.setAttribute('aria-label','选择作为'+row.title+'的依据 '+(evidenceIndex+1));check.onchange=()=>{candidate.selected=check.checked;if(row.status==='reviewed'){row.status='unreviewed';state.value=row.status;}progress();};label.append(check,document.createTextNode(candidate.quote));const location=document.createElement('div');location.className='rk-meta';location.textContent=(candidate.page?'来源PDF第'+candidate.page+'页 · ':'')+'原文字符 '+candidate.start+'–'+candidate.end+' · '+(candidate.manual?'手动定位':'待复核候选');label.append(location);card.append(label);});
      if(!row.candidates.length){const empty=document.createElement('p');empty.className='rk-meta';empty.textContent='未定位到候选，可标记“材料不足”；不是已确认文章未报告。';card.append(empty);}
      const answerLabel=document.createElement('label');answerLabel.textContent='快速阅读 · 对作者信息的一句话归纳';answerLabel.htmlFor='rk-answer-'+index;
      const answer=document.createElement('textarea');answer.id=answerLabel.htmlFor;answer.maxLength=3000;answer.value=row.summary;answer.placeholder=SevenKeys.guides[row.key].question;answer.oninput=()=>{row.summary=answer.value;if(row.status==='reviewed'){row.status='unreviewed';state.value=row.status;}progress();};
      const guide=SevenKeys.guides[row.key],detail=document.createElement('details');detail.className='rk-detail';
      const detailTitle=document.createElement('summary');detailTitle.textContent='精读子项 · 展开填写（可选）';detail.append(detailTitle);
      const instruction=document.createElement('p');instruction.className='rk-meta';instruction.textContent=guide.question+' '+guide.caution;detail.append(instruction);
      const example=document.createElement('p');example.className='rk-meta';example.textContent='填写示例（非本篇结论）：'+guide.example;detail.append(example);
      guide.fields.forEach(([id,title])=>{const label=document.createElement('label');label.htmlFor='rk-part-'+index+'-'+id;label.textContent=title;const input=document.createElement('textarea');input.id=label.htmlFor;input.maxLength=1500;input.value=row.structure?.[id]||'';input.placeholder='依据原文填写；未报告或不适用可说明原因';input.oninput=()=>{row.structure=row.structure||{};row.structure[id]=input.value;if(row.status==='reviewed'){row.status='unreviewed';state.value=row.status;}progress();};detail.append(label,input);});
      const personalLabel=document.createElement('label');personalLabel.textContent='我的理解与疑问 · 不属于作者结论';personalLabel.htmlFor='rk-personal-'+index;
      const personal=document.createElement('textarea');personal.id=personalLabel.htmlFor;personal.maxLength=3000;personal.value=row.reader_note||'';personal.placeholder='我的推测、与课题的联系、还想验证的问题…';personal.oninput=()=>{row.reader_note=personal.value;persist();};
      const state=document.createElement('select');state.setAttribute('aria-label',row.title+'复核状态');state.innerHTML='<option value="unreviewed">待复核</option><option value="reviewed">人工确认</option><option value="insufficient">材料不足 / 尚未找到</option><option value="not_applicable">不适用（请说明原因）</option>';
      state.value=row.status;
      state.onchange=()=>{if(state.value==='reviewed'&&(!row.summary.trim()||!row.candidates.some(c=>c.selected))){state.value=row.status;message('人工确认需要填写结论，并勾选至少一处原文依据。');return;}if(state.value==='not_applicable'&&!row.summary.trim()){state.value=row.status;message('请在结论中说明不适用的原因。');return;}row.status=state.value;progress();};
      const addEvidence=document.createElement('button');addEvidence.className='btn';addEvidence.textContent='用选中原文补充依据';
      addEvidence.onclick=()=>{const ta=document.getElementById('rk-text');const start=ta.selectionStart,end=ta.selectionEnd;if(start===end){message('先在左侧原文中选中一段文字，再点此按钮。');return;}if(end-start>4000||row.candidates.length>=20){message('每处证据最多4000字符，每字段最多20处。');return;}if(row.candidates.some(c=>c.start===start&&c.end===end)){message('这处依据已经存在。');return;}row.candidates.push({quote:source.slice(start,end),start,end,selected:true,manual:true});row.status='unreviewed';render();};
      const apply=document.createElement('button');apply.className='btn gold';apply.textContent='保存到我的阅读记录';
      apply.onclick=async()=>{
        if(row.status!=='reviewed'){message('请先人工确认结论与依据。');return;}
        const saved=G.ps(current.pid),old=(saved.self||{})[row.key];
        if(old&&old!==row.summary&&!confirm('替换已有阅读记录？旧版本将保存在本机修订历史中。'))return;
        const applyingPid=current.pid,applyingSummary=row.summary,applyingEvidence=structuredClone(row.candidates.filter(c=>c.selected)),applyingRevision=revision;
        let sourceId;apply.disabled=true;
        try{sourceId=await SevenKeysDrafts.preserveSource(applyingPid,source,row.scope,sourceMeta);}catch{apply.disabled=false;message('原文副本保存失败，未写入阅读记录。请先导出证据卡备份。');return;}
        apply.disabled=false;
        if(current.pid!==applyingPid||row.summary!==applyingSummary||row.status!=='reviewed'||revision!==applyingRevision||!rows.includes(row)){message('内容已变化，请重新确认后保存。');return;}
        saved.researchEvidence=saved.researchEvidence||{};
        if(old&&(old!==row.summary||saved.researchEvidence[row.key]))saved.researchHistory=(saved.researchHistory||[]).concat([{field:row.key,value:old,evidence:saved.researchEvidence[row.key]||null,replaced_at:Date.now()}]);
        saved.self=saved.self||{};saved.self[row.key]=row.summary;saved.selfTs=saved.selfTs||{};saved.selfTs[row.key]=Date.now();
        const added=saved.added.findIndex(a=>a.field===row.key),item={field:row.key,value:row.summary,ts:Date.now()};if(added>=0)saved.added[added]=item;else saved.added.push(item);
        saved.researchEvidence[row.key]={summary:row.summary,structure:structuredClone(row.structure||{}),reader_note:row.reader_note||'',scope:row.scope,source_id:sourceId,reviewed_at:Date.now(),status:'human_reviewed',evidence:applyingEvidence.map(c=>({quote:c.quote,start:c.start,end:c.end,page:c.page}))};
        G.save();persist();window.dispatchEvent(new CustomEvent('qiyaoji:evidence-updated',{detail:{pid:current.pid}}));
        try{if(JSON.parse(localStorage.getItem('wmquest_v1')).papers[current.pid].self[row.key]!==row.summary)throw new Error();message('已保存到本机阅读记录与证据档案。此处不自动提交云端；请导出证据卡备份。');}catch{message('草稿已尝试保存，但阅读记录持久化失败。请立即导出备份。');}
      };
      card.append(addEvidence,answerLabel,answer,detail,personalLabel,personal,state,apply);target.append(card);
    });progress();
  }
  async function seed(pid,text){
    await writes;
    let draft;try{draft=await SevenKeysDrafts.get(pid);}catch{}
    if(draft?.source_text){open(pid);return;}
    open(pid);source=text;document.getElementById('rk-text').value=text;document.getElementById('rk-scope').value='excerpts';rows=SevenKeys.extract(text,'excerpts');render();message('已载入两处原文节选，不是全文。请选择字段、补充结论并复核依据。');
  }
  const writeSelf=G._writeSelf;G._writeSelf=function(pid,field,value){const result=writeSelf.apply(this,arguments);const evidence=G.ps(pid).researchEvidence?.[field];if(evidence&&evidence.summary!==value){evidence.status='needs_review';G.save();window.dispatchEvent(new CustomEvent('qiyaoji:evidence-updated',{detail:{pid}}));}return result;};
  // Static demos never call a visitor's localhost bridge. The optional server injects ai-trial.js.
  G.runVerify=function(pid,field){const slot=document.getElementById('vrm-'+pid+'-'+field);if(!slot)return;slot.textContent='AI核对服务尚未接通。你仍可对照原文完成人工复核。';const action=document.createElement('button');action.className='btn';action.textContent='打开证据标注';action.onclick=()=>open(pid);slot.append(action);};
  window.QiyaojiResearch={open,seed,setContext};
})();
