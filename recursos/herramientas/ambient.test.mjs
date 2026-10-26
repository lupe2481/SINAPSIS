import assert from 'node:assert/strict';
import {breathing,ambientPoint,fiberWave} from '../js/ambient.js';
const a=breathing(0,1280,630),b=breathing(2500,1280,630);
assert.notDeepEqual(ambientPoint(900,400,a),ambientPoint(900,400,b));
assert.deepEqual(breathing(2500,1280,630,true),{a:1,d:1,x:0,y:0});
for(let t=0;t<60000;t+=100){const m=breathing(t,1280,630);assert.ok(Math.abs(m.a-1)<=.0141&&Math.abs(m.d-1)<=.0121)}
console.log('PASS: bounded planar motion, aligned coordinates, reduced motion.');

assert.equal(fiberWave(300,2000,630,true),0);
assert.notEqual(fiberWave(300,0,630),fiberWave(300,2000,630));
for(let t=0;t<10000;t+=100)for(let y=0;y<630;y+=2){assert.ok(Math.abs(fiberWave(y,t,630))<=16);assert.ok(Math.abs(fiberWave(y+2,t,630)-fiberWave(y,t,630))<.6)}
console.log('PASS: continuous bounded fiber deformation and reduced-motion bypass.');
