import assert from 'node:assert/strict';
import {createHandState,resetHandYear,readHand} from '../dist/hand-state.js';
const s=createHandState();
const gesture=(name,hand=true)=>{let action;for(let i=0;i<3;i++)action=readHand(s,name,hand);return action};
for(let year=2015;year<=2026;year++){
 gesture('Closed_Fist');resetHandYear(s);
 assert.equal(gesture('Open_Palm').visible,true,`Palm after fist in ${year}`);
 resetHandYear(s);assert.equal(gesture('Open_Palm').visible,false,'Held palm must not carry over');
 assert.equal(gesture('',false).visible,false);
 assert.equal(gesture('Open_Palm').visible,true,`Reintroduced hand in ${year}`);
 assert.equal(gesture('Closed_Fist').visible,false);
}
const fresh=createHandState();assert.equal(readHand(fresh,'Open_Palm'),null);assert.equal(readHand(fresh,'Open_Palm'),null);assert.equal(readHand(fresh,'Open_Palm').visible,true);
console.log('PASS: 12 years, fist/palm, held-palm reset, hand removal recovery and debouncing.');
