(function(){'use strict';if(!window.QIYAOJI_LOCAL_APP)return;const KEY='qiyaoji_realm_rewards_v1';const E=(t,text,c)=>{const e=document.createElement(t);if(text!==undefined)e.textContent=text;if(c)e.className=c;return e;};const B=(text,fn)=>{const b=E('button',text,'ws-button');b.type='button';b.onclick=fn;return b;};let state;try{state=JSON.parse(localStorage.getItem(KEY)||'{}');}catch{state={};}state={ledger:{},spent:0,unlocked:[],...state};const day=()=>new Date(Date.now()+28800000).toISOString().slice(0,10),total=()=>Object.values(state.ledger).reduce((n,e)=>n+e.amount,0),balance=()=>total()-state.spent;let badge;
function refresh(){if(badge){badge.textContent='✦ '+balance();badge.title='知识碎片 · 点击查看学习成长';}document.body.dataset.realmCosmetic=state.active||'';}
function award(id,amount,label,quiet=false){if(state.ledger[id])return false;const old=structuredClone(state);state.ledger[id]={amount,label,at:new Date().toISOString()};try{localStorage.setItem(KEY,JSON.stringify(state));refresh();if(!quiet)window.G?.toast('✦','知识碎片 +'+amount,label+' · 奖励学习记录，不代表掌握');return true;}catch{state=old;return false;}}
function center(){const d=E('dialog',undefined,'ws-model-dialog realm-dialog'),sum=total(),rank=sum>=500?'海克斯研究员':sum>=150?'符文探索者':'知识学徒';d.append(E('h2','学习远征 · '+rank),E('p','知识碎片 '+balance()+' · 累计 '+sum+'。奖励用于装饰，不锁定论文与学习功能。'),E('p','每篇每钥首次确认填空 +8；首次关联人工复核证据 +12；每日完成考试交卷 +20；每日保存回忆复习 +15。重复点击不重复奖励。'));const progress=E('progress');progress.max=500;progress.value=Math.min(sum,500);d.append(progress);for(const [id,name,cost]of [['rune','智识符文边框',60],['hexcore','海克斯核心边框',150]])d.append(B(state.unlocked.includes(id)?'装备 '+name:name+' · '+cost+'碎片',()=>{const old=structuredClone(state);if(!state.unlocked.includes(id)){if(balance()<cost){message.textContent='碎片不足，继续学习即可；所有论文仍可阅读。';return;}state.spent+=cost;state.unlocked.push(id);}state.active=id;try{localStorage.setItem(KEY,JSON.stringify(state));refresh();message.textContent='已装备 '+name;}catch{state=old;message.textContent='保存失败，碎片未扣除。';}}));const message=E('p');d.append(message,E('h3','最近获得'));for(const e of Object.values(state.ledger).slice(-12).reverse())d.append(E('p','+'+e.amount+' · '+e.label));d.append(B('继续学习',()=>d.close()));document.body.append(d);d.addEventListener('close',()=>d.remove());d.showModal();}
function scan(quiet=true){let papers={};try{papers=window.G?.S?.papers||JSON.parse(localStorage.getItem('wmquest_v1')||'{}').papers||{};}catch{}for(const [pid,p]of Object.entries(papers)){for(const key of Object.keys(p.learning_fill||{}))if(p.self?.[key]?.trim())award('fill:'+pid+':'+key,8,pid+' · '+key+'填空确认',quiet);for(const [key,e]of Object.entries(p.researchEvidence||{}))if(e.status==='human_reviewed'&&e.source_id&&e.summary===p.self?.[key])award('evidence:'+pid+':'+key,12,pid+' · '+key+'人工证据复核',quiet);if(p.quiz?.attempts&&p.quiz.total>0&&Number.isFinite(p.quiz.ts))award('exam:'+pid+':'+new Date(p.quiz.ts+28800000).toISOString().slice(0,10),20,pid+' · 完成理解考试',quiet);}let reviews={};try{reviews=JSON.parse(localStorage.getItem('qiyaoji_hextech_v1')||'{}').reviewHistory||{};}catch{}for(const [pid,records]of Object.entries(reviews))for(const r of records)if(r.reflection?.trim()&&Number.isFinite(r.reviewed_at))award('review:'+pid+':'+new Date(r.reviewed_at+28800000).toISOString().slice(0,10),15,pid+' · 回忆复习',quiet);let exams={};try{exams=JSON.parse(localStorage.getItem('qiyaoji_ai_exams_v1')||'{}');}catch{}for(const [pid,exam]of Object.entries(exams))for(const a of exam.attempts||[])if(Object.values(a.answers||{}).some(x=>x.trim()))award('exam:'+pid+':'+new Date(Date.parse(a.submitted_at)+28800000).toISOString().slice(0,10),20,pid+' · 完成AI试卷交卷',quiet);}
function init({bar,tools}){badge=B('✦ 0',center);badge.classList.add('realm-reward-badge');bar.append(badge);tools.append(B('成长与奖励',center));scan();refresh();window.addEventListener('qiyaoji:learning-published',event=>award('fill:'+event.detail.pid+':'+event.detail.key,8,event.detail.key+'填空确认'));window.addEventListener('qiyaoji:evidence-updated',()=>scan(false));window.addEventListener('qiyaoji:exam-submitted',()=>scan(false));window.addEventListener('qiyaoji:review-saved',()=>scan(false));if(window.G?.finishExam){const original=G.finishExam;G.finishExam=function(...args){const result=original.apply(this,args);scan(false);return result;};}}

const realms=[
 ['demacia','德玛西亚','基准/评测',235,310,'公平比较 · 证据与协议'],
 ['freljord','弗雷尔卓德','视频生成/游戏',300,145,'跨越长时程 · 未来预测'],
 ['noxus','诺克萨斯','决策/强化学习',490,235,'决策远征 · 规划与控制'],
 ['piltover','皮尔特沃夫','3D/空间智能,Mamba/SSM',645,405,'海克斯工坊 · 空间与架构'],
 ['zaun','祖安','具身/VLA',645,478,'实现实验室 · 感知与行动'],
 ['ionia','艾欧尼亚','理论/表征',840,205,'理解表征 · 追问机制'],
 ['shurima','恕瑞玛','自动驾驶',535,590,'穿越未知 · 驾驶与导航'],
 ['targon','巨神峰','智能体/LLM',365,610,'智能体研究 · 推理与协作'],
 ['bilgewater','比尔吉沃特','物理仿真,科学/行业应用',850,465,'探索应用 · 物理与科学']
];
const seven=['靶子','坐标','主张','机制','证据','数字','边界'];
function runeProgress(pid){const p=window.G?.S?.papers?.[pid]||{};return seven.filter(k=>p.learning_fill?.[k]&&p.self?.[k]?.trim()).length;}
const articleKinds=[['survey','◎','综述'],['method','◇','方法'],['benchmark','▣','基准'],['dataset','▤','数据集'],['unknown','？','待分类']];
function articleTypes(p){
 const title=(p.title||'')+' '+(p.cn||'');const types=[];
 if(p.survey===true||p.dir==='综述'||/\bsurvey\b|\breview\b|综述/i.test(title))types.push('survey');
 if(/\bbenchmark(?:s|ing)?\b|评测基准|测试集/i.test(title))types.push('benchmark');
 if(/\bdataset(?:s)?\b|数据集/i.test(title))types.push('dataset');
 if(!types.length&&/\b(model|learning|framework|transformer|diffusion|planning|policy|training)\b|模型|学习|框架|训练|规划/i.test(title))types.push('method');
 return types.length?types:['unknown'];
}
function articleYears(p){return String(p.year||'').match(/(?:19|20)\d{2}/g)||[];}
function belongs(p,realm){
 if(realm[2].split(',').includes(p.dir))return true;
 if(p.dir!=='综述')return false;
 const title=(p.title||'')+' '+(p.cn||'');
 const patterns={demacia:/benchmark|evaluation|评测|评估/i,freljord:/video|generation|视频|生成/i,noxus:/reinforcement|planning|control|强化学习|规划|控制/i,piltover:/3d|spatial|mamba|空间/i,zaun:/robot|embodied|vision.language.action|机器人|具身|VLA/i,ionia:/representation|theor|表征|理论/i,shurima:/driv|驾驶/i,targon:/agent|language model|智能体|语言模型/i,bilgewater:/physical|physics|scientific|物理|科学/i};
 return patterns[realm[0]].test(title);
}
function mountMap(main){
 const old=E('details',undefined,'ws-study-extra');old.append(E('summary','原有地图与筛选工具'));const original=E('div');while(main.firstChild)original.append(main.firstChild);old.append(original);
 const shell=E('section',undefined,'realm-map-shell');shell.append(E('div','RUNETERRA · THE RUNES OF KNOWLEDGE','ws-eyebrow'),E('h1','符文大陆 · 寻回散落的知识'),E('p','每篇论文是一枚符文。选择城邦，再选择散落的符文，沿七钥逐步解读。','realm-intro'));
 const layout=E('div',undefined,'realm-map-layout'),map=E('div',undefined,'realm-continent'),ns='http://www.w3.org/2000/svg';
 const S=(tag,attrs={},text)=>{const n=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==undefined)n.textContent=text;return n;};
 const svg=S('svg',{viewBox:'0 0 1000 760','aria-label':'符文大陆论文地图'});
 svg.append(S('image',{href:'/assets/runeterra/terrain.jpg',x:-140,y:-305,width:1320,height:1320,'aria-hidden':'true'}),S('rect',{x:0,y:0,width:1000,height:760,fill:'#071723',opacity:'.2','pointer-events':'none'}));
 const regionLayer=S('g',{'class':'realm-cities'}),runeLayer=S('g',{'class':'realm-runes'});svg.append(regionLayer,runeLayer);
 const papers=window.G?.papers||Object.values(window.G?.byPid||{}),panel=E('section',undefined,'realm-region-panel'),nav=E('div',undefined,'realm-region-nav');
 const status=E('div','◇ 未解读　◆ 解读中　✦ 七钥已填','realm-map-legend');map.append(svg,status);
 const quotes=['知识才是真正的武器。','来吧，符文在召唤。','也许会失败，但我不会放弃。'];
 const quote=E('blockquote',undefined,'realm-lore');quote.append(E('span',quotes[0]),E('cite','— 瑞兹'));
 let active='demacia',year='2026',type='all',mode='explore';
 const controls=E('div',undefined,'realm-filters');
 const select=(label,values,initial,change)=>{const wrap=E('label',label),input=E('select');input.setAttribute('aria-label',label);for(const[value,name]of values){const option=E('option',name);option.value=value;input.append(option);}input.value=initial;input.onchange=()=>change(input.value);wrap.append(input);controls.append(wrap);return input;};
 const yearInput=select('年代',[...Array.from(new Set(['2026',...papers.flatMap(articleYears)])).sort((a,b)=>Number(b)-Number(a)).map(y=>[y,y==='2026'?'2026 · 前沿':y]),['older','2024及更早'],['all','全部年份']],year,v=>{year=v;drawRegion(active);});
 const typeInput=select('符文类型',[['all','全部类型'],...articleKinds.map(([id,icon,label])=>[id,icon+' '+label])],type,v=>{type=v;drawRegion(active);});
 const modeInput=select('探索入口',[['explore','城邦研究'],['survey','综述观星台 · 全领域'],['classic','早期基础 · 2022及以前'],['mine','我的学习路线']],mode,v=>{mode=v;if(v==='classic'||v==='mine'){year='all';yearInput.value=year;}if(v==='survey'){active='targon';type='all';typeInput.value=type;}drawRegion(active);});
 controls.append(B('清除筛选',()=>{year='all';type='all';mode='explore';yearInput.value=year;typeInput.value=type;modeInput.value=mode;drawRegion(active);}));
 let depth=localStorage.getItem('qiyaoji_map_depth_v1')!=='off';shell.dataset.depth=depth?'on':'off';const depthButton=B(depth?'立体地图：开':'立体地图：关',()=>{depth=!depth;shell.dataset.depth=depth?'on':'off';depthButton.textContent=depth?'立体地图：开':'立体地图：关';try{localStorage.setItem('qiyaoji_map_depth_v1',depth?'on':'off');}catch{}});depthButton.setAttribute('aria-label','切换地图立体效果');controls.append(depthButton);
 const hint=E('small','9个研究方向 × 年代 × 文章类型。类型支持多标签，自动识别结果为候选；综述观星台汇集全部综述。','realm-filter-note');shell.append(controls,hint);

 const drawRegion=id=>{
  active=id;const realm=realms.find(r=>r[0]===id),base=mode==='survey'?papers.filter(p=>articleTypes(p).includes('survey')):papers.filter(p=>belongs(p,realm));
  const match=p=>{const years=articleYears(p).map(Number);return (year==='all'||year==='older'&&years.some(y=>y<=2024)||years.includes(Number(year)))&&(type==='all'||articleTypes(p).includes(type))&&(mode!=='classic'||years.some(y=>y<=2022))&&(mode!=='mine'||runeProgress(p.pid)>0);};
  const batches=[];for(let i=0;i<base.length;i+=6){const batch=base.slice(i,i+6).map((paper,slot)=>({paper,slot})).filter(({paper})=>match(paper));if(batch.length)batches.push(batch);}const subset=batches.flatMap(b=>b.map(x=>x.paper));

  panel.replaceChildren(E('small','当前远征 / '+realm[2].replaceAll(',',' · ')),E('h2',mode==='survey'?'综述观星台':realm[1]),E('p',mode==='survey'?'跨越城邦 · 先看全景，再找具体问题':realm[5]),E('p',subset.length+' 枚论文符文 · '+subset.filter(p=>runeProgress(p.pid)>0).length+' 枚已开始解读','realm-count'));
  panel.append(E('small',(year==='all'?'全部年份':year==='older'?'2024及更早':year)+' · '+(type==='all'?'全部类型':articleKinds.find(x=>x[0]===type)[2])+(mode==='survey'?' · 全领域综述':''),'realm-filter-note'));
  quote.firstChild.textContent=quotes[realms.indexOf(realm)%quotes.length];
  for(const node of regionLayer.querySelectorAll('[data-realm]'))node.setAttribute('aria-pressed',String(node.dataset.realm===id));for(const button of nav.children)button.setAttribute('aria-pressed',String(button.dataset.realm===id));
  let page=0;const list=E('div',undefined,'realm-paper-list'),pager=E('div',undefined,'ws-actions');
  const render=()=>{
   list.replaceChildren();runeLayer.replaceChildren();
   if(!subset.length)list.append(E('p','当前组合没有论文。可切换年代、类型或城邦，也可清除筛选。','realm-empty'));
   (batches[page]||[]).forEach(({paper:p,slot},i)=>{
    const progress=runeProgress(p.pid),kind=progress===7?'complete':progress?'studying':'unread',label=p.cn||p.title,url='/index.html?paper='+encodeURIComponent(p.pid)+'&learn=1';
    const a=E('a',undefined,'realm-paper '+kind);a.href=url;a.dataset.pid=p.pid;
    a.append(E('span',String(i+1).padStart(2,'0'),'realm-paper-number'),E('strong',label),E('small',[p.year,p.venue,progress+'/7 钥已确认',articleTypes(p).map(t=>articleKinds.find(k=>k[0]===t).slice(1).join(' ')).join(' / ')+'（类型候选）'].filter(Boolean).join(' · ')));list.append(a);
    // Six reachable rune markers per page keep dense libraries legible; every paper is reachable via paging.
    const offsets=id==='piltover'?[[-105,-90],[-30,-110],[80,-90],[-125,5],[110,0],[-80,70]]:id==='zaun'?[[-130,-20],[125,-10],[-90,70],[0,115],[95,80],[55,155]]:[[-100,-64],[0,-92],[104,-58],[-108,68],[0,107],[106,72]],x=Math.max(28,Math.min(972,(mode==='survey'?365:realm[3])+offsets[slot][0])),y=Math.max(30,Math.min(730,(mode==='survey'?610:realm[4])+offsets[slot][1]));
    const link=S('a',{href:url,'class':'realm-rune '+kind,'data-pid':p.pid,'aria-label':label+' · '+progress+'/7 钥已确认',tabindex:0});
    link.dataset.articleTypes=articleTypes(p).join(' ');link.append(S('text',{x:x-22,y:y-18,'class':'realm-type-glyph'},articleKinds.find(k=>k[0]===articleTypes(p)[0])[1]));
    link.append(S('ellipse',{cx:x+3,cy:y+23,rx:16,ry:6,'class':'realm-rune-shadow'}),S('title',{},label+' · '+progress+'/7 钥已确认'),S('circle',{cx:x,cy:y,r:23,'class':'realm-rune-hit'}),S('path',{d:`M${x} ${y-17}L${x+12} ${y}L${x} ${y+17}L${x-12} ${y}Z`,'class':'realm-crystal'}),S('path',{d:`M${x} ${y-17}L${x+12} ${y}L${x} ${y+17}Z`,'class':'realm-crystal-facet'}),S('path',{d:`M${x} ${y-10}L${x-4} ${y}L${x+4} ${y}L${x} ${y+10}`,'class':'realm-glyph'}),S('text',{x:x+22,y:y+4,'class':'realm-rune-number'},String(i+1)));
    link.addEventListener('pointerenter',()=>a.classList.add('is-hovered'));link.addEventListener('pointerleave',()=>a.classList.remove('is-hovered'));link.addEventListener('focus',()=>a.classList.add('is-hovered'));link.addEventListener('blur',()=>a.classList.remove('is-hovered'));runeLayer.append(link);
   });
   const before=B('上一组符文',()=>{page--;render();}),after=B('下一组符文',()=>{page++;render();});before.disabled=page===0;after.disabled=page+1>=batches.length;pager.replaceChildren(before,E('small',(page+1)+' / '+Math.max(1,batches.length)),after);
  };panel.append(list,pager,E('small','符文亮度依据已确认填空记录，不代表已掌握。','realm-progress-note'));render();
 };
 for(const [id,name,dirs,x,y]of realms){
  const group=S('g',{'data-realm':id,role:'button',tabindex:0,'aria-label':name+' · '+dirs,'class':'realm-city'}),icon=['piltover','zaun'].includes(id)?'piltover-zaun':id;
  group.append(S('ellipse',{cx:x+3,cy:y+31,rx:28,ry:9,'class':'realm-city-shadow'}),S('circle',{cx:x,cy:y+4,r:31,'class':'realm-city-rim'}),S('circle',{cx:x,cy:y,r:29,'class':'realm-city-ring'}),S('image',{href:'/assets/runeterra/'+icon+'.png',x:x-21,y:y-21,width:42,height:42,'pointer-events':'none'}));
  const twin=['piltover','zaun'].includes(id),tx=twin?x+(id==='piltover'?-42:42):x,ty=twin?y+6:y+48;
  group.append(S('text',{x:tx,y:ty,'class':'realm-city-name','text-anchor':twin?(id==='piltover'?'end':'start'):'middle'},name));
  const choose=()=>{if(mode==='survey'){mode='explore';modeInput.value=mode;}drawRegion(id);};group.onclick=choose;group.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}};regionLayer.append(group);const button=B(name,choose);button.dataset.realm=id;nav.append(button);
 }
 layout.append(map,panel);shell.append(layout,quote,nav);
 const attribution=E('small',undefined,'realm-attribution');attribution.append(document.createTextNode('地图与城邦徽记 © Riot Games · 论文主题与符文进度为本工作台设计 · '));const source=E('a','官方符文之地地图');source.href='https://map.leagueoflegends.com/en_US';source.target='_blank';source.rel='noopener noreferrer';attribution.append(source);shell.append(attribution);main.append(shell,old);drawRegion(active);document.body.dataset.realmMap='true';old.ontoggle=()=>{document.body.dataset.realmMap=old.open?'legacy':'true';};
}
window.QiyaojiRealm={init,mountMap,center,scan,award,articleTypes,articleYears,belongs,realms,snapshot:()=>structuredClone(state)};
})();
