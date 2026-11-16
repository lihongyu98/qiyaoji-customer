(function(){
  'use strict';
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fields=['靶子','坐标','主张','机制','证据','数字','边界'];
  const fieldNames=SevenKeys.definitions.map(d=>d[1]);
  const tracks=['想象与控制','表征与预测','生成与交互','具身与应用'];
  let pack,activity={};
  const filterState={track:'',task:'',method:'',scene:'',learning:'',query:''};
  try{const value=JSON.parse(localStorage.getItem('qiyaoji_core20_activity')||'{}');if(value&&typeof value==='object'&&!Array.isArray(value))activity=value;}catch{}
  function save(){try{localStorage.setItem('qiyaoji_core20_activity',JSON.stringify(activity));return true;}catch{return false;}}
  function state(pid){if(!activity[pid]||typeof activity[pid]!=='object')activity[pid]={};return activity[pid];}
  function updateIndexProgress(){
    const metrics=document.getElementById('core-index-metrics');if(!pack||!metrics)return;
    const viewed=pack.papers.filter(p=>state(p.pid).viewed).length,practiced=pack.papers.filter(p=>state(p.pid).quiz?.correct).length;
    const annotated=pack.papers.filter(p=>{const stored=G.S.papers[p.pid]||{};return Object.entries(stored.researchEvidence||{}).some(([field,e])=>e.status==='human_reviewed'&&e.summary===(stored.self||{})[field]);}).length;
    metrics.innerHTML='<span><b>20</b>图解范本</span><span><b>'+viewed+'</b>已打开</span><span><b>'+practiced+'</b>理解题答对</span><span><b>'+annotated+'</b>有人工复核标注</span>';
    document.querySelectorAll('.core-card[data-pid]').forEach(card=>{const s=state(card.dataset.pid);card.querySelector('.core-state').textContent=s.quiz?.correct?'理解题已答对 · 可继续标注':s.viewed?'已打开 · 继续理解与练习':'从一个问题开始';});
  }
  window.addEventListener('qiyaoji:evidence-updated',event=>{updateIndexProgress();refreshNextSteps(event.detail.pid);});
  function button(text,action,primary=false){const el=document.createElement('button');el.className='btn'+(primary?' gold':'');el.textContent=text;el.onclick=action;return el;}
  function element(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
  function sourceLink(text,url){const a=element('a','core-link',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
  const ready=Promise.resolve(window.QIYAOJI_CORE20).then(data=>{if(data?.papers?.length!==20)throw new Error('范本数据未加载或数量不匹配');pack=data;return data;});
  const launch=button('核心20 · 图解学习',()=>showIndex(),true);document.querySelector('header').append(launch);
  const subtitle=document.querySelector('.brand small');if(subtitle)subtitle.textContent='WORLD MODELS · 学习与证据标注';
  // Keep the primary learning loop visible; secondary game and export controls remain in More.
  const header=document.querySelector('header'),nav=element('nav','learning-nav');nav.setAttribute('aria-label','主要学习功能');
  const extractButton=Array.from(header.querySelectorAll('button')).find(b=>b.textContent==='侦察 · 七钥抽取');
  const reviewButton=Array.from(header.querySelectorAll('button')).find(b=>b.textContent==='复习队列');
  for(const control of [launch,document.getElementById('btnMap'),extractButton,reviewButton,document.getElementById('btnAcct')])if(control)nav.append(control);
  const more=element('details','learning-more'),summary=element('summary','','更多功能'),tools=element('div','learning-tools');more.append(summary,tools);
  for(const control of Array.from(header.querySelectorAll('button')))if(!nav.contains(control))tools.append(control);
  for(const control of [header.querySelector('.hero'),header.querySelector('.wallet')])if(control)tools.append(control);
  nav.append(more);header.append(nav);
  tools.addEventListener('click',event=>{if(event.target.closest('button'))more.open=false;});
  new ResizeObserver(()=>document.documentElement.style.setProperty('--learning-header-height',header.offsetHeight+'px')).observe(header);
  const originalMap=G.openMap;G.openMap=function(...args){document.body.dataset.learningView='library';return originalMap.apply(this,args);};
  document.getElementById('btnMap').onclick=G.openMap;
  const originalModal=G.modal;
  let returnFocus;
  G.modal=function(...args){const modal=document.getElementById('bigModal');if(!modal.contains(document.activeElement))returnFocus=document.activeElement;modal.dataset.workspace='';const result=originalModal.apply(this,args);modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','bigTitle');document.getElementById('bigBody').scrollTop=0;const title=document.getElementById('bigTitle');title.tabIndex=-1;title.focus({preventScroll:true});return result;};
  const originalClose=G.closeModal;G.closeModal=function(...args){const result=originalClose.apply(this,args);if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});return result;};
  document.addEventListener('keydown',event=>{const modal=document.getElementById('bigModal');if(!modal.classList.contains('on'))return;if(event.key==='Escape'){event.preventDefault();G.closeModal();return;}if(event.key!=='Tab')return;const focusable=Array.from(modal.querySelectorAll('a[href],button,input,textarea,select,[tabindex="0"]')).filter(el=>!el.disabled&&el.getClientRects().length);if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&(document.activeElement===first||!focusable.includes(document.activeElement))){event.preventDefault();last.focus();}else if(!event.shiftKey&&(document.activeElement===last||!focusable.includes(document.activeElement))){event.preventDefault();first.focus();}});
  async function showIndex(){
    const main=document.getElementById('main');
    try{await ready;}catch{main.replaceChildren(element('p','core-error','核心范本暂未加载。请通过本地HTTP服务打开，或检查数据文件。'));return;}
    G.closeModal();main.replaceChildren();document.body.dataset.learningView='core20';
    const shell=element('section','core-shell');
    const top=element('div','core-top');top.innerHTML='<div><div class="core-kicker">CORE 20 · LEARN WITH EVIDENCE</div><h2>把论文读成一条有线索的故事</h2><p>20篇核心论文 · 原图、脉络、误解练习与七钥标注。先理解，再用原文支撑自己的判断。</p></div>';top.append(button('对照两篇论文',compare));shell.append(top);
    const metrics=element('div','core-metrics');metrics.id='core-index-metrics';shell.append(metrics);
    const mapDetails=element('details');const summary=element('summary','core-map-title','展开学习脉络图 · 建议先后顺序，不代表引用关系');mapDetails.append(summary,drawMap());shell.append(mapDetails);
    const filters=element('div','core-filter'),grid=element('div','core-grid'),facet=element('section','core-facets');
    const search=element('input');search.type='search';search.placeholder='搜索论文、研究问题或方向';search.value=filterState.query;search.setAttribute('aria-label','搜索核心论文');facet.append(search);
    const controls={};
    for(const dimension of ['task','method','scene','learning']){
      const label=element('label','',dimension==='learning'?'学习阶段（编辑建议）':pack.taxonomy.dimensions[dimension].label),select=element('select');
      const all=element('option','','全部');all.value='';select.append(all);
      const values=dimension==='learning'?Object.fromEntries(['基础起点','进阶精读','应用拓展'].map(x=>[x,[x]])):pack.taxonomy.dimensions[dimension].values;
      for(const [id,[name]]of Object.entries(values)){const option=element('option','',name);option.value=id;select.append(option);}
      select.value=filterState[dimension];select.onchange=()=>{filterState[dimension]=select.value;render();};label.append(select);facet.append(label);controls[dimension]=select;
    }
    const resultCount=element('p','core-small');resultCount.setAttribute('role','status');resultCount.setAttribute('aria-live','polite');
    facet.append(button('清除筛选',()=>{for(const key of Object.keys(filterState))filterState[key]='';search.value='';Object.values(controls).forEach(s=>s.value='');render();}));
    function render(){
      const results=pack.papers.filter(p=>QiyaojiTaxonomy.matches(p,filterState,filterState.query));
      grid.replaceChildren(...results.map(card));if(!results.length)grid.append(element('p','core-small','没有同时满足这些条件的范本，请放宽筛选。'));
      resultCount.textContent='找到 '+results.length+' / 20 篇 · 不同维度同时满足；标签不代表性能排名。';
      for(const b of filters.children)b.setAttribute('aria-pressed',String(b.dataset.track===filterState.track));
    }
    search.oninput=()=>{filterState.query=search.value;render();};
    ['全部',...tracks].forEach(track=>{const value=track==='全部'?'':track,b=button(track,()=>{filterState.track=value;render();});b.dataset.track=value;filters.append(b);});
    shell.append(filters,facet,resultCount,grid);render();main.append(shell);updateIndexProgress();

  }
  function card(p){
    const article=element('article','core-card');article.dataset.pid=p.pid;const thumb=element('div','core-thumb');const img=element('img');img.src=p.figure.asset;img.alt=p.name+'原论文'+p.figure.label+'，PDF第'+p.figure.page+'页';img.loading='lazy';thumb.append(img);
    const body=element('div','core-card-body');body.append(element('div','core-tag',p.track+' · '+p.year),element('h3','',p.name),element('p','',p.hook));const chips=element('div','core-chips');for(const dimension of ['task','method','scene']){const id=p.taxonomy?.[dimension]?.[0];if(id)chips.append(element('span','core-chip',QiyaojiTaxonomy.label(pack,dimension,id)));}body.append(chips);const s=state(p.pid);body.append(element('div','core-state',s.quiz?.correct?'理解题已答对 · 可继续标注':s.viewed?'已打开 · 继续理解与练习':'从一个问题开始'),button('进入图解学习',()=>showStory(p.pid),true));article.append(thumb,body);return article;
  }
  function drawMap(){
    const wrap=element('div','core-map'),ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 1080 610');svg.setAttribute('aria-label','20篇论文的建议学习顺序，可点击节点打开');
    const positions=new Map();tracks.forEach((track,col)=>{const title=document.createElementNS(ns,'text');title.setAttribute('x',col*270+20);title.setAttribute('y',25);title.setAttribute('fill','#e4c98d');title.setAttribute('font-size',15);title.textContent=track;svg.append(title);pack.papers.filter(p=>p.track===track).forEach((p,row)=>positions.set(p.id,{x:col*270+15,y:row*76+50}));});
    for(const p of pack.papers){const to=positions.get(p.id);for(const id of p.prerequisites){const from=positions.get(id);if(!from)continue;const path=document.createElementNS(ns,'path');path.setAttribute('d',`M${from.x+112},${from.y+46} C${from.x+112},${from.y+70} ${to.x+112},${to.y-20} ${to.x+112},${to.y}`);path.setAttribute('stroke','#3a667c');path.setAttribute('stroke-width','1.5');path.setAttribute('fill','none');path.setAttribute('stroke-dasharray','4 4');svg.append(path);}}
    for(const p of pack.papers){const at=positions.get(p.id),group=document.createElementNS(ns,'g');group.setAttribute('class','core-node');group.setAttribute('role','button');group.setAttribute('tabindex','0');group.setAttribute('aria-label',p.name+'：打开图解学习');const rect=document.createElementNS(ns,'rect');for(const [k,v]of Object.entries({x:at.x,y:at.y,width:232,height:48,rx:6,fill:state(p.pid).quiz?.correct?'#194638':'#102e42',stroke:'#52758b'}))rect.setAttribute(k,v);const text=document.createElementNS(ns,'text');text.setAttribute('x',at.x+12);text.setAttribute('y',at.y+29);text.setAttribute('fill','#d6e5ed');text.setAttribute('font-size',13);text.textContent=p.name.length>28?p.name.slice(0,26)+'…':p.name;group.append(rect,text);group.onclick=()=>showStory(p.pid);group.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showStory(p.pid);}};svg.append(group);}wrap.append(svg);return wrap;
  }
  async function showStory(pid){
    await ready;const p=pack.papers.find(p=>p.pid===pid);if(!p)return;
    window.QiyaojiResearch?.setContext(pid);
    state(pid).viewed=Date.now();save();updateIndexProgress();
    G.modal('图解精读 · '+escape(p.name),'<div id="core-story-content" class="core-story"></div>');document.getElementById('bigModal').dataset.workspace='core';
    const body=document.getElementById('core-story-content');body.append(element('div','core-kicker',p.track+' · '+p.year),element('h2','',p.hook),element('p','core-story-lead',p.takeaway));
    body.append(taxonomyDetails(p));
    const actions=element('div','research-actions');actions.append(button('打开完整阅读记录',()=>{G.closeModal();G.openPaper(pid);}),button('七钥标注 · 开始或继续',()=>seedWorkspace(p),true),button('加入明日复习',()=>window.QiyaojiStudy?.schedule(pid,1)));body.append(actions);
    if(window.WM_LOCAL_PDF)actions.append(sourceLink('打开本地PDF','/papers/'+p.id+'.pdf#page='+p.figure.page));
    const grid=element('div','core-story-grid');const figure=element('figure','core-figure');const img=element('img');img.src=p.figure.asset;img.alt=p.name+'原论文'+p.figure.label;const imageLink=sourceLink('',p.pdf_url+'#page='+p.figure.page);imageLink.append(img);figure.append(imageLink);const caption=element('figcaption');caption.append(document.createTextNode('原论文 '+p.figure.label+' · PDF第'+p.figure.page+'页 · 点击图查看原文。图表版权归原作者。 '),sourceLink('原文链接',p.source_url));figure.append(caption);
    const aside=element('div');aside.append(block('它想解决什么',p.problem),block('先别误解',p.boundary));grid.append(figure,aside);body.append(grid);
    const flow=element('div','core-flow'),description=element('div','core-step-description');const prompts=['先定位输入：它来自真实观察、离线数据，还是模型生成？','检查中间机制：这一过程保留什么、舍弃什么？','沿箭头追踪输出：动作、价值、表征或像素分别在哪里？','回到实验：什么结果可以验证这条链，什么仍未被证明？'];
    p.steps.forEach((step,i)=>{const b=button('',()=>{for(const child of flow.children)child.setAttribute('aria-pressed',String(child===b));description.textContent=step+'。'+prompts[i];});b.className='core-step';b.innerHTML='<span>STEP 0'+(i+1)+'</span>'+escape(step);b.setAttribute('aria-pressed',String(i===0));flow.append(b);});description.textContent=p.steps[0]+'。'+prompts[0];body.append(blockTitle('跟着方法走一遍'),flow,description);
    body.append(block('实验到底说明了什么',p.evaluation),block('数字要带着条件读',p.number));
    const evidence=element('section','core-block');evidence.append(element('h3','','回到原文 · 两处阅读锚点'),element('p','core-small','以下是PDF文本摘录，空白和断行已规范化。它们是定位线索，不自动构成七维金标准。'));
    for(const e of p.evidence){const item=element('div','core-evidence');item.append(element('blockquote','',e.quote),sourceLink('查看PDF第'+e.page+'页',p.pdf_url+'#page='+e.page));evidence.append(item);}body.append(evidence);
    const keys=element('details','core-block');keys.append(element('summary','','七钥阅读提示 · 展开后逐项追问'));
    [p.problem,p.track+'；建议先读 '+(p.prerequisites.length?p.prerequisites.map(id=>pack.papers.find(x=>x.id===id)?.name).join('、'):'本路线起点；仍需对照相关工作寻找研究缺口'),p.takeaway,p.steps.join(' → '),p.evaluation,p.number,p.boundary].forEach((value,i)=>{const line=element('div','core-key-prompt');line.append(element('b','',fields[i]+' · '+fieldNames[i]),element('span','',value),element('p','core-small',SevenKeys.guides[fields[i]].question));keys.append(line);});body.append(keys);
    body.append(quiz(p));
    const reflection=element('section','core-block');reflection.id='core-reflection';reflection.append(element('h3','','把论文讲给另一个人听'),element('p','core-small','不看原文，用三句话解释：问题是什么、方法为何有效、什么情况下不能直接套用。'));
    const note=element('textarea','core-reflection');note.setAttribute('aria-label',p.name+'三句话复述');note.maxLength=6000;note.value=state(pid).reflection||'';const saved=element('p','core-small','复述只保存在本机，不自动提交云端。');note.oninput=()=>{state(pid).reflection=note.value;saved.textContent=save()?'✓ 复述已保存到本机':'保存失败，请复制内容备份';refreshNextSteps(pid);};reflection.append(note,saved,button('导出我的学习卡',()=>exportLearning(p)));body.append(reflection);const next=element('section','core-block');next.id='core-next-actions';next.dataset.pid=pid;body.append(next);refreshNextSteps(pid);
    const related=element('div','core-related');p.prerequisites.forEach(id=>{const previous=pack.papers.find(x=>x.id===id);if(previous)related.append(button('前置：'+previous.name,()=>showStory(previous.pid)));});related.append(button('返回20篇范本',showIndex));body.append(related);
  }
  function taxonomyDetails(p){
    const tags=p.taxonomy,box=element('details','core-block');box.append(element('summary','','论文分类 · 多维标签与说明'));
    box.append(element('p','',tags.path.join(' → ')));
    for(const dimension of ['task','method','scene']){
      box.append(element('h4','',pack.taxonomy.dimensions[dimension].label));
      for(const id of tags[dimension]){const [name,description]=pack.taxonomy.dimensions[dimension].values[id];box.append(element('p','core-small',name+'：'+description));}
    }
    box.append(element('p','core-small','学习阶段：'+tags.learning+'。'+pack.taxonomy.learning_note),element('p','core-small',tags.note+' 分类参考：'));
    for(const page of tags.source_pages)box.append(sourceLink('PDF第'+page+'页 ',(window.WM_LOCAL_PDF?'/papers/'+p.id+'.pdf':p.pdf_url)+'#page='+page));
    box.append(element('p','core-small','分类帮助找论文；七钥中的“坐标”仍需比较具体前人工作与研究缺口。'));
    return box;
  }
  function blockTitle(title){return element('h3','core-map-title',title);}
  function block(title,text){const box=element('section','core-block');box.append(element('h3','',title),element('p','',text));return box;}
  function refreshNextSteps(pid){
    const box=document.getElementById('core-next-actions');if(!box||box.dataset.pid!==pid)return;
    box.replaceChildren(element('h3','','接下来怎么学'),element('p','core-small','依据当前浏览器中的学习记录建议，可自由跳过，不作为掌握程度评分。'));
    const review=window.QiyaojiStudy?.getReview(pid)||{};
    const steps=QiyaojiLearning.nextSteps(G.S.papers[pid]||{},state(pid),review);
    for(const step of steps){
      const action=()=>{if(step.kind==='evidence')seedWorkspace(pack.papers.find(p=>p.pid===pid));else if(step.kind==='review')QiyaojiStudy.reviewQueue();else if(step.kind==='schedule'){QiyaojiStudy.schedule(pid,1);refreshNextSteps(pid);}else if(step.kind==='compare')compare();else{const target=document.getElementById(step.kind==='quiz'?'core-quiz':'core-reflection');target?.scrollIntoView({block:'center',behavior:'auto'});target?.querySelector('button,textarea')?.focus({preventScroll:true});}};
      const item=element('div','core-next-item');item.append(button(step.title,action),element('p','core-small',step.detail));box.append(item);
    }
  }
  function quiz(p){
    const box=element('section','core-block');box.id='core-quiz';box.append(element('h3','','停一下 · 检查一个关键误解'),element('p','core-question',p.quiz.q));
    const options=element('div','core-options'),feedback=element('div','core-feedback'),record=element('p','core-small');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
    function render(saved=true){const last=state(p.pid).quiz;for(const [i,b]of Array.from(options.children).entries())b.setAttribute('aria-pressed',String(last?.answer===i));
      if(!last){record.textContent='尚未作答；可以反复练习，不扣分。';return;}
      feedback.dataset.correct=String(last.correct);feedback.textContent=(last.correct?'最近一次答对。':'最近一次待订正：')+p.quiz.explanation;
      record.textContent='已尝试 '+last.attempts+' 次 · 首次'+(last.firstCorrect===true?'答对':last.firstCorrect===false?'答错':'未记录')+' · '+(saved?'记录保存在本机；答对不等于长期掌握。':'保存失败，请导出或复制备份；当前结果仅在本页内存。');
    }
    p.quiz.options.forEach((option,i)=>{const b=button(String.fromCharCode(65+i)+' · '+option,()=>{state(p.pid).quiz=QiyaojiLearning.recordAttempt(state(p.pid).quiz,i,i===p.quiz.answer);const saved=save();render(saved);updateIndexProgress();refreshNextSteps(p.pid);});options.append(b);});
    box.append(options,record,feedback);render();return box;
  }

  function seedWorkspace(p){
    const text=p.evidence.map(e=>'[PDF第'+e.page+'页]\n'+e.quote).join('\n\n');
    if(!window.QiyaojiResearch?.seed){G.toast('!','标注工作台未就绪','请先打开完整阅读记录');return;}
    QiyaojiResearch.seed(p.pid,text);
  }
  async function exportLearning(p){
    // Snapshot before IndexedDB reads so edits during export cannot mix revisions.
    const notes=structuredClone(G.S.papers[p.pid]||{}),activity=structuredClone(state(p.pid)),review=window.QiyaojiStudy?.getReview(p.pid);
    const annotations=notes.researchEvidence||{},history=notes.researchHistory||[];
    const ids=[...new Set([...Object.values(annotations),...history.map(h=>h.evidence)].filter(Boolean).map(e=>e.source_id).filter(Boolean))];
    const sources=[],missing=[];
    for(const id of ids){try{const source=await SevenKeysDrafts.getSource(id);if(source)sources.push(source);else missing.push(id);}catch{missing.push(id);}}
    const payload={schema:'qiyaoji.learning-card.v1',paper:{pid:p.pid,title:p.title,url:p.source_url},classification:p.taxonomy||null,activity,review,reading_record:{self:notes.self||{},self_timestamps:notes.selfTs||{},learning_fill:notes.learning_fill||{},notes:notes.notes||{},quiz:notes.quiz||null},annotations,history,sources,missing_source_ids:missing,created_at:new Date().toISOString()};
    G.dl(JSON.stringify(payload,null,2),'learning-'+p.name.replace(/[^a-z0-9-]/gi,'-')+'.json','application/json');
    G.toast(missing.length?'!':'↓',missing.length?'已生成学习卡，部分原文缺失':'已生成学习卡',missing.length?'缺失的原文ID已列入文件，请保留原始PDF并检查备份。':'请确认浏览器已保存下载文件；包含本机笔记与复习记录。');
  }

  async function compare(){
    await ready;G.modal('对照阅读 · 找到真正的差异','<div id="core-comparison"></div>');document.getElementById('bigModal').dataset.workspace='core';const body=document.getElementById('core-comparison');
    const selects=[0,1].map((_,index)=>{const select=element('select');select.setAttribute('aria-label',index?'第二篇对照论文':'第一篇对照论文');pack.papers.forEach(p=>{const option=element('option','',p.name);option.value=p.pid;select.append(option);});select.value=index?'#1015':'#1009';body.append(select);return select;});
    const target=element('div');body.append(target);
    function render(){const papers=selects.map(s=>pack.papers.find(p=>p.pid===s.value));const table=element('table','core-compare');table.innerHTML='<thead><tr><th>阅读维度</th>'+papers.map(p=>'<th>'+escape(p.name)+'</th>').join('')+'</tr></thead><tbody>'+[['研究问题','problem'],['方法差异','takeaway'],['机制链路','steps'],['证据条件','evaluation'],['推断边界','boundary']].map(([label,key])=>'<tr><th>'+label+'</th>'+papers.map(p=>'<td>'+escape(Array.isArray(p[key])?p[key].join(' → '):p[key])+'</td>').join('')+'</tr>').join('')+'</tbody>';target.replaceChildren(table,element('p','core-small','这是编辑设计的对照阅读表，不是同协议性能排行榜。请回原文核查条件。'));}selects.forEach(s=>s.onchange=render);render();
  }
  const originalOpen=G.openPaper;
  G.openPaper=function(pid,...args){document.body.dataset.learningView='paper';const result=originalOpen.call(this,pid,...args);ready.then(()=>{if(G.curPid!==pid)return;const p=pack.papers.find(x=>x.pid===pid);if(!p||document.getElementById('core-paper-entry'))return;const entry=element('div','research-actions');entry.id='core-paper-entry';entry.append(button('图解范本 · '+p.name,()=>showStory(pid),true),button('对照阅读',compare));document.getElementById('main').prepend(entry);});return result;};
  G.learningReport=function(pid){
    const paper=G.byPid[pid];if(!paper)return;
    const st=G.ps(pid),written=fields.filter(f=>(st.self||{})[f]?.trim());
    const verified=fields.filter(f=>st.researchEvidence?.[f]?.status==='human_reviewed'&&st.researchEvidence[f].summary===(st.self||{})[f]);
    const stale=fields.filter(f=>st.researchEvidence?.[f]&&!verified.includes(f));
    G.modal('学习复盘 · '+escape(paper.title),'<div id="core-review-report" class="core-story"></div>');document.getElementById('bigModal').dataset.workspace='core';
    const report=document.getElementById('core-review-report');
    const metrics=element('div','core-metrics');metrics.innerHTML='<span><b>'+written.length+'/7</b>已填写字段</span><span><b>'+verified.length+'/7</b>有人工复核依据</span><span><b>'+stale.length+'</b>需重新核对</span>';report.append(metrics);
    report.append(element('p','core-small','这些指标反映记录与复核进度，不评价科学结论正确性，也不按字数判断是否读懂。'));
    const missing=fields.filter(f=>!written.includes(f));
    if(missing.length)report.append(block('还可以补充',missing.join('、')+'：可以继续阅读，也可以在标注草稿中说明材料不足或不适用。'));
    if(stale.length)report.append(block('修改后再核对',stale.join('、')+'已有结论或复核状态发生变化，请重新检查原文依据。'));
    const quiz=state(pid).quiz;
    report.append(block('理解练习记录',quiz?'范本理解题尝试 '+quiz.attempts+' 次，最近一次'+(quiz.correct?'答对':'待订正')+'。一次答对并不代表长期掌握。':'这篇尚无范本理解题记录，可以先做一次练习，再解释选择的原因。'));
    if(st.quiz?.total)report.append(block('原有测验记录',String(st.quiz.score)+' / '+String(st.quiz.total)+'，保留原测验协议，不与字段覆盖率混成一个质量分。'));
    const actions=element('div','research-actions');actions.append(button('继续证据标注',()=>window.QiyaojiResearch.open(pid),true),button('理解练习',()=>G.startExam(pid)),button('安排一天后复习',()=>window.QiyaojiStudy.schedule(pid,1)));report.append(actions);
  };
  window.QiyaojiCurriculum={showIndex,showStory,compare,ready};
  ready.then(()=>{if(!G.curPid)showIndex();const start=document.getElementById('rk-welcome-start');if(start){start.textContent='从World Models开始图解学习';start.onclick=()=>showStory('#1006');}}).catch(()=>{});
})();
