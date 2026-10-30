'use strict';
const { parseManifest, reconcile, csvCell, syncReports } = PortfolioLab;
const byId = id => document.getElementById(id);
const labels = { matched: 'مطابقة', variance: 'فرق وزن', missing: 'لم تصل', unexpected: 'غير متوقعة', duplicate: 'سجل مكرر', queued: 'بانتظار الإرسال', retry: 'إعادة المحاولة', synced: 'تمت المزامنة — محاكاة' };
let report = [];
function setStatus(id, message, error = false) {
  const element = byId(id);
  element.textContent = message;
  element.classList.toggle('error', error);
}
function loadSample() {
  byId('expected-data').value = 'shipment_id,weight_kg\nBSR-101,120\nBSR-102,85\nBSR-103,210\nBSR-104,60\nBSR-105,145\nBSR-106,95';
  byId('received-data').value = 'shipment_id,weight_kg\nBSR-101,119\nBSR-102,79\nBSR-103,210\nBSR-104,60\nBSR-104,60\nBSR-106,97\nBSR-999,40';
  byId('tolerance').value = '2';
  report = [];
  byId('reconcile-results').hidden = true;
  byId('export-report').disabled = true;
  setStatus('reconcile-status', 'المثال جاهز للتحليل.');
}
function addText(parent, tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  parent.append(element);
  return element;
}
byId('load-sample').addEventListener('click', loadSample);
byId('reconcile-form').addEventListener('submit', event => {
  event.preventDefault();
  try {
    report = reconcile(parseManifest(byId('expected-data').value), parseManifest(byId('received-data').value), Number(byId('tolerance').value));
    const rows = byId('report-rows');
    rows.replaceChildren();
    report.forEach(item => {
      const row = document.createElement('tr');
      [item.id, item.expected ?? '—', item.received ?? '—', item.delta ?? '—'].forEach(value => addText(row, 'td', value));
      addText(addText(row, 'td', ''), 'span', labels[item.status], `pill ${item.status}`);
      rows.append(row);
    });
    const matched = report.filter(item => item.status === 'matched').length;
    const metrics = byId('reconcile-metrics');
    metrics.replaceChildren();
    [[report.length, 'أرقام شحنات فريدة'], [matched, 'ضمن السماحية'], [report.length - matched, 'تحتاج مراجعة'], [report.filter(item => item.status === 'duplicate').length, 'أرقام مكررة']].forEach(([value, label]) => {
      const box = addText(metrics, 'div', '', 'metric');
      addText(box, 'b', value); addText(box, 'span', label);
    });
    byId('reconcile-results').hidden = false;
    byId('export-report').disabled = false;
    setStatus('reconcile-status', `اكتمل التحليل: ${report.length - matched} حالات تحتاج مراجعة.`);
  } catch (error) {
    report = [];
    byId('reconcile-results').hidden = true;
    byId('export-report').disabled = true;
    setStatus('reconcile-status', error.message, true);
  }
});
// A changed input invalidates the previous export until it is analysed again.
['expected-data', 'received-data', 'tolerance'].forEach(id => byId(id).addEventListener('input', () => {
  report = [];
  byId('export-report').disabled = true;
  byId('reconcile-results').hidden = true;
  setStatus('reconcile-status', 'تغيّرت البيانات؛ حلّل المطابقة لتحديث التقرير.');
}));
byId('export-report').addEventListener('click', () => {
  if (!report.length) return;
  const rows = [['shipment_id', 'expected_kg', 'received_kg', 'difference_kg', 'status'], ...report.map(item => [item.id, item.expected, item.received, item.delta, item.status])];
  const blob = new Blob(['\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob), anchor = document.createElement('a');
  anchor.href = url; anchor.download = 'shipment-reconciliation.csv'; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
loadSample();

const storageKey = 'abathr-field-lab-v1';
let inspections = [];
let persistent = true;
try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (!Array.isArray(stored) || stored.length > 100 || !stored.every(item => item && typeof item.id === 'string' && typeof item.equipment === 'string' && typeof item.note === 'string' && item.note.length <= 400 && ['queued', 'retry', 'synced'].includes(item.status) && ['pass', 'maintenance'].includes(item.outcome) && Number.isFinite(item.created))) throw new Error('Invalid local data');
  inspections = stored;
} catch {
  persistent = false;
  setStatus('queue-status', 'التخزين المحلي غير متاح أو البيانات السابقة غير صالحة. العمل الحالي يبقى لهذه الجلسة فقط؛ امسح بيانات النموذج لإعادة المحاولة.', true);
}
function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify(inspections)); persistent = true; }
  catch { persistent = false; }
}
function renderQueue() {
  const list = byId('queue-list');
  list.replaceChildren();
  byId('queue-count').textContent = `${inspections.length} تقارير`;
  byId('sync-queue').disabled = !inspections.some(item => item.status !== 'synced');
  if (!inspections.length) addText(list, 'li', 'لا توجد تقارير بعد. أكمل الفحص وأضف أول تقرير.', 'hint');
  [...inspections].reverse().forEach(item => {
    const entry = addText(list, 'li', '', 'queue-item');
    const heading = addText(entry, 'div', '');
    addText(heading, 'b', item.equipment);
    addText(heading, 'span', labels[item.status], `pill ${item.status}`);
    addText(entry, 'p', `${item.outcome === 'pass' ? 'جاهزة للتشغيل' : 'تحتاج صيانة'} · ${item.note}`);
    addText(entry, 'small', `${item.id} / ${new Date(item.created).toLocaleString('ar-IQ')}`);
  });
}
byId('inspection-form').addEventListener('submit', event => {
  event.preventDefault();
  const note = byId('inspection-note').value.trim();
  if (!note) { setStatus('queue-status', 'اكتب ملاحظات الفحص أولاً.', true); return; }
  if (inspections.length >= 100) { setStatus('queue-status', 'وصل النموذج إلى حد 100 تقرير. امسح بيانات النموذج لبدء تجربة جديدة.', true); return; }
  inspections.push({ id: crypto.randomUUID(), equipment: byId('equipment').value, note, outcome: byId('outcome').value, created: Date.now(), status: 'queued' });
  persist(); renderQueue(); event.target.reset();
  setStatus('queue-status', persistent ? 'حُفظ التقرير محلياً. يبقى بعد إعادة تحميل الصفحة.' : 'أُضيف التقرير للجلسة فقط؛ التخزين المحلي غير متاح.', !persistent);
});
byId('sync-queue').addEventListener('click', () => {
  if (!byId('simulated-online').checked) { setStatus('queue-status', 'الاتصال التجريبي متوقف. التقارير محفوظة وتنتظر إعادة المحاولة.'); return; }
  const result = syncReports(inspections, true, byId('fail-next').checked);
  inspections = result.reports;
  byId('fail-next').checked = false;
  persist(); renderQueue();
  setStatus('queue-status', (result.failed ? 'فشلت محاولة واحدة بالمحاكاة. أعد المزامنة بنفس معرّف التقرير.' : 'اكتملت المزامنة التجريبية. لم تُرسل أي بيانات إلى خادم.') + (persistent ? '' : ' تنبيه: الحفظ لهذه الجلسة فقط.'), result.failed || !persistent);
});
byId('reset-queue').addEventListener('click', () => {
  if (!window.confirm('مسح تقارير هذا النموذج من هذا الجهاز؟')) return;
  inspections = []; persist(); renderQueue();
  setStatus('queue-status', persistent ? 'مُسحت بيانات النموذج.' : 'مُسحت بيانات الجلسة. التخزين المحلي غير متاح.', !persistent);
});
renderQueue();
