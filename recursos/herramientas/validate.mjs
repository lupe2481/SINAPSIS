import fs from 'node:fs';
import assert from 'node:assert/strict';
const d=JSON.parse(fs.readFileSync(new URL('../data.json',import.meta.url),'utf8'));
const totals=[428,648,769,925,972,975,1022,985,853,858,736,518];
assert.equal(d.states.length,32);assert.equal(new Set(d.states.map(s=>s.id)).size,32);
let sum=0;
for(const [i,total] of totals.entries()){const y=d.years[2015+i];assert.equal(y.total,total);assert.equal(Object.keys(y.states).length,32);assert.equal(Object.values(y.states).reduce((a,b)=>a+b,0),total);assert.ok(Object.values(y.states).every(n=>Number.isInteger(n)&&n>=0));assert.ok(y.perception>=0&&y.perception<=100);sum+=total}
assert.equal(sum,9689);assert.equal(d.years[2026].states[25],97);assert.equal(d.years[2026].states[19],13);assert.equal(d.years[2025].perception,79.4);assert.equal(d.years[2026].perception,77.4);
console.log('PASS: 32 entidades, 12 años, totales reconciliados, corte parcial y porcentajes válidos.');
