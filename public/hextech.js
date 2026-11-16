(function(){
  'use strict';
  const fields=['靶子','坐标','主张','机制','证据','数字','边界'];
  const glyphs=['◎','⌖','✦','⚙','◈','Σ','⬡'];
  const names=['问题锁定','版图定位','贡献洞察','机制拆解','证据侦察','数值打击','边界护盾'];
  const augments=[
    {id:'researcher',symbol:'⌖',name:'研究者 · 开拓之眼',tag:'问题与贡献视角',description:'把论文放回研究版图：为什么值得做，前人缺什么，作者究竟推进了哪一步。',task:'产出：研究定位卡。优先阅读靶子、坐标、主张。',focus:['靶子','坐标','主张'],questions:['作者要解决的具体问题和适用条件是什么？','最相关的已有方法缺了什么，本文改变了哪一点？','这项贡献与我的研究有什么联系，还有哪个可检验的问题？']},
    {id:'engineer',symbol:'⚙',name:'实现者 · 机械飞升',tag:'机制与复现视角',description:'把方法拆成可执行步骤：输入输出、关键模块、训练推理与最小复现条件。',task:'产出：机制流程与复现清单。优先阅读机制、数字、边界。',focus:['机制','数字','边界'],questions:['输入经过哪些关键步骤得到什么输出？请写出机制链。','训练与推理分别需要哪些数据、损失、模块与资源？','最小复现应先跑通哪一步，哪个模块适合做可控改进？']},
    {id:'reviewer',symbol:'◈',name:'审稿人 · 真视护盾',tag:'证据与边界视角',description:'检验结论站不站得住：比较是否公平，消融是否支持机制，哪些条件尚未验证。',task:'产出：证据核查表。优先阅读证据、数字、边界。',focus:['证据','数字','边界'],questions:['哪组实验直接支持核心主张，对照条件是否一致？','哪些消融或数字能排除其他解释，是否有统计与预算限制？','最可能失败或不能外推的情形是什么，还缺哪项验证？']}
  ];
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let store={choices:{},review:{},reviewHistory:{}};
  try{const saved=JSON.parse(localStorage.getItem('qiyaoji_hextech_v1')||'null');if(saved?.choices&&saved?.review)store=saved;}catch{}
  store.reviewHistory=store.reviewHistory||{};
  function save(){try{localStorage.setItem('qiyaoji_hextech_v1',JSON.stringify(store));return true;}catch{G.toast('!','未能保存配置','请检查浏览器存储并备份记录');return false;}}
  function button(text,action,primary){const b=document.createElement('button');b.className='btn'+(primary?' gold':'');b.textContent=text;b.onclick=action;return b;}
  
  // Research mode remains available, but the default is the game interface.
  let hasPreference=false;try{hasPreference=localStorage.getItem('qiyaoji_research_focus')!==null;}catch{}
  if(!hasPreference){const toggle=Array.from(document.querySelectorAll('header button')).find(b=>b.textContent==='专注模式 · 开');if(toggle)toggle.click();}
  const buttons={btnMap:'论文地图',btnCards:'学习档案',btnAch:'学习里程碑',btnDaily:'每日学习',btnGuide:'学习指南'};
  for(const [id,text] of Object.entries(buttons)){const b=document.getElementById(id);if(b)b.textContent=text;}
  const launch=Array.from(document.querySelectorAll('header button')).find(b=>b.textContent==='七钥抽取');if(launch)launch.textContent='侦察 · 七钥抽取';
  const guide=document.createElement('button');guide.className='btn';guide.textContent='阅读策略';guide.onclick=()=>choose(G.curPid||G.papers[0].pid);document.querySelector('header').append(guide);
  document.querySelector('header').append(button('复习队列',reviewQueue));
  function schedule(pid,days=1){if(!G.byPid[pid]||!Number.isFinite(days)||days<1||days>365)return false;const previous=store.review[pid];store.review[pid]=Date.now()+days*86400000;if(!save()){if(previous===undefined)delete store.review[pid];else store.review[pid]=previous;return false;}G.toast('⌛','已安排复习',days+'天后在复习队列回看，不发送通知');return true;}
  function selectStrategy(pid,id){
    if(!G.byPid[pid]||!augments.some(a=>a.id===id))return false;
    const before=structuredClone(store);if(before.choices[pid]&&!augments.some(a=>a.id===before.choices[pid])){store.legacyChoices=store.legacyChoices||{};store.legacyChoices[pid]=before.choices[pid];}store.choices[pid]=id;
    if(before.choices[pid]!==id){store.choiceHistory=store.choiceHistory||{};store.choiceHistory[pid]=(store.choiceHistory[pid]||[]).concat({id,at:Date.now()});}
    if(!save()){store=before;return false;}
    window.dispatchEvent(new CustomEvent('qiyaoji:strategy-updated',{detail:{pid,id}}));return true;
  }
  function savePerspectiveNote(pid,id,index,text){
    if(!G.byPid[pid]||!augments.some(a=>a.id===id)||!Number.isInteger(index)||index<0||index>2||typeof text!=='string'||text.length>6000)return false;
    const before=structuredClone(store);store.perspectiveNotes=store.perspectiveNotes||{};store.perspectiveNotes[pid]=store.perspectiveNotes[pid]||{};
    const note=store.perspectiveNotes[pid][id]||{answers:['','','']};note.answers[index]=text;note.updated_at=Date.now();store.perspectiveNotes[pid][id]=note;
    if(!save()){store=before;return false;}return true;
  }
  window.QiyaojiStudy={schedule,reviewQueue,chooseStrategy:choose,selectStrategy,savePerspectiveNote,getPerspectiveNote:(pid,id)=>structuredClone(store.perspectiveNotes?.[pid]?.[id]||{answers:['','','']}),getAugments:()=>structuredClone(augments),getStrategy:pid=>structuredClone(augments.find(a=>a.id===store.choices[pid])||null),getReview:pid=>structuredClone({due:store.review[pid]||null,history:store.reviewHistory[pid]||[]})};
  document.title='七钥纪 · 海克斯论文学习工作台';
  function lobby(){
    const main=document.getElementById('main');
    const old=main.querySelector('.research-banner');if(old)old.remove();
    const hero=document.createElement('section');hero.className='hx-lobby';
    hero.innerHTML='<div class="hx-eyebrow">QIYAOJI · READING ARENA</div><h2>七钥精读 · 学有所据</h2><p>以研究问题为起点，用七个维度理解论文。保留原文依据，完成练习与复习，把阅读沉淀为可复用的标注。</p><div class="hx-route"><span>01 选择论文</span><span>02 阅读策略</span><span>03 阅读与证据</span><span>04 理解练习</span><span>05 复盘与标注</span></div>';
    const actions=document.createElement('div');actions.className='hx-actions';
    actions.append(button('选择论文 · 开始学习',()=>G.openMap(),true),button('阅读策略',()=>choose(G.curPid||G.papers[0].pid)),button('明日复习队列',reviewQueue));hero.append(actions);
    const caption=document.createElement('p');caption.className='hx-note';caption.textContent='七钥点亮表示已经填写；正确性需要证据复核。游戏风格辅助反馈，不作为学习质量判断。';hero.append(caption);main.prepend(hero);
  }
  const open=G.openPaper;
  G.openPaper=function(pid,...args){const result=open.call(this,pid,...args);loadout(pid);return result;};
  function loadout(pid){
    const p=G.byPid[pid];if(!p)return;
    const main=document.getElementById('main');main.querySelector('.hx-loadout')?.remove();
    const panel=document.createElement('section');panel.className='hx-loadout';
    const heading=document.createElement('h3');heading.textContent='七钥学习路径 · 理解与证据';panel.append(heading);
    const slots=document.createElement('div');slots.className='hx-slots';
    fields.forEach((f,i)=>{const written=!!(G.ps(pid).self||{})[f]?.trim();const slot=document.createElement('button');slot.className='hx-slot'+(written?' ready':'');slot.innerHTML='<b>'+glyphs[i]+'</b><span>'+names[i]+'</span><small>'+escape(f)+' · '+(written?'已填写':'待铸造')+'</small>';slot.onclick=()=>G.runeModal(pid,f);slot.setAttribute('aria-label',names[i]+'：'+(written?'已填写':'待填写'));slots.append(slot);});panel.append(slots);
    const selected=augments.find(a=>a.id===store.choices[pid]);
    const note=document.createElement('div');note.className='hx-chosen';note.textContent=selected?selected.symbol+' '+selected.name+' · '+selected.task:'可选：选择一种阅读策略，也可以直接阅读与练习。';panel.append(note);
    const actions=document.createElement('div');actions.className='hx-actions';
    actions.append(button(selected?'更换阅读策略':'选择阅读策略',()=>choose(pid),true),button('理解练习',()=>G.startExam(pid)),button('学习复盘',()=>G.learningReport(pid)),button('加入明日复习',()=>schedule(pid,1)));panel.append(actions);main.prepend(panel);
  }
  const saveSelf=G.autoSaveSelf;G.autoSaveSelf=function(pid,...args){const result=saveSelf.call(this,pid,...args);if(document.querySelector('.hx-loadout'))loadout(pid);return result;};
  window.addEventListener('qiyaoji:evidence-updated',event=>{if(G.curPid===event.detail.pid)loadout(event.detail.pid);});
  function choose(pid){
    const p=G.byPid[pid];if(!p)return;
    G.modal('海克斯策略卡 · 辅助阅读','<p class="hx-note">'+escape(p.title)+' · 任选一项，也可关闭跳过。策略只提供学习建议，不影响访问权限或成绩。</p><div class="hx-augments">'+augments.map(a=>'<button class="hx-augment" data-augment="'+a.id+'"><span class="hx-symbol">'+a.symbol+'</span><span class="hx-eyebrow">'+a.tag+'</span><strong>'+a.name+'</strong><span>'+a.description+'</span><small>'+a.task+'</small></button>').join('')+'</div>');
    document.querySelectorAll('[data-augment]').forEach(b=>b.onclick=()=>{if(!selectStrategy(pid,b.dataset.augment))return;G.closeModal();if(G.curPid!==pid)G.openPaper(pid);else loadout(pid);G.toast('⬡','阅读策略已选',augments.find(a=>a.id===b.dataset.augment).name);});
  }
  function reviewQueue(){
    const items=Object.entries(store.review).filter(([pid])=>G.byPid[pid]).sort((a,b)=>a[1]-b[1]);
    G.modal('时光回响 · 回忆复习','<p class="hx-note">先闭卷复述输入→关键模块→输出，再检查训练/推理差异和失效条件；保存后核对原文。记录保存在本机，不发送通知。</p><div id="hx-review-list"></div>');
    const list=document.getElementById('hx-review-list');if(!items.length)list.textContent='尚无复习任务，在论文装备栏添加一篇。';
    items.forEach(([pid,time])=>{
      const row=document.createElement('div');row.className='hx-loadout';
      const title=document.createElement('p');title.textContent=G.byPid[pid].title;
      const due=document.createElement('p');due.className='hx-note';due.textContent=(time<=Date.now()?'已到复习时间 · ':'计划复习 · ')+new Date(time).toLocaleString('zh-CN');
      const recall=document.createElement('textarea');recall.maxLength=3000;recall.placeholder='先不看原文：复述核心机制，或记下仍不确定的问题。';recall.setAttribute('aria-label',G.byPid[pid].title+'复习复述');
      const result=document.createElement('select');result.setAttribute('aria-label','自评与下次复习时间');
      result.innerHTML='<option value="1">仍不确定 · 1天后再看</option><option value="3">基本理解 · 3天后再看</option><option value="7">能独立解释 · 7天后再看</option><option value="0">结束本轮，不安排下次</option>';
      const status=document.createElement('p');status.className='hx-note';status.setAttribute('role','status');
      row.append(title,due,button('机制题自检',()=>{if(recall.value.trim()){status.textContent='请先保存复述，再开始机制题，避免丢失当前输入。';return;}G.closeModal();window.QiyaojiModels?.mechanismExam(pid);}),button('AI出题复习',()=>{if(recall.value.trim()){status.textContent='请先保存复述，再开始AI考试。';return;}window.QiyaojiModels?.exam(pid);}),button('打开原文核对',()=>{if(recall.value.trim()&&!confirm('当前复述尚未保存，打开阅读页会关闭此面板。是否继续？'))return;G.closeModal();G.openPaper(pid);}),recall,result,status,button('保存复习记录',()=>{
        if(!recall.value.trim()){status.textContent='请先写一句复述或待解决的问题。';return;}
        const days=Number(result.value),record={reviewed_at:Date.now(),reflection:recall.value.trim(),self_assessment:result.selectedOptions[0].textContent,next_days:days};
        const before=structuredClone(store);
        store.reviewHistory[pid]=(store.reviewHistory[pid]||[]).concat(record);
        if(days)store.review[pid]=Date.now()+days*86400000;else delete store.review[pid];
        try{localStorage.setItem('qiyaoji_hextech_v1',JSON.stringify(store));window.dispatchEvent(new CustomEvent('qiyaoji:review-saved',{detail:{pid}}));reviewQueue();G.toast('⌛','复习记录已保存','这是自评记录，不代表系统认定掌握');}catch{store=before;status.textContent='保存失败，请复制复述内容备份后重试。';}
      }));list.append(row);
    });
  }
  if(!G.curPid)lobby();else loadout(G.curPid);
  if(document.getElementById('rk-welcome-start')){
    document.getElementById('bigTitle').textContent='欢迎使用 · 七钥论文学习工作台';
    const welcome=document.getElementById('rk-welcome-start');welcome.textContent='开始阅读论文';welcome.onclick=()=>{const pid=G.papers[0].pid;G.closeModal();G.openPaper(pid);};
    const title=document.querySelector('#bigBody h2');if(title)title.textContent='用七个问题，形成自己的论文理解';
  }
})();
