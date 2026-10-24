import assert from 'node:assert/strict';
import {project,stainScore,clamp} from '../dist/view.js';
const view={yaw:0,pitch:0,scale:1},w=1280,h=630;
const center=project(w*.58,h*.48,w,h,view,0);
assert.equal(center.x,w*.58);assert.equal(center.y,h*.48);
const a=project(900,300,w,h,view,0),b=project(900,300,w,h,view,3000);
assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>1,'autonomous motion remains visible');
const rotated=project(900,300,w,h,{...view,yaw:.6,pitch:.3},0);
assert.ok(Math.hypot(a.x-rotated.x,a.y-rotated.y)>20,'drag produces depth displacement');
for(const yaw of [-.7,0,.7])for(const pitch of [-.42,0,.42])for(let x=0;x<=w;x+=80)for(let y=0;y<=h;y+=70){const p=project(x,y,w,h,{yaw,pitch,scale:2.2},10000);assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y))}
assert.equal(stainScore(640,315,640,315,w,h),0);
for(let angle=0;angle<Math.PI*2;angle+=.1){let last=-1;for(let r=0;r<=600;r+=20){const score=stainScore(640+Math.cos(angle)*r,315+Math.sin(angle)*r,640,315,w,h);assert.ok(score>last,'stain grows outward continuously');last=score}}
assert.equal(clamp(9,-.7,.7),.7);
console.log('PASS: centered projection, organic movement, depth rotation, finite extreme views and outward stain propagation.');
