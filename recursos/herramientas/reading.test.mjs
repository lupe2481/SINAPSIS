import assert from 'node:assert/strict';
import {demoName,advanceMotionClock} from '../js/demo-names.js';
assert.equal(new Set(Array.from({length:9689},(_,i)=>demoName(i))).size,9689);
assert.equal(demoName(123),demoName(123));
assert.equal(advanceMotionClock(100,100,false,false),120);
assert.equal(advanceMotionClock(100,100,false,true),100);
assert.equal(advanceMotionClock(100,100,true,false),100);
console.log('PASS: stable unique test names, 80% slower tissue, frozen selection and pause.');
