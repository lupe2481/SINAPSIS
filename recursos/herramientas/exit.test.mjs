import assert from 'node:assert/strict';
import {enterParticles,stepParticles,recordEntry,makeExit,stepExit} from '../js/motion.js';
const p={id:12,year:2025,jitter:.4,x:200,y:200,tx:200,ty:200,r:4,vx:0,vy:0};
enterParticles([p],new Set(),{animate:true,preserve:false,width:1280,height:720});
const origin=[p.x,p.y];
for(let n=180;n>0;n--){stepParticles([p],n);recordEntry([p]);}
p.x=p.tx;p.y=p.ty;
const before=structuredClone(p),exit=makeExit(p,1280,720);
assert.deepEqual([exit.x,exit.y],[200,200]);
assert.notEqual(exit.path,p.entryPath);
assert.deepEqual(exit.path.slice(0,2),origin);
assert.equal(stepExit(exit,1000),true);
assert.ok(exit.opacity>0);
assert.notDeepEqual([exit.x,exit.y],[200,200]);
assert.deepEqual(p,before,'Exiting clones must not mutate retained source records');
assert.equal(stepExit(exit,10000),false);
assert.deepEqual([exit.x,exit.y],origin);
assert.equal(exit.opacity,0);
const fallback=makeExit({...p,entryPath:[]},1280,720);
for(let i=0;i<200;i++){stepExit(fallback,16.67);assert.ok(Number.isFinite(fallback.x)&&Number.isFinite(fallback.y));}
assert.equal(fallback.opacity,0);
console.log('PASS: reverse collision history, visible intermediate exit, source isolation, fallback, completion.');
