// Debounced gestures; changing year only blocks a palm that is still held open.
export function createHandState(){return {last:'',frames:0,heldPalm:false,waiting:false}}
export function resetHandYear(state){state.waiting=state.heldPalm;state.last='';state.frames=0}
export function readHand(state,name,hasHand=true){
 const gesture=hasHand?name:'Absent';
 state.frames=gesture===state.last?state.frames+1:1;state.last=gesture;
 if(state.frames<3)return null;
 if(gesture==='Absent'){state.heldPalm=false;state.waiting=false;return null}
 if(gesture==='Closed_Fist'){
  state.heldPalm=false;state.waiting=false;
  return {visible:false,status:'Puño cerrado · capa oculta'};
 }
 if(gesture==='Open_Palm'){
  state.heldPalm=true;
  return state.waiting?{visible:false,status:'Cierra el puño o retira la mano; después muestra la palma.'}:{visible:true,status:'Palma abierta · percepción visible'};
 }
 return null;
}
