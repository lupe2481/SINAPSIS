import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {documentedCases} from '../dist/documented.js';
const data=JSON.parse(readFileSync(new URL('../dist/data.json',import.meta.url)));
assert.equal(documentedCases.length,5);assert.equal(new Set(documentedCases.map(p=>p.id)).size,5);
for(const p of documentedCases){assert.ok(data.states.some(s=>s.id===p.state));assert.equal(p.year,2016);assert.ok(p.name&&p.municipality&&p.sourceUrl);assert.ok(!/[√�]/.test(p.name))}
const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');assert.ok(!html.includes('<iframe'));assert.ok(!html.includes('id="documented"'));
const js=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');assert.ok(!js.includes('demoName('));
console.log('PASS: five sourced records, valid state/year, no separate maps and no fictional names in tooltips.');
