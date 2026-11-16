/* 摘要体验模式：服务端保管模型密钥，反馈不写入全文核验结论。 */
(function () {
  G.runVerify = async function (pid, field) {
    var slot = document.getElementById('vrm-' + pid + '-' + field);
    if (!slot || slot.dataset.busy) return;
    var answer = (G.ps(pid).self || {})[field];
    if (!answer) { slot.textContent = '请先填写并保存答案。'; return; }
    if (!confirm('AI核对会把这篇论文的公开摘要、所选字段和你的答案发送给OpenRouter及其模型提供商。请勿提交未公开研究或敏感信息。是否继续？')) return;
    slot.dataset.busy = '1';
    slot.textContent = '正在依据公开摘要核对，请稍候…';
    try {
      var response = await fetch('/api/verify', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        signal: AbortSignal.timeout(65000),
        body: JSON.stringify({pid: pid, field: field, answer: answer})
      });
      var result = await response.json();
      if (!response.ok) throw new Error(result.error || '暂时无法核对');
      slot.style.whiteSpace = 'pre-wrap';
      slot.textContent = 'AI 摘要核对 · 仅供参考，未核验全文\n\n' + result.feedback;
    } catch (error) {
      slot.textContent = error.message || '服务暂不可用，请稍后再试';
    } finally { delete slot.dataset.busy; }
  };
})();
