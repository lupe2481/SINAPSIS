import {areaThreshold} from './recursos/js/stain-area.js';
import {createHandState,resetHandYear,readHand} from './recursos/js/hand-state.js?v=hold';
import {stateAtPosition} from './recursos/js/state-hit.js';
import {demoName,advanceMotionClock} from './recursos/js/demo-names.js';
import {documentedCases} from './recursos/js/documented.js';
import {breathing, ambientPoint, fiberWave} from './recursos/js/ambient.js';
import {project, zoomAt, panBy, boundView, clamp, stainScore} from './recursos/js/view.js';
import {grayForYear, enterParticles, stepParticles, recordEntry, makeExit, stepExit} from './recursos/js/motion.js';
const $=s=>document.querySelector(s), fmt=n=>n.toLocaleString('es-MX');
let data;
try{const response=await fetch('./recursos/data.json');if(!response.ok)throw Error();data=await response.json()}catch(e){$('#loading').textContent='No se pudieron cargar los datos. Recarga la página.';throw e}
const neuralImage=new Image();neuralImage.src='./recursos/assets/neuronal-reference.svg';await neuralImage.decode();
const mask=document.createElement('canvas');mask.width=1800;mask.height=1275;const maskCtx=mask.getContext('2d',{willReadFrequently:true});maskCtx.drawImage(neuralImage,0,0,mask.width,mask.height);const pixels=maskCtx.getImageData(0,0,mask.width,mask.height).data;const fibers=[],fiberGroups=Array.from({length:32},()=>[]);
for(let y=2;y<mask.height-2;y+=3)for(let x=2;x<mask.width-2;x+=3){if(pixels[(y*mask.width+x)*4+3]>100){const pt={x:x/mask.width,y:y/mask.height};fibers.push(pt);const col=Math.min(7,Math.floor(x/mask.width*8)),row=Math.min(3,Math.floor(y/mask.height*4));fiberGroups[row*8+col].push(pt)}}
const canvas=$('#network'),display=canvas.getContext('2d',{alpha:false}),woven=document.createElement('canvas'),ctx=woven.getContext('2d',{alpha:false});
const view={x:0,y:0,scale:1};let dragging=null,dragged=false;
let ambient={a:1,d:1,x:0,y:0};
const screenPoint=p=>{const q=ambientPoint(p.x,p.y,ambient);const screen=project(q.x,q.y,W,H,view);screen.x+=fiberWave(screen.y,motionClock,H,reduced);return screen};
function resetView(){Object.assign(view,{x:0,y:0,scale:1});canvas.style.cursor='default'}
let onlyYear=false;
let year=2026,mode='national',selected='all',W=0,H=0,dpr=1,zoom=1,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,hover=null,pointer=null,points=[],edges=[],clusters=[],frame=0,settling=0,fear=false,fearProgress=0,keyboardIndex=-1;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let seed=381;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const all=[];let id=0;
for(const state of data.states){seed=state.id*15731;for(let y=2015;y<=2026;y++){for(let i=0;i<data.years[y].states[state.id];i++){const a=rand()*Math.PI*2,r=Math.sqrt(rand());all.push({id:id++,state:state.id,year:y,u:Math.cos(a)*r,v:Math.sin(a)*r,jitter:rand(),x:0,y:0,vx:0,vy:0,tx:0,ty:0,r:1})}}}
for(const [index,record] of documentedCases.entries()){const jitter=((index+1)*.61803398875)%1;all.push({id:100000+index,state:record.state,year:record.year,record,jitter,u:0,v:0,x:0,y:0,vx:0,vy:0,tx:0,ty:0,r:1})}
for(let y=2015;y<=2026;y++){const b=document.createElement('button');b.textContent=y;b.dataset.year=y;b.setAttribute('aria-label',`Año ${y}${y===2026?', enero a septiembre':''}`);b.onclick=()=>changeYear(y);$('#years').append(b)}
const stateCrops=data.states.map((state,i)=>({cx:Math.max(.24,Math.min(.78,(i%8+.5)/8)),cy:Math.max(.28,Math.min(.76,(Math.floor(i/8)+.5)/4))}));
const stateFibers=stateCrops.map(c=>fibers.filter(p=>Math.abs(p.x-c.cx)<.14&&Math.abs(p.y-c.cy)<.15));
for(const p of all){const pool=fiberGroups[p.state-1].length?fiberGroups[p.state-1]:fibers;const a=pool[Math.floor(p.jitter*pool.length)];const local=stateFibers[p.state-1].length?stateFibers[p.state-1]:fibers;const b=local[(p.id*7919)%local.length];p.nx=a.x+(p.jitter-.5)*.004;p.ny=a.y+Math.sin(p.id)*.002;p.sx=b.x+(p.jitter-.5)*.003;p.sy=b.y+Math.sin(p.id)*.002;const overview=fibers[(p.id*7919)%fibers.length];p.ox=overview.x;p.oy=overview.y}

