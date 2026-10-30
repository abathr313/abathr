(function(root) {
  'use strict';
  const integer = (value, name, min, max) => {
    if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${name}: أدخل عدداً صحيحاً بين ${min} و${max}.`);
    return value;
  };
  function parseLogs(text) {
    const lines = text.trim().split(/\r?\n/).filter(line => line.trim());
    if (!text.trim() || lines.length > 1000) throw new Error('أدخل من 1 إلى 1000 سطر سجل.');
    const entries = [], rejected = [];
    lines.forEach((line, index) => {
      const match = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)\s+(INFO|WARN|ERROR)\s+([A-Za-z0-9_-]{1,40})\s+(.{1,500})$/);
      if (!match || !Number.isFinite(Date.parse(match[1])) || new Date(match[1]).toISOString().slice(0,19) + 'Z' !== match[1]) rejected.push(index + 1);
      else entries.push({ timestamp: match[1], level: match[2], service: match[3], message: match[4] });
    });
    const groups = new Map();
    entries.filter(entry => entry.level === 'ERROR').forEach(entry => {
      const key = `${entry.service}: ${entry.message}`;
      groups.set(key, (groups.get(key) || 0) + 1);
    });
    return { entries, rejected, counts: Object.fromEntries(['INFO','WARN','ERROR'].map(level => [level, entries.filter(entry => entry.level === level).length])), errors: [...groups].sort((a,b) => b[1]-a[1]) };
  }
  function ipToNumber(ip) {
    const parts = ip.split('.');
    if (parts.length !== 4 || !parts.every(part => /^(0|[1-9]\d{0,2})$/.test(part) && Number(part) <= 255)) throw new Error('عنوان IPv4 غير صالح.');
    return parts.reduce((value, part) => value * 256 + Number(part), 0);
  }
  function numberToIp(value) { return [24,16,8,0].map(shift => Math.floor(value / 2**shift) % 256).join('.'); }
  function subnetPlan(cidr, requests) {
    const parts = cidr.trim().split('/');
    if (parts.length !== 2 || !/^\d{1,2}$/.test(parts[1])) throw new Error('اكتب عنوان الشبكة بصيغة IPv4/CIDR.');
    const address = ipToNumber(parts[0]), prefix = integer(Number(parts[1]), 'قناع الشبكة', 8, 30);
    const block = 2**(32-prefix), base = Math.floor(address/block)*block;
    if (address !== base) throw new Error(`استخدم عنوان الشبكة: ${numberToIp(base)}/${prefix}`);
    if (!Array.isArray(requests) || !requests.length || requests.length > 30) throw new Error('أدخل من 1 إلى 30 قسماً.');
    let cursor = base;
    const result = [...requests].map(request => {
      if (!request.name.trim() || request.name.length > 50) throw new Error('اسم القسم مطلوب وبحد 50 حرفاً.');
      const hosts = integer(request.hosts, 'عدد الأجهزة', 1, 1000000);
      return {...request, size: 2**Math.ceil(Math.log2(hosts+2))};
    }).sort((a,b)=>b.size-a.size).map(request=>{
      cursor = Math.ceil(cursor/request.size)*request.size;
      if (cursor + request.size > base + block) throw new Error('مساحة الشبكة لا تكفي للأقسام المطلوبة. وسّع الشبكة أو قلّل الأجهزة.');
      const network = cursor; cursor += request.size;
      return {name:request.name, hosts:request.hosts, cidr:`${numberToIp(network)}/${32-Math.log2(request.size)}`, first:numberToIp(network+1), last:numberToIp(network+request.size-2), broadcast:numberToIp(network+request.size-1), capacity:request.size-2};
    });
    return { result, used: cursor-base, total:block };
  }
  function allocateStock(lots, demand, today) {
    integer(demand, 'كمية الطلب', 1, 1000000);
    const date = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
    if (!date(today)) throw new Error('تاريخ المرجع غير صالح.');
    if (!lots.length || lots.length > 500) throw new Error('أدخل من 1 إلى 500 دفعة.');
    const ids = new Set();
    lots.forEach(lot => {
      if (!/^[A-Za-z0-9_-]{1,40}$/.test(lot.id) || ids.has(lot.id)) throw new Error('أرقام الدفعات مطلوبة وفريدة.');
      ids.add(lot.id); integer(lot.quantity, 'كمية الدفعة', 0, 1000000);
      if (!date(lot.expiry)) throw new Error(`تاريخ الدفعة ${lot.id} غير صالح.`);
    });
    const excluded = lots.filter(lot => lot.expiry <= today);
    let remaining = demand;
    const allocations = lots.filter(lot=>lot.expiry>today).sort((a,b)=>a.expiry.localeCompare(b.expiry)||a.id.localeCompare(b.id)).map(lot=>{
      const allocated = Math.min(remaining,lot.quantity); remaining -= allocated;
      return {...lot, allocated, balance:lot.quantity-allocated};
    });
    return {allocations, excluded, shortage:remaining, fulfilled:demand-remaining};
  }
  function campaignPacing({budget,spend,totalDays,elapsedDays,impressions,clicks,conversions}) {
    if (!Number.isFinite(budget) || budget <= 0 || budget > 1e9 || !Number.isFinite(spend) || spend < 0 || spend > 1e9) throw new Error('راجع الميزانية والإنفاق.');
    integer(totalDays,'مدة الحملة',1,366); integer(elapsedDays,'الأيام المنقضية',0,totalDays);
    [impressions,clicks,conversions].forEach(value=>integer(value,'مؤشرات الحملة',0,1e9));
    if (clicks>impressions || conversions>clicks) throw new Error('التحويلات لا تتجاوز النقرات، والنقرات لا تتجاوز مرات الظهور في هذا النموذج.');
    const remainingDays=totalDays-elapsedDays, remainingBudget=Math.max(0,budget-spend);
    return {remainingDays,remainingBudget,dailyTarget:remainingDays ? remainingBudget/remainingDays : null, expectedSpend:budget*elapsedDays/totalDays, pace:elapsedDays ? spend/(budget*elapsedDays/totalDays) : null, ctr:impressions ? clicks/impressions*100 : null, cpc:clicks ? spend/clicks : null, cpa:conversions ? spend/conversions : null, overspend:Math.max(0,spend-budget)};
  }
  const api={parseLogs,ipToNumber,numberToIp,subnetPlan,allocateStock,campaignPacing};
  if(typeof module!=='undefined' && module.exports) module.exports=api; else root.CertificateSystems=api;
})(typeof window!=='undefined'?window:globalThis);
