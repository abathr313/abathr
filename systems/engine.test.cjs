const test=require('node:test'),assert=require('node:assert/strict');
const {parseLogs,subnetPlan,allocateStock,campaignPacing}=require('./engine.js');
test('logs validate dates, reject malformed rows and group repeated errors',()=>{
 const r=parseLogs('2026-10-30T08:00:00Z ERROR api Timeout\n2026-10-30T08:01:00Z ERROR api Timeout\n2026-02-30T08:00:00Z INFO api Bad date\ninvalid');
 assert.equal(r.counts.ERROR,2);assert.deepEqual(r.rejected,[3,4]);assert.equal(r.errors[0][1],2);assert.throws(()=>parseLogs(''));
});
test('VLSM allocates aligned, nonoverlapping blocks and rejects overcapacity',()=>{
 const r=subnetPlan('192.168.10.0/24',[{name:'A',hosts:50},{name:'B',hosts:25},{name:'C',hosts:12}]);
 assert.deepEqual(r.result.map(x=>x.cidr),['192.168.10.0/26','192.168.10.64/27','192.168.10.96/28']);
 assert.equal(r.result[0].broadcast,'192.168.10.63');assert.equal(r.used,112);
 assert.throws(()=>subnetPlan('192.168.10.1/24',[{name:'A',hosts:2}]));
 assert.throws(()=>subnetPlan('192.168.10.0/24',[{name:'A',hosts:300}]));
 assert.throws(()=>subnetPlan('999.1.1.0/24',[{name:'A',hosts:2}]));
});
test('FEFO sorts by expiry, excludes same-day and expired batches and preserves input',()=>{
 const lots=[{id:'A',expiry:'2027-01-01',quantity:40},{id:'B',expiry:'2026-11-01',quantity:20},{id:'C',expiry:'2026-10-30',quantity:12}];
 const r=allocateStock(lots,65,'2026-10-30');assert.deepEqual(r.allocations.map(x=>x.allocated),[20,40]);assert.equal(r.shortage,5);assert.equal(r.excluded.length,1);assert.equal(lots[0].quantity,40);
 assert.throws(()=>allocateStock([...lots,lots[0]],2,'2026-10-30'));
 assert.throws(()=>allocateStock([{id:'X',expiry:'2026-02-30',quantity:1}],1,'2026-10-30'));
});
test('campaign calculations handle overspend, end dates and zero denominators',()=>{
 const base={budget:6000,spend:2800,totalDays:30,elapsedDays:10,impressions:500000,clicks:3500,conversions:70};
 const r=campaignPacing(base);assert.equal(r.dailyTarget,160);assert.equal(r.cpa,40);assert.equal(r.pace,1.4);
 const end=campaignPacing({...base,spend:7000,elapsedDays:30,impressions:0,clicks:0,conversions:0});assert.equal(end.dailyTarget,null);assert.equal(end.overspend,1000);assert.equal(end.ctr,null);assert.equal(end.cpa,null);
 assert.throws(()=>campaignPacing({...base,elapsedDays:31}));assert.throws(()=>campaignPacing({...base,conversions:4000}));
});