for(const s of data.states){const o=document.createElement('option');o.value=s.id;o.textContent=s.name;$('#state-select').append(o)}
function currentState(){return data.states.find(s=>s.id===Number(selected))}
function accumulated(state){let n=0;for(let y=2015;y<=year;y++)n+=state?data.years[y].states[state]:data.years[y].total;return n}
function updateCohortLegend(){const key=$('#cohort-key');if(!key)return;key.innerHTML='';for(let y=onlyYear?year:2015;y<=year;y++){const item=document.createElement('span'),g=grayForYear(y);item.innerHTML=`<i style="background:rgb(${g},${g},${g})"></i>${y}`;key.append(item)}}
function updateUI(){const state=currentState();$('#year').textContent=year;$('#annual').textContent=fmt(state?data.years[year].states[state.id]:data.years[year].total);$('#annual-label').textContent=year===2026?'víctimas · enero a septiembre':'víctimas registradas en el año';$('#scope').textContent=state?'VISTA ESTATAL':'REPÚBLICA MEXICANA';$('#total').textContent=fmt(accumulated(state?.id));$('#total-label').textContent='Acumulado desde 2015';$('#partial').hidden=year!==2026||mode==='states';$('#state-panel').hidden=mode!=='states';$('#state-name').replaceChildren(...(state?.name||'32 entidades').split(' ').flatMap((word,i)=>{const span=document.createElement('span');span.textContent=word;return i?[document.createTextNode(' '),span]:[span]}));$('#all-states').hidden=selected==='all';$('#state-select').value=selected;$('#legend-years').textContent=onlyYear?`Solo ${year}`:`2015 — ${year}`;$('#year-filter').textContent=onlyYear?'VER ACUMULADO':'SOLO ESTE AÑO';$('#year-filter').setAttribute('aria-pressed',onlyYear);updateCohortLegend();for(const b of $('#years').children){const active=Number(b.dataset.year)===year;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',active)}for(const m of ['national','states']){$('#'+m).classList.toggle('active',mode===m);$('#'+m).setAttribute('aria-pressed',mode===m)}$('#fear-value').innerHTML=`${data.years[year].perception.toFixed(1)}<span>%</span>`;$('#fear-period').textContent=`INEGI · ENVIPE ${year} · dato nacional`;$('#pause').setAttribute('aria-pressed',paused);$('#pause').textContent=paused?'▷':'Ⅱ';fitStateText()}
function fitStateText(){
 const panel=$('#state-panel'),title=$('#state-name');if(panel.hidden)return;
 title.style.fontSize='';panel.style.top='';
 const width=title.clientWidth,largest=Math.max(...[...title.children].map(s=>s.getBoundingClientRect().width));
 const size=parseFloat(getComputedStyle(title).fontSize);
 if(largest>width)title.style.fontSize=`${Math.floor(size*width/largest)}px`;
 const sceneTop=$('#scene').getBoundingClientRect().top;
 const minimumTop=$('.statistics').getBoundingClientRect().bottom-sceneTop+24;
 const available=Math.max(80,H-minimumTop-70);
 for(let n=0;n<25&&panel.offsetHeight>available;n++){const size=parseFloat(getComputedStyle(title).fontSize);if(size<=20)break;title.style.fontSize=`${size-1}px`}
 panel.style.top=`${Math.max(minimumTop,H-panel.offsetHeight-110)}px`;panel.style.bottom='auto';
}
let imageRect={x:0,y:0,w:0,h:0};
function geometry(){const single=mode==='states'&&selected!=='all';const nw=Math.max(W*.98,H*1.43);imageRect={x:W*.15,y:H*.025,w:nw,h:nw*1894.97/2675.91};if(single){const crop=stateCrops[Number(selected)-1];const width=nw*2.7,height=width*1894.97/2675.91;imageRect={x:W*.64-crop.cx*width,y:H*.47-crop.cy*height,w:width,h:height}}clusters=[];
for(const p of points){let tx,ty;if(single){tx=imageRect.x+p.sx*imageRect.w;ty=imageRect.y+p.sy*imageRect.h;p.r=5.6+p.jitter*.8}else if(mode==='states'){const row=Math.floor((p.state-1)/8),col=(p.state-1)%8;const cw=W*.083,ch=H*.155,cx=W*.29+(col+.5)*cw,cy=H*.15+(row+.5)*ch;tx=cx+(p.ox-.5)*cw*.9;ty=cy+(p.oy-.5)*ch*.85;p.r=1.7+p.jitter*.35}else{tx=imageRect.x+p.nx*imageRect.w;ty=imageRect.y+p.ny*imageRect.h;p.r=3.25+p.jitter*.7}p.tx=W*.58+(tx-W*.58)*zoom;p.ty=H*.46+(ty-H*.46)*zoom;p.r*=Math.sqrt(zoom)}
}
// The SVG is divided into persistent year cohorts. Each fiber pixel inherits
// the year of its closest record, so adding a year never recolors older fibers.
const cohortLayers=[];
function buildCohortLayers(){
 const w=mask.width,h=mask.height,cell=22,grid=new Map();
 for(const p of all.filter(p=>!p.record)){const gx=Math.floor(p.nx*w/cell),gy=Math.floor(p.ny*h/cell),key=`${gx},${gy}`;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(p)}
 const images=Array.from({length:12},()=>maskCtx.createImageData(w,h));
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const offset=(y*w+x)*4,alpha=pixels[offset+3];if(alpha<12)continue;
  const gx=Math.floor(x/cell),gy=Math.floor(y/cell);let near=null,best=Infinity;
  for(let radius=1;radius<=3&&!near;radius++)for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
   const candidates=grid.get(`${gx+dx},${gy+dy}`);if(!candidates)continue;
   for(const p of candidates){const d=(p.nx*w-x)**2+(p.ny*h-y)**2;if(d<best){best=d;near=p}}
  }
  const cohort=near?near.year-2015:(Math.floor(x/47)+Math.floor(y/41))%12;
  const buffer=images[cohort].data,g=grayForYear(2015+cohort);buffer[offset]=g;buffer[offset+1]=g;buffer[offset+2]=g;buffer[offset+3]=alpha;
 }
 for(const image of images){const layer=document.createElement('canvas');layer.width=w;layer.height=h;layer.getContext('2d').putImageData(image,0,0);cohortLayers.push(layer)}
}
buildCohortLayers();
const activeFibers=document.createElement('canvas'),newFibers=document.createElement('canvas'),pulseFibers=document.createElement('canvas');
for(const layer of [activeFibers,newFibers,pulseFibers]){layer.width=mask.width;layer.height=mask.height}
function prepareFibers(retainThrough=2014){
 const old=activeFibers.getContext('2d'),fresh=newFibers.getContext('2d');old.clearRect(0,0,mask.width,mask.height);fresh.clearRect(0,0,mask.width,mask.height);
 for(let y=onlyYear?year:2015;y<=year;y++){if(selected!=='all'&&!data.years[y].states[Number(selected)])continue;(y<=retainThrough?old:fresh).drawImage(cohortLayers[y-2015],0,0)}
}
let outgoing=[],outgoingEdges=[];
const departingFibers=document.createElement('canvas');departingFibers.width=mask.width;departingFibers.height=mask.height;
function prepareDepartures(){const c=departingFibers.getContext('2d');c.clearRect(0,0,mask.width,mask.height);for(const y of new Set(outgoing.map(p=>p.year)))c.drawImage(cohortLayers[y-2015],0,0)}
let pulseClock=0,motionClock=0,lastFrameTime=0;
function drawFibers(t){
 const arrival=settling?Math.min(1,(180-settling)/85):1;
 const pulse=pulseFibers.getContext('2d');pulse.clearRect(0,0,mask.width,mask.height);
 pulse.globalAlpha=1;pulse.drawImage(activeFibers,0,0);pulse.globalAlpha=arrival;pulse.drawImage(newFibers,0,0);pulse.globalAlpha=1;
 if(!paused&&!reduced){
  const radius=(pulseClock%1900)/1900*1600;
  pulse.globalCompositeOperation='source-in';const beam=pulse.createRadialGradient(mask.width*.53,mask.height*.5,0,mask.width*.53,mask.height*.5,1800);
  const center=radius/1800;beam.addColorStop(0,'rgba(255,255,255,0)');
  for(const [offset,alpha] of [[-.065,0],[-.025,.2],[0,1],[.018,.6],[.06,0]])beam.addColorStop(clamp(center+offset,.00001,.99999),`rgba(255,255,255,${alpha})`);
  beam.addColorStop(1,'rgba(255,255,255,0)');pulse.fillStyle=beam;pulse.fillRect(0,0,mask.width,mask.height);pulse.globalCompositeOperation='source-over';
 }else pulse.clearRect(0,0,mask.width,mask.height);
 ctx.save();ctx.translate(W*.58,H*.46);ctx.scale(zoom,zoom);ctx.translate(-W*.58,-H*.46);
 const drawAt=(x,y,w,h)=>{
  if(outgoing.length){ctx.globalAlpha=.7*Math.max(...outgoing.map(p=>Math.max(0,1-p.age/p.duration)));ctx.drawImage(departingFibers,x,y,w,h)}
  ctx.globalAlpha=.7;ctx.drawImage(activeFibers,x,y,w,h);ctx.globalAlpha=.7*arrival;ctx.drawImage(newFibers,x,y,w,h);
  if(!paused&&!reduced){ctx.globalAlpha=.8;ctx.shadowColor='#ffffff';ctx.shadowBlur=9;ctx.drawImage(pulseFibers,x,y,w,h);ctx.shadowBlur=0;ctx.globalAlpha=1;ctx.drawImage(pulseFibers,x,y,w,h)}
 };
 if(mode==='states'&&selected==='all'){for(let i=0;i<32;i++){const row=Math.floor(i/8),col=i%8,cw=W*.083,ch=H*.155;drawAt(W*.29+col*cw+cw*.05,H*.15+row*ch+ch*.075,cw*.9,ch*.85)}}else drawAt(imageRect.x,imageRect.y,imageRect.w,imageRect.h);
 ctx.restore();
}

