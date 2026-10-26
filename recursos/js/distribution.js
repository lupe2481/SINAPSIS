// Stable positions shared by every year: adding records never moves older ones.
export function distributeRecords(records, fibers){
 const grid=new Map(),cell=.012;
 const ordered=[...records].sort((a,b)=>a.year-b.year||a.jitter-b.jitter||a.id-b.id);
 for(const p of ordered){
  let best=null,bestDistance=-1;
  for(let candidate=0;candidate<24;candidate++){
   const sample=fibers[(p.id*7919+candidate*104729)%fibers.length];
   const x=Math.max(.018,Math.min(.982,sample.x+(p.jitter-.5)*.008));
   const y=Math.max(.018,Math.min(.982,sample.y+Math.sin(p.id+candidate)*.004));
   const gx=Math.floor(x/cell),gy=Math.floor(y/cell);let distance=cell*cell*4;
   for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++){
    for(const q of grid.get(`${gx+dx},${gy+dy}`)||[]){const d=(x-q.x)**2+(y-q.y)**2;distance=Math.min(distance,d)}
   }
   if(distance>bestDistance){bestDistance=distance;best={x,y}}
  }
  p.nx=p.sx=p.ox=best.x;p.ny=p.sy=p.oy=best.y;
  const key=`${Math.floor(best.x/cell)},${Math.floor(best.y/cell)}`;
  if(!grid.has(key))grid.set(key,[]);grid.get(key).push(best);
 }
}
// Reserve room for breathing, wave displacement and the bottom controls.
export function tissueRect(width,height){
 const margin=width<=700?28:36;
 return {x:margin,y:26,w:Math.max(1,width-margin*2),h:Math.max(1,height-152)};
}
