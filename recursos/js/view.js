// Flat atlas camera. Zoom is anchored to the pointer; panning is bounded.
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function project(x,y,w,h,view){return {x:x*view.scale+view.x,y:y*view.scale+view.y}}
export function boundView(view,w,h){view.x=clamp(view.x,w*(1-view.scale),0);view.y=clamp(view.y,h*(1-view.scale),0)}
export function zoomAt(view,factor,x,y,w,h){
 const scale=clamp(view.scale*factor,1,5),ratio=scale/view.scale;
 view.x=x-(x-view.x)*ratio;view.y=y-(y-view.y)*ratio;view.scale=scale;boundView(view,w,h);
}
export function panBy(view,dx,dy,w,h){view.x+=dx;view.y+=dy;boundView(view,w,h)}
export function stainScore(x,y,cx,cy,w,h){
 const dx=(x-cx)/(w*.5),dy=(y-cy)/(h*.58),angle=Math.atan2(dy,dx);
 return Math.hypot(dx,dy)/(1+.09*Math.sin(angle*5+.7)+.045*Math.sin(angle*9-1.3)+.025*Math.cos(angle*17));
}