function rebuild(animate=true,preserve=false,previousYear=2014){const previousPoints=points,previousEdges=edges;const previousIds=new Set(points.map(p=>p.id));points=all.filter(p=>(onlyYear?p.year===year:p.year<=year)&&(selected==='all'||p.state===Number(selected)));geometry();
 const activeIds=new Set(points.map(p=>p.id));
 if(!preserve||paused||reduced){outgoing=[];outgoingEdges=[]}
 else{
  outgoing=outgoing.filter(p=>!activeIds.has(p.id));
  const departing=new Map();for(const p of previousPoints)if(!activeIds.has(p.id)){const exit=makeExit(p,W,H);outgoing.push(exit);departing.set(p.id,exit)}
  const visible=new Map([...points,...outgoing].map(p=>[p.id,p]));
  outgoingEdges=outgoingEdges.filter(e=>visible.has(e.a.id)&&visible.has(e.b.id)&&(!activeIds.has(e.a.id)||!activeIds.has(e.b.id))).map(e=>({...e,a:visible.get(e.a.id),b:visible.get(e.b.id)}));
  for(const e of previousEdges)if(departing.has(e.a.id)||departing.has(e.b.id))outgoingEdges.push({a:departing.get(e.a.id)||e.a,b:departing.get(e.b.id)||e.b,bend:e.bend});
 }
 prepareDepartures();edges=[];const groups=new Map();for(const p of points){if(!groups.has(p.state))groups.set(p.state,[]);groups.get(p.state).push(p)}
 for(const group of groups.values()){for(let i=1;i<group.length;i++){const p=group[i];let nearest=null,dist=Infinity; // local topology is deterministic and bounded
 for(let k=1;k<=Math.min(i,18);k++){const q=group[i-k],d=(p.tx-q.tx)**2+(p.ty-q.ty)**2;if(d<dist){dist=d;nearest=q}}
 if(nearest)edges.push({a:p,b:nearest,bend:(p.jitter-.5)*16});}}
 if(mode==='national'){const g=[...groups.values()];for(let i=1;i<g.length;i++)for(let k=0;k<4;k++){const a=g[i][Math.min(k*7,g[i].length-1)],b=g[i-1][Math.min(k*9,g[i-1].length-1)];if(a&&b)edges.push({a,b,bend:30})}}
 const moving=animate&&!reduced&&!paused;
 const newCount=enterParticles(points,previousIds,{animate:moving,preserve,width:W,height:H});
 settling=newCount?180:0;prepareFibers(preserve?previousYear:2014);
 prepareStain();fearSorted=[...points].sort((a,b)=>fearScore(a)-fearScore(b));hover=null;$('#tooltip').hidden=true;updateUI();}

