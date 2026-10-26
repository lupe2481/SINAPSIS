import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {documentedCases} from '../js/documented.js';
const data=JSON.parse(readFileSync(new URL('../data.json',import.meta.url)));
assert.equal(documentedCases.length,5);assert.equal(new Set(documentedCases.map(p=>p.id)).size,5);
for(const p of documentedCases){assert.ok(data.states.some(s=>s.id===p.state));assert.equal(p.year,2016);assert.ok(p.name&&p.municipality&&p.sourceUrl);assert.ok(!/[√�]/.test(p.name))}
const html=readFileSync(new URL('../../experiencia.html',import.meta.url),'utf8');assert.ok(!html.includes('<iframe'));assert.ok(!html.includes('id="documented"'));
const js=readFileSync(new URL('../../main.js',import.meta.url),'utf8');assert.ok(js.includes('Nombre ficticio · prueba'));
console.log('PASS: five sourced records, valid state/year, no separate maps and clearly marked presentation aliases.');
