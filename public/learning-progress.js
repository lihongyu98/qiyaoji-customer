(function(root){
  'use strict';
  const fields=['靶子','坐标','主张','机制','证据','数字','边界'];
  function recordAttempt(previous,answer,correct,at=Date.now()){
    const old=previous||{},attempts=Number.isInteger(old.attempts)&&old.attempts>0?old.attempts:0;
    return {attempts:attempts+1,firstCorrect:attempts?old.firstCorrect:correct,correct,answer,at,history:[...(Array.isArray(old.history)?old.history:[]),{answer,correct,at}]};
  }
  function nextSteps(notes={},activity={},review={},now=Date.now()){
    const self=notes.self||{},evidence=notes.researchEvidence||{};
    const written=fields.filter(f=>typeof self[f]==='string'&&self[f].trim());
    const stale=fields.filter(f=>evidence[f]&&(evidence[f].status!=='human_reviewed'||evidence[f].summary!==self[f]));
    const suggestions=[];
    if(stale.length)suggestions.push({kind:'evidence',title:'先重新核对已修改的结论',detail:stale.join('、')+'的当前记录与人工复核版本不一致。'});
    if(typeof review.due==='number'&&review.due<=now)suggestions.push({kind:'review',title:'完成到期复习',detail:'先不看原文复述，再检查遗漏与疑问。'});
    if(!activity.quiz)suggestions.push({kind:'quiz',title:'检查一个关键误解',detail:'先做理解题，再解释你的选择。'});
    else if(!activity.quiz.correct)suggestions.push({kind:'quiz',title:'订正最近一次理解题',detail:'回看反馈与原文，想清楚错误选项为什么不成立。'});
    if(!written.length)suggestions.push({kind:'evidence',title:'先写清研究问题',detail:'从“靶子”开始，用一句话归纳作者目标，并保留一处原文依据。'});
    else if(written.some(f=>!evidence[f]||evidence[f].status!=='human_reviewed'||evidence[f].summary!==self[f]))suggestions.push({kind:'evidence',title:'为已写结论补上依据',detail:'已有笔记尚未全部关联人工复核的原文；可先核对一项。'});
    if(typeof activity.reflection!=='string'||!activity.reflection.trim())suggestions.push({kind:'reflection',title:'用三句话独立复述',detail:'解释问题、方法和适用边界；不确定的地方写成疑问。'});
    if(!review.due)suggestions.push({kind:'schedule',title:'给未来的自己安排复习',detail:'一天后再尝试回忆；这只是本机队列，不发送通知。'});
    if(!suggestions.length)suggestions.push({kind:'compare',title:'对照阅读另一篇论文',detail:'比较方法机制与评价条件；现有记录不代表已长期掌握。'});
    return suggestions.slice(0,3);
  }
  const api={recordAttempt,nextSteps};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.QiyaojiLearning=api;
})(typeof window==='undefined'?globalThis:window);