function changeYear(y){y=Math.max(2015,Math.min(2026,y));if(y===year)return;const previousYear=year;year=y;setFear(false);fearProgress=0;resetHandYear(handState);if(stream)$('#camera-status').textContent=handState.waiting?'Nuevo año: cierra el puño o retira la mano y vuelve a mostrar la palma.':'Nuevo año: muestra la palma para ver la percepción.';rebuild(onlyYear||y>previousYear,!onlyYear,previousYear)}
function setMode(m){mode=m;selected='all';zoom=1;resetView();setFear(false);rebuild()}
$('#year-filter').onclick=()=>{onlyYear=!onlyYear;showTip(null);rebuild(true,false)};
$('#national').onclick=()=>setMode('national');$('#states').onclick=()=>setMode('states');$('#state-select').onchange=e=>{selected=e.target.value;zoom=1;resetView();setFear(false);rebuild()};$('#all-states').onclick=()=>{selected='all';zoom=1;resetView();rebuild()};function moveState(dir){let index=data.states.findIndex(s=>s.id===Number(selected));index=(index+dir+32)%32;selected=String(data.states[index].id);zoom=1;resetView();rebuild()}$('#previous-state').onclick=()=>moveState(-1);$('#next-state').onclick=()=>moveState(1);
let wheelTime=0;$('.timeline').addEventListener('wheel',e=>{e.preventDefault();if(performance.now()-wheelTime>140){wheelTime=performance.now();changeYear(year+Math.sign(e.deltaY))}},{passive:false});
function resize(){if(W===canvas.clientWidth&&H===canvas.clientHeight)return;W=canvas.clientWidth;H=canvas.clientHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=W*dpr;canvas.height=H*dpr;woven.width=canvas.width;woven.height=canvas.height;display.setTransform(dpr,0,0,dpr,0,0);boundView(view,W,H);ctx.setTransform(dpr,0,0,dpr,0,0);rebuild(false)}new ResizeObserver(resize).observe(canvas);
function pathEdge(e){const {a,b}=e;ctx.moveTo(a.x,a.y);const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;const amplitude=Math.min(4,len*.035);for(let j=1;j<=7;j++){const f=j/7,noise=Math.sin(j*2.8+a.jitter*30)*amplitude*Math.sin(f*Math.PI);ctx.lineTo(a.x+dx*f-dy/len*noise,a.y+dy*f+dx/len*noise)}if(len>32){const f=.43,x=a.x+dx*f,y=a.y+dy*f;ctx.moveTo(x,y);ctx.lineTo(x-dy*.12+dx*.07,y+dx*.12+dy*.07);ctx.lineTo(x-dy*.21+dx*.04,y+dx*.21+dy*.04)}}
let fearCenter={x:0,y:0},fearSorted=[],fearThreshold=-1,dimmed=new Set();
const fearScore=p=>stainScore(p.tx,p.ty,fearCenter.x,fearCenter.y,W,H);
const stain=document.createElement('canvas');stain.width=280;stain.height=180;
const stainCtx=stain.getContext('2d'),stainImage=stainCtx.createImageData(280,180),stainField=new Float32Array(280*180);
const tissueShape=document.createElement('canvas');tissueShape.width=280;tissueShape.height=180;
const shapeCtx=tissueShape.getContext('2d',{willReadFrequently:true});shapeCtx.drawImage(mask,0,0,280,180);
const shapePixels=shapeCtx.getImageData(0,0,280,180);shapeCtx.clearRect(0,0,280,180);shapeCtx.fillStyle='#fff';
for(let y=0;y<180;y++){let left=280,right=-1;for(let x=0;x<280;x++)if([-2,-1,0,1,2].some(dy=>y+dy>=0&&y+dy<180&&shapePixels.data[((y+dy)*280+x)*4+3]>20)){left=Math.min(left,x);right=x}if(right>=left)shapeCtx.fillRect(left,y,right-left+1,1)}
const tissueCanvas=document.createElement('canvas');tissueCanvas.width=280;tissueCanvas.height=180;
const tissueCtx=tissueCanvas.getContext('2d',{willReadFrequently:true});let tissuePixels=null,areaScores=[];
function prepareStain(){
 tissueCtx.clearRect(0,0,280,180);
 const place=(x,y,w,h)=>tissueCtx.drawImage(tissueShape,x/W*280,y/H*180,w/W*280,h/H*180);
 if(mode==='states'&&selected==='all'){for(let i=0;i<32;i++){const row=Math.floor(i/8),col=i%8,cw=W*.083,ch=H*.155;place(W*.29+col*cw+cw*.05,H*.15+row*ch+ch*.075,cw*.9,ch*.85)}}else place(imageRect.x,imageRect.y,imageRect.w,imageRect.h);
 tissuePixels=tissueCtx.getImageData(0,0,280,180).data;
 let count=0,cx=0,cy=0;for(let y=0;y<180;y++)for(let x=0;x<280;x++)if(tissuePixels[(y*280+x)*4+3]>127){cx+=x+.5;cy+=y+.5;count++}
 fearCenter=count?{x:cx/count/280*W,y:cy/count/180*H}:{x:W*.6,y:H*.5};areaScores=[];
 for(let y=0;y<180;y++)for(let x=0;x<280;x++){const k=y*280+x;stainField[k]=stainScore((x+.5)/280*W,(y+.5)/180*H,fearCenter.x,fearCenter.y,W,H);if(tissuePixels[k*4+3]>127)areaScores.push(stainField[k])}
 areaScores.sort((a,b)=>a-b);
}
function drawStain(){
 fearThreshold=areaThreshold(areaScores,data.years[year].perception,fearProgress);
 dimmed=new Set(points.filter(p=>{const x=Math.floor(p.tx/W*280),y=Math.floor(p.ty/H*180);return x>=0&&x<280&&y>=0&&y<180&&tissuePixels[(y*280+x)*4+3]>127&&fearScore(p)<=fearThreshold}).map(p=>p.id));
 if(fearThreshold<0)return;
 for(let y=0;y<180;y++)for(let x=0;x<280;x++){
  const k=y*280+x,i=k*4,edge=clamp((fearThreshold-stainField[k])/.055,0,1);
  const grain=.62+.15*Math.sin(x*.19+Math.sin(y*.12)*3)+.12*Math.cos(y*.27+x*.13)+.07*Math.sin(x*1.9+y*2.7);
  stainImage.data[i]=112;stainImage.data[i+1]=12;stainImage.data[i+2]=17;
  stainImage.data[i+3]=tissuePixels[i+3]>127?255*edge*grain*.82*fearProgress:0;
 }
 stainCtx.putImageData(stainImage,0,0);ctx.drawImage(stain,0,0,W,H);
}

