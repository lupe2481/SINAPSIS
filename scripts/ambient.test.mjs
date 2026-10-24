import assert from 'node:assert/strict';
import {breathing,ambientPoint,demoName} from '../dist/ambient.js';
const a=breathing(0,1280,630),b=breathing(2500,1280,630);
assert.notDeepEqual(ambientPoint(900,400,a),ambientPoint(900,400,b));
assert.deepEqual(breathing(2500,1280,630,true),{a:1,d:1,x:0,y:0});
for(let t=0;t<60000;t+=100){const m=breathing(t,1280,630);assert.ok(Math.abs(m.a-1)<=.0141&&Math.abs(m.d-1)<=.0121)}
assert.equal(demoName(156),demoName(156));assert.notEqual(demoName(156),demoName(157));
console.log('PASS: bounded planar motion, aligned coordinates, reduced motion and stable demonstration names.');
