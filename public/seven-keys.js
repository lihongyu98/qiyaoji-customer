/* Evidence-first candidate retrieval. No network, no generated claims. */
(function (root) {
  'use strict';
  const definitions = [
    ['靶子','问题与目标','研究对象、任务、痛点与成功标准；与前人的差异写在坐标。',/challenge|problem|aim\b|address|研究问题|挑战|旨在|解决/i],
    ['坐标','前人与研究缺口','最接近的已有工作、尚未解决的缺口与本文差异；不是分类标签。',/previous|prior work|existing|unlike|compared|现有|已有|相关工作|不同于/i],
    ['主张','贡献与主张','作者声称的新方法、发现或资源；主张不等于已被实验充分证实。',/we (?:propose|introduce|present|develop)|our (?:contribution|approach)|本文提出|我们提出|贡献/i],
    ['机制','方法机制','输入 → 关键操作 → 输出，以及必要的假设。',/consists? of|architecture|framework|conditioned|mechanism|模块|架构|机制|框架|输入|输出/i],
    ['证据','验证设计与支持程度','哪项实验或论证支持哪条主张？检查基线、消融与控制条件。',/experiment|evaluat|ablation|benchmark|baseline|实验|评估|消融|基线|数据集/i],
    ['数字','结果与比较条件','结果绑定任务、数据集、指标、协议和成本；允许定性结果或不适用。',/(?:\d+(?:\.\d+)?\s*(?:%|percent|times|倍)|(?:accuracy|success rate|准确率|成功率)[^。\n]{0,60}\d)/i],
    ['边界','适用与局限','作者明示的失败、假设、成本与未覆盖场景；读者推测另写。',/limitation|limited to|fails?\b|failure|however|局限|失败|限制|尚未|不足/i]
  ];
  // Stable field IDs preserve older local records and evidence cards.
  const guides={
    '靶子':{question:'它要解决什么问题，怎样才算解决？',fields:[['object','研究对象与任务'],['pain','具体痛点'],['success','成功标准']],example:'在动作条件下预测环境变化；目标是支持有效决策，而不只是画面逼真。',caution:'写研究目标，实验实际取得的结果放到数字。'},
    '坐标':{question:'它站在谁的工作上，补了哪个缺口？',fields:[['prior','最接近的已有工作'],['gap','已有工作的缺口'],['difference','本文与前人的区别']],example:'对比最接近的方法，说明本文改变了状态表征、训练目标还是规划方式。',caution:'世界模型、机器人等是分类标签，不能代替与前人的具体比较。'},
    '主张':{question:'作者具体声称贡献了什么？',fields:[['claim','贡献或主张（可编号C1、C2）'],['novelty','新颖之处'],['qualification','作者限定的主张范围']],example:'C1：提出一种方法；C2：在指定设置下改善某项结果。分别寻找支撑依据。',caution:'保留“作者提出/报告”的语气，避免把作者主张写成普遍事实。'},
    '机制':{question:'输入如何经过关键步骤变成输出？',fields:[['input','输入与数据来源'],['process','关键步骤与模块'],['output','输出与用途'],['objective','训练目标或推导逻辑'],['assumption','假设与资源条件']],example:'输入观察与动作 → 编码状态 → 预测动态 → 用预测辅助规划；再注明训练目标。',caution:'解释模块之间的作用，不只列模型名称；理论论文可填定义、假设与推导。'},
    '证据':{question:'什么实验或论证支持什么主张，支持到什么程度？',fields:[['supports','对应主张编号或内容'],['design','数据、实验或论证设计'],['controls','基线、消融与控制条件'],['strength','支持程度与尚不能证明的部分']],example:'实验E1对照基线B，支持C1在该任务下有效；没有验证跨环境泛化。',caution:'原文摘录是出处，验证设计是论证；有出处不等于论证充分。'},
    '数字':{question:'在什么条件下，得到了什么结果？',fields:[['task','任务与数据集'],['metric','指标、方向与单位'],['result','数值或定性发现'],['baseline','比较对象与基线结果'],['protocol','评价协议与成本'],['uncertainty','波动、重复次数或未报告项']],example:'任务/数据集 + 指标/单位 + 本文结果 + 基线结果 + 相同评价条件；未报告的留空。',caution:'不同数据、预算和协议不能直接排名；无量化实验时可填定性结果或说明不适用。'},
    '边界':{question:'结论在哪些条件下成立，哪里尚未覆盖？',fields:[['scope','适用条件'],['failure','失败或未覆盖场景'],['cost','成本与依赖'],['author_limit','作者明确承认的局限']],example:'作者仅验证仿真环境；真实部署、分布外场景或成本尚未充分评估。',caution:'作者明示局限写在此处，个人推测写到“我的理解与疑问”。'}
  };
  function extract(text, scope) {
    if (typeof text !== 'string' || text.length > 200000) throw new Error('原文最多20万字符');
    const spans = [];
    const segmenter = new Intl.Segmenter('en', {granularity:'sentence'});
    const segments = [];
    for (const paragraph of text.matchAll(/[^\n]+/g)) {
      for (const sentence of segmenter.segment(paragraph[0])) segments.push({0:sentence.segment,index:paragraph.index+sentence.index});
    }
    for (const match of segments) {
      const quote = match[0].trim();
      if (quote.length < 20 || quote.length>4000) continue;
      const start = match.index + match[0].indexOf(quote);
      spans.push({quote, start, end:start + quote.length});
    }
    return definitions.map(([key, title, hint, rule]) => ({
      key, title, hint, scope:['fulltext','excerpts'].includes(scope) ? scope : 'abstract',
      candidates:spans.filter(s => rule.test(s.quote)).slice(0,3),
      status:'unreviewed', summary:''
    }));
  }
  function validate(record) {
    if (!record || typeof record.source_text !== 'string' || record.source_text.length>200000 || !Array.isArray(record.keys) || record.keys.length!==7) throw new Error('证据卡格式无效');
    const metadata=record.source_meta;
    if(metadata&&(!Array.isArray(metadata.pages)||metadata.pages.length>10000||metadata.pages.some(p=>!Number.isInteger(p.page)||p.page<1||!Number.isInteger(p.start)||!Number.isInteger(p.end)||p.start<0||p.end<p.start||p.end>record.source_text.length)))throw new Error('来源页码映射无效');
    if(metadata?.partial===true&&record.keys.some(row=>row.scope!=='excerpts'))throw new Error('部分正文必须标记为节选');
    const seen=new Set();
    for (const row of record.keys) {
      if (!definitions.some(d=>d[0]===row.key) || seen.has(row.key)) throw new Error('七钥字段重复或缺失');
      seen.add(row.key);
      if (!['abstract','fulltext','excerpts'].includes(row.scope) || typeof row.summary!=='string' || row.summary.length>3000 || !['unreviewed','reviewed','insufficient','not_applicable'].includes(row.status) || !Array.isArray(row.candidates) || row.candidates.length>20) throw new Error('字段内容无效');
      if(typeof row.title!=='string'||row.title.length>100||typeof row.hint!=='string'||row.hint.length>1000)throw new Error('字段说明无效');
      for (const e of row.candidates) if (!Number.isInteger(e.start)||!Number.isInteger(e.end)||e.start<0||e.end<=e.start||e.end>record.source_text.length||typeof e.quote!=='string'||e.quote.length>4000||record.source_text.slice(e.start,e.end)!==e.quote||(![true,false,undefined].includes(e.selected))) throw new Error('证据与原文位置不匹配');
      if(row.structure!==undefined&&(!row.structure||typeof row.structure!=='object'||Array.isArray(row.structure)||Object.entries(row.structure).some(([k,v])=>!guides[row.key].fields.some(f=>f[0]===k)||typeof v!=='string'||v.length>1500)))throw new Error('精读子项格式无效');
      if(row.reader_note!==undefined&&(typeof row.reader_note!=='string'||row.reader_note.length>3000))throw new Error('个人理解格式无效');
      if(row.status==='reviewed'&&(!row.summary.trim()||!row.candidates.some(c=>c.selected===true))) throw new Error('已确认结论缺少依据');
      if(row.status==='not_applicable'&&!row.summary.trim()) throw new Error('不适用项缺少原因');
    }
    return record;
  }
  const api = {definitions, guides, extract, validate};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SevenKeys = api;
})(typeof window === 'undefined' ? globalThis : window);
