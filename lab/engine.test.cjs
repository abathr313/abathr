const test = require('node:test');
const assert = require('node:assert/strict');
const { parseManifest, reconcile, csvCell, syncReports } = require('./engine.js');
test('reject malformed, negative, empty and oversized manifests', () => {
  ['bad\na,1', 'shipment_id,weight_kg\na,-1', 'shipment_id,weight_kg\na,NaN', 'shipment_id,weight_kg\na,1,2', 'shipment_id,weight_kg\na,', 'shipment_id,weight_kg', 'shipment_id,weight_kg\n' + 'a,1\n'.repeat(501)].forEach(text => assert.throws(() => parseManifest(text)));
  assert.deepEqual(parseManifest('\uFEFFshipment_id,weight_kg\r\nBSR-1,0\r\n'), [{ id: 'BSR-1', weight: 0 }]);
});
test('matches by ID, accepts exact tolerance, flags missing, unexpected and duplicates', () => {
  const result = reconcile([{ id: 'a', weight: 10 }, { id: 'b', weight: 5 }, { id: 'c', weight: 9 }, { id: 'd', weight: 8 }], [{ id: 'c', weight: 6 }, { id: 'a', weight: 12 }, { id: 'd', weight: 8 }, { id: 'd', weight: 8 }, { id: 'e', weight: 4 }], 2);
  assert.deepEqual(result.map(row => row.status), ['matched', 'missing', 'variance', 'duplicate', 'unexpected']);
  assert.equal(result[3].delta, null);
  assert.equal(result[3].received, null);
  assert.throws(() => reconcile([], [], -1));
});
test('rounding avoids false weight mismatch at tolerance boundary', () => {
  assert.equal(reconcile([{ id: 'x', weight: .1 }], [{ id: 'x', weight: .3 }], .2)[0].status, 'matched');
});
test('duplicate expected IDs do not receive a calculated delta', () => {
  assert.equal(reconcile([{ id: 'x', weight: 3 }, { id: 'x', weight: 3 }], [{ id: 'x', weight: 3 }], 0)[0].delta, null);
});
test('CSV export neutralizes spreadsheet formulas and escapes quotes', () => {
  assert.equal(csvCell('=SUM(A1)'), '"\'=SUM(A1)"');
  assert.equal(csvCell('a"b'), '"a""b"');
});
test('offline preserves queue, failed retry preserves ID and synced reports are not resent', () => {
  const reports = [{ id: '1', status: 'queued' }, { id: '2', status: 'queued' }];
  assert.deepEqual(syncReports(reports, false, true).reports, reports);
  const first = syncReports(reports, true, true);
  assert.deepEqual(first.reports.map(row => row.status), ['retry', 'synced']);
  const second = syncReports(first.reports, true, false);
  assert.deepEqual(second.reports.map(row => row.id), ['1', '2']);
  assert.deepEqual(second.reports.map(row => row.status), ['synced', 'synced']);
  assert.equal(second.reports[1], first.reports[1]);
});
