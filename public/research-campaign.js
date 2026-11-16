(function(){
  'use strict';
  const pack=window.QIYAOJI_RESEARCH20;
  if(!pack||pack.papers?.length!==20)return;
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  const btn=(text,action,primary=false)=>{const b=el('button','btn'+(primary?' gold':''),text);b.type='button';b.onclick=action;return b;};
  const link=(text,url)=>{const a=el('a','core-link',text);try{const u=new URL(url);if(u.protocol!=='https:')return el('span','',text+'（链接待核）');a.href=u.href;}catch{return el('span','',text+'（链接待核）');}a.target='_blank';a.rel='noopener noreferrer';return a;};
  const para=(parent,text,cls='')=>{const p=el('p',cls,text);parent.append(p);return p;};
  const section=(parent,title)=>{const s=el('section','rc-section');s.append(el('h3','',title));parent.append(s);return s;};
  const details=(parent,title,render)=>{const d=el('details','rc-details');d.append(el('summary','',title));render(d);parent.append(d);return d;};
  function archiveLink(){const a=el('a','btn','查看 / 保存完整JSON');a.href='assets/research20/campaign.json';a.target='_blank';a.rel='noopener';return a;}
  function progressLink(){const a=el('a','btn gold','推进看板 ↗');a.href='research-progress.html';a.target='_blank';a.rel='noopener';return a;}
  function shell(title,description){G.closeModal();document.body.dataset.learningView='research20';const main=document.getElementById('main');main.replaceChildren();const s=el('article','core-shell rc-shell');const top=el('div','core-top');const t=el('div');t.append(el('div','core-kicker','RESEARCH 20 · READ, CHECK, DECIDE'),el('h2','',title));para(t,description);top.append(t);s.append(top);main.append(s);return s;}
  function showIndex(){
    const s=shell(pack.title,pack.disclaimer);
    const actions=el('div','research-actions');actions.append(progressLink(),btn('选题结论与实验路线',showRecommendations,true),btn('查询自检与查重',showAudit),archiveLink(),btn('原核心20范本',()=>QiyaojiCurriculum.showIndex()));s.append(actions);
    const metrics=el('div','core-metrics');for(const text of ['20 篇主文研读','140 项七钥解读','60 处PDF短摘录定位','0 次代码复现'])metrics.append(el('span','',text));s.append(metrics);
    para(s,'从综述定位问题 → 读主文与相关实验附录 → 查代码与资源 → 核对数字和边界 → 查新颖性重合 → 决定是否做小实验。以下分类是编辑建议。','rc-note');
    const facets=el('section','core-facets');const search=el('input');search.type='search';search.placeholder='搜索问题、方法、论文或自检发现';search.setAttribute('aria-label','搜索2026研读档案');facets.append(search);
    const filters={};for(const dimension of pack.dimensions){const label=el('label','',dimension),select=el('select');const all=el('option','','全部');all.value='';select.append(all);for(const value of [...new Set(pack.papers.map(p=>p.tags[dimension]))]){const o=el('option','',value);o.value=value;select.append(o);}select.onchange=render;filters[dimension]=select;label.append(select);facets.append(label);}
    facets.append(btn('清除筛选',()=>{search.value='';Object.values(filters).forEach(x=>x.value='');render();}));s.append(facets);
    const count=el('p','core-small');count.setAttribute('role','status');count.setAttribute('aria-live','polite');const grid=el('div','core-grid rc-grid');s.append(count,grid);
    function render(){const q=search.value.trim().toLowerCase();const rows=pack.papers.filter(p=>Object.entries(filters).every(([key,select])=>!select.value||p.tags[key]===select.value)&&(!q||JSON.stringify([p.pid,p.title,p.name,p.tags,p.keys,p.self_audit]).toLowerCase().includes(q)));count.textContent=rows.length+' / 20篇 · 助手已填写；不代表用户掌握';grid.replaceChildren();
      for(const p of rows){const card=el('article','core-card'),body=el('div','core-card-body');para(body,p.pid+' · '+p.tags['复现建议'],'rc-eyebrow');body.append(el('h3','',p.name));para(body,p.title,'core-small');para(body,p.keys[0].text);const tags=el('div','rc-tags');for(const k of ['任务','方法','资源层级'])tags.append(el('span','',p.tags[k]));body.append(tags);para(body,p.venue,'core-small');body.append(btn('阅读七钥与自检',()=>showPaper(p.pid),true));card.append(body);grid.append(card);}
      if(!rows.length)para(grid,'没有匹配的记录，可清除筛选后再试。','rc-note');
    }search.oninput=render;render();
  }
  function showPaper(pid){
    const p=pack.papers.find(x=>x.pid===pid);if(!p)return;
    const s=shell(p.name,'助手研读档案 · 原文证据定位不等于语义已由人工核实 · 未运行作者代码');
    const actions=el('div','research-actions');actions.append(btn('返回20篇',showIndex),link('论文公开PDF',p.paper_source),link('会议官方记录',p.venue_source),btn('填写我的七钥',()=>{G.openPaper(p.pid);QiyaojiResearch.open(p.pid);}));if(p.code)actions.append(link('官方代码',p.code));s.append(actions);
    para(s,p.title,'rc-title');para(s,p.venue+'；'+p.code_status,'rc-note');
    details(s,'阅读范围与来源指纹',d=>{para(d,p.read_scope);para(d,p.source_origin);para(d,'已读PDF页：'+p.read_pages.join('、')+' / 文件共'+p.page_count+'页。页码均从PDF第一页起算。');para(d,'SHA-256：'+p.source_sha256,'rc-hash');para(d,p.evidence_check.method);});
    const keys=section(s,'七钥 · 从问题到适用边界');const grid=el('div','rc-keys');for(const k of p.keys){const block=el('section','rc-key');block.append(el('h4','',k.key));para(block,k.text);para(block,'依据：PDF第'+k.pages.join('、')+'页','core-small');grid.append(block);}keys.append(grid);
    const evidence=section(s,'原文定位 · 短摘录');for(const a of p.anchors){const row=el('div','rc-anchor');row.append(el('strong','','PDF第'+a.page+'页'),el('q','',a.needle),el('span','core-small','文本定位已通过；请结合上下文复核'));evidence.append(row);}
    const quiz=section(s,'理解题与复盘');para(quiz,p.quiz.question,'rc-question');details(quiz,'展开助手自答与自检',d=>{para(d,p.quiz.answer);para(d,p.quiz.self_check,'rc-note');});para(quiz,p.reflection);
    const repro=section(s,'复现与改进 · 尚未执行');for(const [label,key] of [['适合程度','fit'],['硬件门槛','hardware'],['最小试验','pilot'],['创新重合风险','novelty_risk']]){repro.append(el('h4','',label));para(repro,p.reproduction[key]);}
    const audit=section(s,'查询时的自检');for(const text of p.self_audit||[])para(audit,'• '+text);para(audit,'所有摘录已自动定位；中文解读、数学疑点和代码行为仍需人工或运行复核。','rc-note');
    if(p.code_audit){const a=p.code_audit,c=section(s,'官方代码静态核查');para(c,a.scope);para(c,'固定commit：'+a.commit,'rc-hash');para(c,'GitHub可识别许可：'+(a.license_spdx||'未标明SPDX，公开可读不等于已核实开源授权'),'core-small');for(const text of a.findings)para(c,'• '+text);details(c,'查看代码依据与文件指纹',d=>{for(const file of a.sources){d.append(link(file.path,file.source));para(d,'SHA-256 '+file.sha256,'rc-hash');}});}
    const i=pack.papers.indexOf(p),nav=el('div','research-actions');if(i>0)nav.append(btn('上一篇',()=>showPaper(pack.papers[i-1].pid)));if(i<19)nav.append(btn('下一篇',()=>showPaper(pack.papers[i+1].pid)));s.append(nav);window.scrollTo(0,0);
  }
  function showRecommendations(){
    const r=pack.recommendations,s=shell('先复现哪篇，再决定改什么',r.basis);s.append(btn('返回20篇',showIndex));para(s,r.acceptance,'rc-note');
    for(const item of r.shortlist){const block=section(s,item.rank+'. '+item.decision);para(block,item.reason);para(block,'投稿竞争力判断：'+item.publication);para(block,'待检验假设：'+item.hypothesis);para(block,'停止条件：'+item.stop,'rc-note');block.append(btn('查看本篇证据',()=>showPaper(item.pid)));}
    const plan=section(s,'14天最小实验路线 · 计划而非成果');for(const item of r.plan){plan.append(el('h4','',item.phase));para(plan,item.work);para(plan,'推进门槛：'+item.gate,'core-small');}para(plan,r.budget,'rc-note');
  }
  function showAudit(){
    const s=shell('查询也是自检',pack.novelty.scope);s.append(btn('返回20篇',showIndex));if(pack.novelty.followup){const a=el('a','btn gold','宏观与骡 · 查新及边界');a.href='macro-mule-review.html';a.target='_blank';a.rel='noopener';s.append(a);para(s,pack.novelty.followup.verdict,'rc-note');}const claims=section(s,'已纠正的口径');for(const text of pack.novelty.claim_corrections)para(claims,'• '+text);
    const catalog=section(s,'题录与会议类别');for(const item of pack.novelty.catalog_corrections){para(catalog,item.ids.join('、')+'：'+item.issue);catalog.append(link('核查来源',item.source));}
    const novelty=section(s,'新颖性重合 · 仅摘要/概述查重');for(const item of pack.novelty.items){novelty.append(el('h4','',item.title),link('原始来源',item.url));para(novelty,item.overlap);para(novelty,item.status,'core-small');}
    const surveys=section(s,'先读综述 · 不计入20篇');for(const item of pack.surveys.sources){surveys.append(link(item.title,item.url));para(surveys,'阅读范围：'+item.sections);para(surveys,item.takeaway);}for(const text of pack.surveys.audit)para(surveys,text,'rc-note');
  }
  const launch=btn('2026选题 · 20篇研读',showIndex,true),nav=document.querySelector('header .learning-nav');if(nav)nav.insertBefore(launch,nav.querySelector('.learning-more'));else document.querySelector('header').append(launch);
  const round2=el('a','btn','第二批20篇 · 全文复核');round2.href='research-round2.html';round2.target='_blank';round2.rel='noopener';if(nav)nav.insertBefore(round2,nav.querySelector('.learning-more'));
  const round3=el('a','btn','研究定位 · 第三批20篇');round3.href='research-round3.html';round3.target='_blank';round3.rel='noopener';if(nav)nav.insertBefore(round3,nav.querySelector('.learning-more'));
  window.QiyaojiResearchCampaign={showIndex,showPaper,showAudit,showRecommendations};
})();
