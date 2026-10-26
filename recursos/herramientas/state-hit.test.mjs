import assert from 'node:assert/strict';
import {stateAtPosition} from '../js/state-hit.js';
for(const [w,h] of [[1280,630],[1920,990],[834,450]]){
 for(let id=1;id<=32;id++){
  const col=(id-1)%8,row=Math.floor((id-1)/8),x=w*.29+(col+.5)*w*.083;
  assert.equal(stateAtPosition(x,h*.15+(row+.5)*h*.155,w,h),id);
  assert.equal(stateAtPosition(x,h*.15+(row+1)*h*.155-2,w,h),id,'The name must open its own state');
 }
 assert.equal(stateAtPosition(0,h/2,w,h),null);
 assert.equal(stateAtPosition(w,h,w,h),null);
}
console.log('PASS: all 32 grouping centers and labels, including Baja California Sur, at 3 sizes; outside clicks ignored.');