function draw(t){frame++;const elapsed=lastFrameTime?Math.min(40,t-lastFrameTime):16.67;lastFrameTime=t;if(!paused)pulseClock+=elapsed*.65;motionClock=advanceMotionClock(motionClock,elapsed,paused,!!hover);
 if(settling&&!paused&&!hover){const dt=elapsed/16.67;stepParticles(points,settling,dt);recordEntry(points);settling=Math.max(0,settling-dt);if(!settling)for(const p of points)if(p.moving){p.x=p.tx;p.y=p.ty;p.vx=0;p.vy=0;p.moving=false}}

 if(outgoing.length&&!paused&&!hover){outgoing=outgoing.filter(p=>stepExit(p,elapsed));const ids=new Set(outgoing.map(p=>p.id));outgoingEdges=outgoingEdges.filter(e=>ids.has(e.a.id)||ids.has(e.b.id))}
 const target=fear?1:0;fearProgress+= (target-fearProgress)*.045;if(Math.abs(fearProgress-target)<.001)fearProgress=target;
 ctx.fillStyle='#050505';ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(view.x,view.y);ctx.scale(view.scale,view.scale);ambient=breathing(motionClock,W,H,reduced);ctx.transform(ambient.a,0,0,ambient.d,ambient.x,ambient.y);
 drawStain();
 drawFibers(t);
 // Removed cohorts leave through their recorded entry paths in reverse.
 ctx.save();
 const outgoingById=new Map(outgoing.map(p=>[p.id,p]));
 for(const e of outgoingEdges){const removed=outgoingById.get(e.a.id)||outgoingById.get(e.b.id);if(!removed||Math.hypot(e.a.x-e.b.x,e.a.y-e.b.y)>180)continue;const g=grayForYear(removed.year);ctx.globalAlpha=.4*(1-removed.age/removed.duration);ctx.strokeStyle=`rgb(${g},${g},${g})`;ctx.lineWidth=.65;ctx.beginPath();pathEdge(e);ctx.stroke()}
 for(const p of outgoing){const g=grayForYear(p.year);ctx.globalAlpha=p.opacity;ctx.fillStyle=`rgb(${g},${g},${g})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=p.opacity*.24;ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*2.7,p.y-p.vy*2.7);ctx.stroke()}
 ctx.restore();
 // Fine branching fibers; year cohorts retain distinct gray values.
 for(let y=2015;y<=year;y++){const gray=grayForYear(y);ctx.strokeStyle=`rgb(${gray} ${gray} ${gray} / .40)`;ctx.lineWidth=mode==='states'&&selected!=='all'?.85:.55;ctx.beginPath();for(const e of edges)if(e.a.year===y&&Math.hypot(e.a.x-e.b.x,e.a.y-e.b.y)<180)pathEdge(e);ctx.stroke()}

 if(!paused&&!reduced){
 ctx.save();ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=1.25;ctx.shadowColor='#fff';ctx.shadowBlur=7;ctx.beginPath();
 for(const e of edges){if(dimmed.has(e.a.id)||Math.hypot(e.a.x-e.b.x,e.a.y-e.b.y)>180)continue;const phase=(pulseClock/820+e.a.jitter)%1,dx=e.b.x-e.a.x,dy=e.b.y-e.a.y;ctx.moveTo(e.a.x+dx*phase,e.a.y+dy*phase);const end=Math.min(1,phase+.16);ctx.lineTo(e.a.x+dx*end,e.a.y+dy*end)}ctx.stroke();ctx.restore();
 }
 if(settling){ctx.lineWidth=1.2;for(let y=2015;y<=year;y++){const g=grayForYear(y);ctx.strokeStyle=`rgba(${g},${g},${g},.24)`;ctx.beginPath();for(const p of points){if(!p.moving||p.delay>0||p.year!==y)continue;ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*2.7,p.y-p.vy*2.7)}ctx.stroke()}}
 for(let y=2015;y<=year;y++){const g=grayForYear(y);for(const dim of [false,true]){ctx.fillStyle=dim?`rgb(${Math.round(g*.32+30)},${Math.round(g*.27+25)},${Math.round(g*.27+25)})`:`rgb(${g},${g},${g})`;ctx.beginPath();for(const p of points){if(p.year!==y||p.delay>0||dimmed.has(p.id)!==dim)continue;ctx.moveTo(p.x+p.r,p.y);ctx.arc(p.x,p.y,p.r,0,Math.PI*2)}ctx.fill()}}
 ctx.strokeStyle='#e5e5e5';ctx.lineWidth=1;ctx.beginPath();for(const p of points)if(p.record&&p.delay<=0){ctx.moveTo(p.x+p.r+3,p.y);ctx.arc(p.x,p.y,p.r+3,0,Math.PI*2)}ctx.stroke();
 if(mode==='states'&&selected==='all'){ctx.font='9px "mozaic-geo-variable", sans-serif';ctx.textAlign='center';ctx.fillStyle='#aaa';for(let i=0;i<32;i++){const row=Math.floor(i/8),col=i%8;const name=data.states[i].name;const x=W*.29+(col+.5)*W*.083,y=H*.15+(row+1)*H*.155-2;ctx.fillText(name.length>15?name.slice(0,13)+'…':name,x,y,W*.08)}}
 if(hover){ctx.strokeStyle='#d73630';ctx.lineWidth=1.2;ctx.beginPath();for(const e of edges)if(e.a===hover||e.b===hover)pathEdge(e);ctx.stroke();ctx.fillStyle='#d3322c';ctx.beginPath();ctx.arc(hover.x,hover.y,hover.r+1,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.beginPath();ctx.arc(hover.x,hover.y,hover.r+4,0,Math.PI*2);ctx.stroke()}
 ctx.restore();
 display.fillStyle='#050505';display.fillRect(0,0,W,H);
 // Two-pixel bands follow the same continuous field as pointer hit targets.
 // Distort the full tissue together so no point detaches from its branches.
 if(reduced)display.drawImage(woven,0,0,W,H);
 else for(let y=0;y<H;y+=2){const h=Math.min(2,H-y),dx=fiberWave(y+h/2,motionClock,H);display.drawImage(woven,0,y*dpr,woven.width,h*dpr,dx,y,W,h)}
 if(hover)positionTip(hover);
 requestAnimationFrame(draw)}
function showTip(p){if(p&&settling){settling=0;for(const q of points){q.x=q.tx;q.y=q.ty;q.vx=q.vy=0;q.moving=false;q.delay=0}}hover=p;if(!p){$('#tooltip').hidden=true;return}const name=data.states.find(s=>s.id===p.state).name;
 if(p.record){$('#tooltip').innerHTML=`<div class="tip-title">CASO DOCUMENTADO · YO TE NOMBRO</div><div class="demo-person"><strong>${p.record.name}</strong><span>${p.record.source}</span></div><b>${name}</b><br>${p.record.municipality}<br>Año: <b>${p.year}</b><small>Registro de la fuente ciudadana.<br>No se suma al conteo del SESNSP.</small>`}
 else{$('#tooltip').innerHTML=`<div class="tip-title">FICHA DEL ATLAS</div><div class="demo-person"><strong>${demoName(p.id)}</strong><span class="fiction-note">Nombre ficticio · prueba</span></div><b>${name}</b><br>Año: <b>${p.year}</b>${p.year===2026?' · enero–septiembre':''}<small>Entidad y año del conteo SESNSP.</small>`}
 positionTip(p);$('#tooltip').insertAdjacentHTML('beforeend','<span class=tip-hint>Esc para cerrar · mueve el cursor para explorar</span>');$('#tooltip').hidden=false}
function positionTip(p){const pt=screenPoint(p),tw=240,th=235;$('#tooltip').style.left=`${Math.max(10,Math.min(W-tw-10,pt.x+17))}px`;$('#tooltip').style.top=`${Math.max(10,Math.min(H-th-58,pt.y-35))}px`}
canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragging={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};dragged=false;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{
 if(dragging){const dx=e.clientX-dragging.x,dy=e.clientY-dragging.y;if(Math.hypot(e.clientX-dragging.startX,e.clientY-dragging.startY)>4)dragged=true;if(dragged&&view.scale>1){panBy(view,dx,dy,W,H);showTip(null)}dragging.x=e.clientX;dragging.y=e.clientY;canvas.style.cursor=view.scale>1?'grabbing':'default';return}
 const r=canvas.getBoundingClientRect();pointer={x:e.clientX-r.left,y:e.clientY-r.top};if(hover){const held=screenPoint(hover);if(Math.hypot(held.x-pointer.x,held.y-pointer.y)<Math.max(24,hover.r*view.scale+12)){canvas.style.cursor='crosshair';return}}let near=null,best=Infinity;for(const p of points){if(p.delay>0)continue;const q=screenPoint(p),d=(q.x-pointer.x)**2+(q.y-pointer.y)**2;if(d<best&&d<Math.max(8,p.r*view.scale+3)**2){near=p;best=d}}showTip(near);canvas.style.cursor=mode==='states'&&selected==='all'&&stateAtPointer(e)!==null?'pointer':near?'crosshair':view.scale>1?'grab':'default';
});
canvas.addEventListener('pointerup',e=>{dragging=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);canvas.style.cursor=view.scale>1?'grab':'default'});
canvas.addEventListener('pointercancel',()=>{dragging=null;dragged=true});
canvas.addEventListener('pointerleave',()=>{canvas.style.cursor='default'});
function stateAtPointer(e){
 const r=canvas.getBoundingClientRect(),sy=e.clientY-r.top;
 const sx=e.clientX-r.left-fiberWave(sy,motionClock,H,reduced);
 const x=((sx-view.x)/view.scale-ambient.x)/ambient.a;
 const y=((sy-view.y)/view.scale-ambient.y)/ambient.d;
 return stateAtPosition(x,y,W,H);
}
canvas.addEventListener('click',e=>{
 if(dragged)return;
 const rect=canvas.getBoundingClientRect();let near=null,best=Infinity;
 for(const p of points){if(p.delay>0)continue;const q=screenPoint(p),distance=Math.hypot(q.x-(e.clientX-rect.left),q.y-(e.clientY-rect.top));if(distance<Math.max(12,p.r*view.scale+5)&&distance<best){near=p;best=distance}}
 if(near){showTip(near);document.dispatchEvent(new Event('sinapsis:neuron-select'));return}
 if(mode!=='states'||selected!=='all')return;const state=stateAtPointer(e);if(state!==null){selected=String(state);zoom=1;resetView();rebuild()}});
function gestureZoom(factor,clientX,clientY){const r=canvas.getBoundingClientRect();zoomAt(view,factor,clientX-r.left,clientY-r.top,W,H);showTip(null);canvas.style.cursor=view.scale>1?'grab':'default'}
canvas.addEventListener('wheel',e=>{e.preventDefault();const unit=e.deltaMode===1?16:e.deltaMode===2?H:1;gestureZoom(Math.exp(-e.deltaY*unit*(e.ctrlKey?.008:.002)),e.clientX,e.clientY)},{passive:false});
// Safari exposes native trackpad pinch through gesture events.
let lastGestureScale=1;
canvas.addEventListener('gesturestart',e=>{e.preventDefault();lastGestureScale=1},{passive:false});
canvas.addEventListener('gesturechange',e=>{e.preventDefault();gestureZoom(e.scale/lastGestureScale,e.clientX,e.clientY);lastGestureScale=e.scale},{passive:false});
canvas.addEventListener('gestureend',e=>{e.preventDefault();lastGestureScale=1},{passive:false});

canvas.onkeydown=e=>{if(['+','=','-'].includes(e.key)){e.preventDefault();zoomAt(view,e.key==='-'?1/1.2:1.2,W/2,H/2,W,H);showTip(null);return}if(e.key==='Escape'){showTip(null);return}if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();keyboardIndex=(keyboardIndex+(e.key==='ArrowRight'?1:-1)+points.length)%points.length;showTip(points[keyboardIndex]);if(points[keyboardIndex])document.dispatchEvent(new Event('sinapsis:neuron-select'))}};
$('#reset').onclick=()=>{resetView();showTip(null)};
$('#pause').onclick=()=>{paused=!paused;if(paused){settling=0;for(const p of points){p.x=p.tx;p.y=p.ty;p.moving=false;p.delay=0}}updateUI()};
function setFear(value){if(fear===value)return;fear=value;$('#scene').classList.toggle('has-fear',value);fearSorted=[...points].sort((a,b)=>fearScore(a)-fearScore(b));$('#fear-reading').hidden=!fear;$('#manual').textContent=fear?'Ocultar percepción':'Mostrar sin cámara';$('#manual').setAttribute('aria-pressed',fear)}
$('#perception-button').onclick=()=>{const open=$('#perception-controls').hidden;$('#perception-controls').hidden=!open;$('#perception-button').setAttribute('aria-expanded',open);$('.plus').textContent=open?'−':'+'};$('#manual').onclick=()=>setFear(!fear);
const dialog=$('#info');$('#sources').onclick=$('#about').onclick=()=>dialog.showModal();dialog.querySelector('.close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
let recognizer=null,stream=null,cameraTimer=null,lastVideoTime=-1,handState=createHandState();
function stopCamera(){if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;handState=createHandState();lastVideoTime=-1;clearTimeout(cameraTimer);$('#video').srcObject=null;$('#video').hidden=true;$('#camera').innerHTML='Activar cámara <span>↗</span>';$('#camera-status').textContent='Cámara apagada. También puedes usar el control manual.';setFear(false)}
async function recognize(){if(!stream)return;const video=$('#video');try{if(video.readyState>=2&&video.currentTime!==lastVideoTime){lastVideoTime=video.currentTime;const results=recognizer.recognizeForVideo(video,performance.now());const top=results.gestures[0]?.[0];const name=top&&top.score>.65?top.categoryName:'';const action=readHand(handState,name,!!results.landmarks?.length);if(action){setFear(action.visible);$('#camera-status').textContent=action.status}}}catch(e){stopCamera();$('#camera-status').textContent='No se pudo leer el gesto. Usa el control manual.';return}cameraTimer=setTimeout(recognize,100)}
$('#camera').onclick=async()=>{if(stream){stopCamera();return}const button=$('#camera');button.disabled=true;$('#camera-status').textContent='Cargando reconocimiento de manos…';try{if(!navigator.mediaDevices?.getUserMedia)throw Error('unsupported');if(!recognizer){const {GestureRecognizer,FilesetResolver}=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/vision_bundle.mjs');const files=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm');recognizer=await GestureRecognizer.createFromOptions(files,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task'},runningMode:'VIDEO',numHands:1})}stream=await navigator.mediaDevices.getUserMedia({video:{width:320,height:240,facingMode:'user'},audio:false});if(document.hidden){stopCamera();return}$('#video').srcObject=stream;await $('#video').play();$('#video').hidden=false;button.textContent='Apagar cámara';$('#camera-status').textContent='Muestra la palma abierta a la cámara.';handState=createHandState();lastVideoTime=-1;recognize()}catch(e){if(stream)stopCamera();$('#camera-status').textContent=e.name==='NotAllowedError'?'Permiso de cámara denegado. Puedes usar el control manual.':'No se pudo iniciar la cámara. Revisa tu conexión o usa el control manual.'}finally{button.disabled=false}};
window.addEventListener('pagehide',stopCamera);document.addEventListener('visibilitychange',()=>{if(document.hidden&&stream)stopCamera()});
// Restore the atlas only when returning from the reflection page.
if(new URLSearchParams(location.search).has('continuar')){
 try{
  const saved=JSON.parse(sessionStorage.getItem('sinapsis-atlas'));
  if(saved&&data.years[saved.year]){
   year=Number(saved.year);mode=saved.mode==='states'?'states':'national';
   selected=saved.selected==='all'||data.states.some(s=>String(s.id)===saved.selected)?saved.selected:'all';
   onlyYear=!!saved.onlyYear;paused=reduced||!!saved.paused;
  }
 }catch{}
}
resize();rebuild();$('#loading').hidden=true;requestAnimationFrame(draw);
function saveAtlas(){
 try{sessionStorage.setItem('sinapsis-atlas',JSON.stringify({year,mode,selected,onlyYear,paused}))}catch{}
}
$('#open-closing').addEventListener('click',()=>{saveAtlas();stopCamera()});
window.addEventListener('pagehide',saveAtlas);
// Read-only diagnostics for data validation and browser QA.
window.sinapsis={getState:()=>({year,mode,selected,onlyYear,points:points.length,annual:data.years[year].total,accumulated:accumulated(),fear,perception:data.years[year].perception}),data};
