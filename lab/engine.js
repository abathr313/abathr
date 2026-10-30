/* Pure data operations shared by the interactive examples and their tests. */
(function (root) {
  'use strict';
  function parseManifest(text) {
    const lines = text.replace(/^\uFEFF/, '').trim().split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2 || lines.length > 501) throw new Error('أدخل من 1 إلى 500 سجل تحت عناوين الأعمدة.');
    if (lines[0].trim() !== 'shipment_id,weight_kg') throw new Error('العناوين المطلوبة: shipment_id,weight_kg');
    return lines.slice(1).map((line, index) => {
      const parts = line.split(',').map(value => value.trim());
      if (parts.length !== 2 || !/^[A-Za-z0-9_-]{1,40}$/.test(parts[0]) || !/^\d+(\.\d+)?$/.test(parts[1])) {
        throw new Error(`راجع السطر ${index + 2}: رقم شحنة إنكليزي وأرقام وزن موجبة أو صفر، مفصولة بفاصلة.`);
      }
      const weight = Number(parts[1]);
      if (!Number.isFinite(weight) || weight > 1000000) throw new Error(`الوزن في السطر ${index + 2} خارج الحدود.`);
      return { id: parts[0], weight };
    });
  }
  function reconcile(expected, received, tolerance) {
    if (!Number.isFinite(tolerance) || tolerance < 0) throw new Error('السماحية يجب أن تكون رقماً موجباً أو صفراً.');
    const group = rows => rows.reduce((map, row) => map.set(row.id, [...(map.get(row.id) || []), row.weight]), new Map());
    const source = group(expected), destination = group(received);
    return [...new Set([...source.keys(), ...destination.keys()])].map(id => {
      const a = source.get(id) || [], b = destination.get(id) || [];
      const duplicate = a.length > 1 || b.length > 1;
      const delta = !duplicate && a.length && b.length ? Math.round((b[0] - a[0]) * 1000) / 1000 : null;
      const status = duplicate ? 'duplicate' : !a.length ? 'unexpected' : !b.length ? 'missing' : Math.abs(delta) > tolerance ? 'variance' : 'matched';
      return { id, expected: a.length === 1 ? a[0] : null, received: b.length === 1 ? b[0] : null, delta, status };
    });
  }
  function csvCell(value) {
    const text = String(value ?? '');
    const safe = /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
    return '"' + safe.replace(/"/g, '""') + '"';
  }
  function syncReports(reports, online, failNext) {
    if (!online) return { reports, failed: false };
    let failed = false;
    const updated = reports.map(report => {
      if (report.status === 'synced') return report;
      if (failNext && !failed) { failed = true; return { ...report, status: 'retry' }; }
      return { ...report, status: 'synced' };
    });
    return { reports: updated, failed };
  }
  const api = { parseManifest, reconcile, csvCell, syncReports };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PortfolioLab = api;
})(typeof window !== 'undefined' ? window : globalThis);
