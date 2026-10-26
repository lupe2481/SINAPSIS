// Contain the entire atlas with room for statistics, footer and ambient motion.
export function nationalRect(width,height){
 const left=width>1000?320:width>700?270:Math.min(190,width*.36);
 const right=32,top=58,bottom=110,ratio=1894.97/2675.91;
 const availableWidth=Math.max(40,width-left-right),availableHeight=Math.max(40,height-top-bottom);
 const w=Math.min(availableWidth,availableHeight/ratio),h=w*ratio;
 return {x:left,y:top+(availableHeight-h)/2,w,h};
}
