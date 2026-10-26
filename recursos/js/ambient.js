// A planar breathing motion shared by fibers, nodes and interaction targets.
export function breathing(time,w,h,reduced=false){
 if(reduced)return {a:1,d:1,x:0,y:0};
 const a=1+Math.sin(time*.00085)*.014,d=1+Math.sin(time*.00105+.6)*.012;
 return {a,d,x:w*.58*(1-a)+Math.sin(time*.00056)*5,y:h*.48*(1-d)+Math.sin(time*.00073)*7};
}
export function ambientPoint(x,y,m){return {x:x*m.a+m.x,y:y*m.d+m.y}}
// Traveling planar waves bend the baseline branches as well as their nodes.
export function fiberWave(y,time,height,reduced=false){
 if(reduced)return 0;
 const t=time*.001;
 return 11*Math.sin(y/height*8-t*1.35)+5*Math.sin(y/height*15+t*.85);
}
