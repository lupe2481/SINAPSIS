import {grayForYear, enterParticles, stepParticles} from './motion.js';
const $=s=>document.querySelector(s), fmt=n=>n.toLocaleString('es-MX');
let data;
try{const response=await fetch('./data.json');if(!response.ok)throw Error();data=await response.json()}catch(e){$('#loading').textContent='No se pudieron cargar los datos. Recarga la página.';throw e}
const neuralImage=new Image();neuralImage.src='./assets/neuronal-reference.svg';await neuralImage.decode();
const mask=document.createElement('canvas');mask.width=1800;mask.height=1275;const maskCtx=mask.getContext('2d',{willReadFrequently:true});maskCtx.drawImage(neuralImage,0,0,mask.width,mask.height);const pixels=maskCtx.getImageData(0,0,mask.width,mask.height).data;const fibers=[],fiberGroups=Array.from({length:32},()=>[]);
for(let y=2;y<mask.height-2;y+=3)for(let x=2;x<mask.width-2;x+=3){if(pixels[(y*mask.width+x)*4+3]>100){const pt={x:x/mask.width,y:y/mask.height};fibers.push(pt);const col=Math.min(7,Math.floor(x/mask.width*8)),row=Math.min(3,Math.floor(y/mask.height*4));fiberGroups[row*8+col].push(pt)}}
const canvas=$('#network'),ctx=canvas.getContext('2d',{alpha:false});
let year=2025,mode='national',selected='all',W=0,H=0,dpr=1,zoom=1,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,hover=null,pointer=null,points=[],edges=[],clusters=[],frame=0,settling=0,fear=false,fearProgress=0,keyboardIndex=-1;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let seed=381;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const all=[];let id=0;
for(const state of data.states){seed=state.id*15731;for(let y=2015;y<=2026;y++){for(let i=0;i<data.years[y].states[state.id];i++){const a=rand()*Math.PI*2,r=Math.sqrt(rand());all.push({id:id++,state:state.id,year:y,u:Math.cos(a)*r,v:Math.sin(a)*r,jitter:rand(),x:0,y:0,vx:0,vy:0,tx:0,ty:0,r:1})}}}
for(let y=2015;y<=2026;y++){const b=document.createElement('button');b.textContent=y;b.dataset.year=y;b.setAttribute('aria-label',`Año ${y}${y===2026?', enero a septiembre':''}`);b.onclick=()=>changeYear(y);$('#years').append(b)}
const stateCrops=data.states.map((state,i)=>({cx:Math.max(.24,Math.min(.78,(i%8+.5)/8)),cy:Math.max(.28,Math.min(.76,(Math.floor(i/8)+.5)/4))}));
const stateFibers=stateCrops.map(c=>fibers.filter(p=>Math.abs(p.x-c.cx)<.14&&Math.abs(p.y-c.cy)<.15));
for(const p of all){const pool=fiberGroups[p.state-1].length?fiberGroups[p.state-1]:fibers;const a=pool[Math.floor(p.jitter*pool.length)];const local=stateFibers[p.state-1].length?stateFibers[p.state-1]:fibers;const b=local[(p.id*7919)%local.length];p.nx=a.x+(p.jitter-.5)*.004;p.ny=a.y+Math.sin(p.id)*.002;p.sx=b.x+(p.jitter-.5)*.003;p.sy=b.y+Math.sin(p.id)*.002;const overview=fibers[(p.id*7919)%fibers.length];p.ox=overview.x;p.oy=overview.y}

for(const s of data.states){const o=document.createElement('option');o.value=s.id;o.textContent=s.name;$('#state-select').append(o)}
function currentState(){return data.states.find(s=>s.id===Number(selected))}
function accumulated(state){let n=0;for(let y=2015;y<=year;y++)n+=state?data.years[y].states[state]:data.years[y].total;return n}
function updateCohortLegend(){const key=$('#cohort-key');if(!key)return;key.innerHTML='';for(let y=2015;y<=year;y++){const item=document.createElement('span'),g=grayForYear(y);item.innerHTML=`<i style="background:rgb(${g},${g},${g})"></i>${y}`;key.append(item)}}
function updateUI(){const state=currentState();$('#year').textContent=year;$('#annual').textContent=fmt(state?data.years[year].states[state.id]:data.years[year].total);$('#annual-label').textContent=year===2026?'víctimas · enero a septiembre':'víctimas registradas en el año';$('#scope').textContent=state?'VISTA ESTATAL':'REPÚBLICA MEXICANA';$('#total').textContent=fmt(accumulated(state?.id));$('#total-label').textContent='Acumulado desde 2015';$('#partial').hidden=year!==2026||mode==='states';$('#state-panel').hidden=mode!=='states';$('#country-caption').hidden=mode==='states';$('#state-name').textContent=state?.name||'32 entidades';$('#all-states').hidden=selected==='all';$('#state-select').value=selected;$('#view-title').textContent=state?`TOTAL NACIONAL ${year} / ${fmt(data.years[year].total)}`:'ATLAS NEURONAL / MÉXICO';$('#legend-years').textContent=`2015 — ${year}`;updateCohortLegend();for(const b of $('#years').children){const active=Number(b.dataset.year)===year;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',active)}for(const m of ['national','states']){$('#'+m).classList.toggle('active',mode===m);$('#'+m).setAttribute('aria-pressed',mode===m)}$('#fear-value').innerHTML=`${data.years[year].perception.toFixed(1)}<span>%</span>`;$('#fear-period').textContent=`INEGI · ENVIPE ${year} · dato nacional`;$('#pause').setAttribute('aria-pressed',paused);$('#pause').textContent=paused?'▷':'Ⅱ'}
let imageRect={x:0,y:0,w:0,h:0};
function geometry(){const single=mode==='states'&&selected!=='all';const nw=Math.max(W*.98,H*1.43);imageRect={x:W*.15,y:H*.025,w:nw,h:nw*1894.97/2675.91};if(single){const crop=stateCrops[Number(selected)-1];const width=nw*2.7,height=width*1894.97/2675.91;imageRect={x:W*.64-crop.cx*width,y:H*.47-crop.cy*height,w:width,h:height}}clusters=[];
for(const p of points){let tx,ty;if(single){tx=imageRect.x+p.sx*imageRect.w;ty=imageRect.y+p.sy*imageRect.h;p.r=5.6+p.jitter*.8}else if(mode==='states'){const row=Math.floor((p.state-1)/8),col=(p.state-1)%8;const cw=W*.083,ch=H*.155,cx=W*.29+(col+.5)*cw,cy=H*.15+(row+.5)*ch;tx=cx+(p.ox-.5)*cw*.9;ty=cy+(p.oy-.5)*ch*.85;p.r=1.7+p.jitter*.35}else{tx=imageRect.x+p.nx*imageRect.w;ty=imageRect.y+p.ny*imageRect.h;p.r=3.25+p.jitter*.7}p.tx=W*.58+(tx-W*.58)*zoom;p.ty=H*.46+(ty-H*.46)*zoom;p.r*=Math.sqrt(zoom)}
}
// The SVG is divided into persistent year cohorts. Each fiber pixel inherits
// the year of its closest record, so adding a year never recolors older fibers.
const cohortLayers=[];
function buildCohortLayers(){
 const w=mask.width,h=mask.height,cell=22,grid=new Map();
 for(const p of all){const gx=Math.floor(p.nx*w/cell),gy=Math.floor(p.ny*h/cell),key=`${gx},${gy}`;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(p)}
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
 for(let y=2015;y<=year;y++){if(selected!=='all'&&!data.years[y].states[Number(selected)])continue;(y<=retainThrough?old:fresh).drawImage(cohortLayers[y-2015],0,0)}
}
let pulseClock=0,lastFrameTime=0;
function drawFibers(t){
 const arrival=settling?Math.min(1,(180-settling)/85):1;
 const pulse=pulseFibers.getContext('2d');pulse.clearRect(0,0,mask.width,mask.height);
 pulse.globalAlpha=1;pulse.drawImage(activeFibers,0,0);pulse.globalAlpha=arrival;pulse.drawImage(newFibers,0,0);pulse.globalAlpha=1;
 if(!paused&&!reduced){
  // A narrow traveling front crosses every active fiber once per 1.45 seconds.
  // source-in keeps its light strictly inside the neuronal connections.
  const phase=(pulseClock%1450)/1450,start=-230+phase*(mask.width+460);
  pulse.globalCompositeOperation='source-in';const beam=pulse.createLinearGradient(start-120,0,start+120,0);
  beam.addColorStop(0,'rgba(255,255,255,0)');beam.addColorStop(.27,'rgba(255,255,255,.08)');beam.addColorStop(.48,'rgba(255,255,255,.8)');beam.addColorStop(.57,'rgba(255,255,255,1)');beam.addColorStop(.7,'rgba(255,255,255,.3)');beam.addColorStop(1,'rgba(255,255,255,0)');pulse.fillStyle=beam;pulse.fillRect(0,0,mask.width,mask.height);pulse.globalCompositeOperation='source-over';
 }else pulse.clearRect(0,0,mask.width,mask.height);
 ctx.save();ctx.translate(W*.58,H*.46);ctx.scale(zoom,zoom);ctx.translate(-W*.58,-H*.46);
 const drawAt=(x,y,w,h)=>{
  ctx.globalAlpha=.7;ctx.drawImage(activeFibers,x,y,w,h);ctx.globalAlpha=.7*arrival;ctx.drawImage(newFibers,x,y,w,h);
  if(!paused&&!reduced){ctx.globalAlpha=.8;ctx.shadowColor='#ffffff';ctx.shadowBlur=9;ctx.drawImage(pulseFibers,x,y,w,h);ctx.shadowBlur=0;ctx.globalAlpha=1;ctx.drawImage(pulseFibers,x,y,w,h)}
 };
 if(mode==='states'&&selected==='all'){for(let i=0;i<32;i++){const row=Math.floor(i/8),col=i%8,cw=W*.083,ch=H*.155;drawAt(W*.29+col*cw+cw*.05,H*.15+row*ch+ch*.075,cw*.9,ch*.85)}}else drawAt(imageRect.x,imageRect.y,imageRect.w,imageRect.h);
 ctx.restore();
}

function rebuild(animate=true,preserve=false,previousYear=2014){const previousIds=new Set(points.map(p=>p.id));points=all.filter(p=>p.year<=year&&(selected==='all'||p.state===Number(selected)));geometry();edges=[];const groups=new Map();for(const p of points){if(!groups.has(p.state))groups.set(p.state,[]);groups.get(p.state).push(p)}
 for(const group of groups.values()){for(let i=1;i<group.length;i++){const p=group[i];let nearest=null,dist=Infinity; // local topology is deterministic and bounded
 for(let k=1;k<=Math.min(i,18);k++){const q=group[i-k],d=(p.tx-q.tx)**2+(p.ty-q.ty)**2;if(d<dist){dist=d;nearest=q}}
 if(nearest)edges.push({a:p,b:nearest,bend:(p.jitter-.5)*16});}}
 if(mode==='national'){const g=[...groups.values()];for(let i=1;i<g.length;i++)for(let k=0;k<4;k++){const a=g[i][Math.min(k*7,g[i].length-1)],b=g[i-1][Math.min(k*9,g[i-1].length-1)];if(a&&b)edges.push({a,b,bend:30})}}
 const moving=animate&&!reduced&&!paused;
 const newCount=enterParticles(points,previousIds,{animate:moving,preserve,width:W,height:H});
 settling=newCount?180:0;prepareFibers(preserve?previousYear:2014);
 fearSorted=[...points].sort((a,b)=>fearScore(a)-fearScore(b));hover=null;$('#tooltip').hidden=true;updateUI();}

function changeYear(y){y=Math.max(2015,Math.min(2026,y));if(y===year)return;const previousYear=year;year=y;setFear(false);needsFist=!!stream;rebuild(y>previousYear,true,previousYear)}
function setMode(m){mode=m;selected='all';zoom=1;setFear(false);rebuild()}
$('#national').onclick=()=>setMode('national');$('#states').onclick=()=>setMode('states');$('#state-select').onchange=e=>{selected=e.target.value;zoom=1;setFear(false);rebuild()};$('#all-states').onclick=()=>{selected='all';zoom=1;rebuild()};function moveState(dir){let index=data.states.findIndex(s=>s.id===Number(selected));index=(index+dir+32)%32;selected=String(data.states[index].id);zoom=1;rebuild()}$('#previous-state').onclick=()=>moveState(-1);$('#next-state').onclick=()=>moveState(1);
let wheelTime=0;$('.timeline').addEventListener('wheel',e=>{e.preventDefault();if(performance.now()-wheelTime>140){wheelTime=performance.now();changeYear(year+Math.sign(e.deltaY))}},{passive:false});
function resize(){if(W===canvas.clientWidth&&H===canvas.clientHeight)return;W=canvas.clientWidth;H=canvas.clientHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);rebuild(false)}new ResizeObserver(resize).observe(canvas);
function pathEdge(e){const {a,b}=e;ctx.moveTo(a.x,a.y);const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;const amplitude=Math.min(4,len*.035);for(let j=1;j<=7;j++){const f=j/7,noise=Math.sin(j*2.8+a.jitter*30)*amplitude*Math.sin(f*Math.PI);ctx.lineTo(a.x+dx*f-dy/len*noise,a.y+dy*f+dx/len*noise)}if(len>32){const f=.43,x=a.x+dx*f,y=a.y+dy*f;ctx.moveTo(x,y);ctx.lineTo(x-dy*.12+dx*.07,y+dx*.12+dy*.07);ctx.lineTo(x-dy*.21+dx*.04,y+dx*.21+dy*.04)}}
const ripple=y=>Math.sin(y*.013)*27+Math.sin(y*.031)*13;const fearScore=p=>p.tx+ripple(p.ty);let fearSorted=[],fearThreshold=Infinity;
function draw(t){frame++;const elapsed=lastFrameTime?Math.min(40,t-lastFrameTime):16.67;lastFrameTime=t;if(!paused)pulseClock+=elapsed;
 if(settling&&!paused){const dt=elapsed/16.67;stepParticles(points,settling,dt);settling=Math.max(0,settling-dt);if(!settling)for(const p of points)if(p.moving){p.x=p.tx;p.y=p.ty;p.vx=0;p.vy=0;p.moving=false}}

 const target=fear?1:0;fearProgress+= (target-fearProgress)*.045;if(Math.abs(fearProgress-target)<.001)fearProgress=target;
 ctx.fillStyle='#050505';ctx.fillRect(0,0,W,H);
 if(fearProgress>0&&points.length){const amount=Math.round(points.length*data.years[year].perception/100*fearProgress);fearThreshold=fearSorted[Math.max(0,points.length-amount)]?fearScore(fearSorted[Math.max(0,points.length-amount)]):W+100;const gradient=ctx.createLinearGradient(Math.max(0,fearThreshold-35),0,W,0);gradient.addColorStop(0,'#050505');gradient.addColorStop(.15,'#290606');gradient.addColorStop(1,'#650d0b');ctx.fillStyle=gradient;ctx.beginPath();ctx.moveTo(W,0);for(let y=0;y<=H+10;y+=10)ctx.lineTo(fearThreshold-ripple(y)-15,y);ctx.lineTo(W,H);ctx.closePath();ctx.fill()}else fearThreshold=Infinity;
 drawFibers(t);
 // Fine branching fibers; year cohorts retain distinct gray values.
 for(let y=2015;y<=year;y++){const gray=grayForYear(y);ctx.strokeStyle=`rgb(${gray} ${gray} ${gray} / .40)`;ctx.lineWidth=mode==='states'&&selected!=='all'?.85:.55;ctx.beginPath();for(const e of edges)if(e.a.year===y&&Math.hypot(e.a.x-e.b.x,e.a.y-e.b.y)<180)pathEdge(e);ctx.stroke()}

 if(!paused&&!reduced){
 const scan=-230+(pulseClock%1450)/1450*(mask.width+460);
 const beamX=W*.58+(imageRect.x+scan/mask.width*imageRect.w-W*.58)*zoom;
 const beamWidth=imageRect.w/mask.width*65*zoom;
 ctx.save();ctx.beginPath();ctx.rect(beamX-beamWidth,0,beamWidth*2,H);ctx.clip();
 ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=1.15;ctx.shadowColor='#fff';ctx.shadowBlur=5;ctx.beginPath();
 for(const e of edges){if(Math.hypot(e.a.x-e.b.x,e.a.y-e.b.y)<180&&Math.max(e.a.x,e.b.x)>beamX-beamWidth&&Math.min(e.a.x,e.b.x)<beamX+beamWidth)pathEdge(e)}ctx.stroke();ctx.restore();
 }
 if(fearProgress>0){ctx.fillStyle='#41090988';ctx.beginPath();ctx.moveTo(W,0);for(let y=0;y<=H+10;y+=10)ctx.lineTo(fearThreshold-ripple(y),y);ctx.lineTo(W,H);ctx.closePath();ctx.fill()}
 if(settling){ctx.lineWidth=1.2;for(let y=2015;y<=year;y++){const g=grayForYear(y);ctx.strokeStyle=`rgba(${g},${g},${g},.24)`;ctx.beginPath();for(const p of points){if(!p.moving||p.delay>0||p.year!==y)continue;ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*2.7,p.y-p.vy*2.7)}ctx.stroke()}}
 for(let y=2015;y<=year;y++){const g=grayForYear(y);for(const dim of [false,true]){ctx.fillStyle=dim?'#491310':`rgb(${g},${g},${g})`;ctx.beginPath();for(const p of points){if(p.year!==y||p.delay>0||(fearScore(p)>=fearThreshold)!==dim)continue;ctx.moveTo(p.x+p.r,p.y);ctx.arc(p.x,p.y,p.r,0,Math.PI*2)}ctx.fill()}}
 if(mode==='states'&&selected==='all'){ctx.font='9px "mozaic-geo-variable", sans-serif';ctx.textAlign='center';ctx.fillStyle='#aaa';for(let i=0;i<32;i++){const row=Math.floor(i/8),col=i%8;const name=data.states[i].name;const x=W*.29+(col+.5)*W*.085,y=H*.14+(row+.5)*H*.16+H*.08;ctx.fillText(name.length>15?name.slice(0,13)+'…':name,x,y,W*.08)}}
 if(hover){ctx.strokeStyle='#d73630';ctx.lineWidth=1.2;ctx.beginPath();for(const e of edges)if(e.a===hover||e.b===hover)pathEdge(e);ctx.stroke();ctx.fillStyle='#d3322c';ctx.beginPath();ctx.arc(hover.x,hover.y,hover.r+1,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.beginPath();ctx.arc(hover.x,hover.y,hover.r+4,0,Math.PI*2);ctx.stroke()}
 requestAnimationFrame(draw)}
function showTip(p){hover=p;if(!p){$('#tooltip').hidden=true;return}const name=data.states.find(s=>s.id===p.state).name;$('#tooltip').innerHTML=`<div class="tip-title">UNA VIDA EN EL REGISTRO</div><b>${name}</b><br>Año: <b>${p.year}</b>${p.year===2026?' · enero–septiembre':''}<small>Unidad de un conteo agregado.<br>Sin identificación individual disponible.</small>`;const tw=220,th=150;$('#tooltip').style.left=`${Math.max(10,Math.min(W-tw-10,p.x+17))}px`;$('#tooltip').style.top=`${Math.max(10,Math.min(H-th-58,p.y-35))}px`;$('#tooltip').hidden=false}
canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointer={x:e.clientX-r.left,y:e.clientY-r.top};let near=null,best=100;for(const p of points){const d=(p.x-pointer.x)**2+(p.y-pointer.y)**2;if(d<best){near=p;best=d}}showTip(near);canvas.style.cursor=near?'crosshair':'default'});canvas.addEventListener('pointerleave',()=>showTip(null));canvas.addEventListener('click',()=>{if(mode==='states'&&selected==='all'&&hover){selected=String(hover.state);zoom=1;rebuild()}});canvas.onkeydown=e=>{if(e.key==='Escape'){showTip(null);return}if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();keyboardIndex=(keyboardIndex+(e.key==='ArrowRight'?1:-1)+points.length)%points.length;showTip(points[keyboardIndex])}};
for(const [selector,action]of [['#zoom-in',()=>zoom=Math.min(2.6,zoom+.2)],['#zoom-out',()=>zoom=Math.max(.6,zoom-.2)],['#reset',()=>zoom=1]])$(selector).onclick=()=>{action();rebuild(false)};
$('#pause').onclick=()=>{paused=!paused;if(paused){settling=0;for(const p of points){p.x=p.tx;p.y=p.ty;p.moving=false;p.delay=0}}updateUI()};
function setFear(value){if(fear===value)return;fear=value;fearSorted=[...points].sort((a,b)=>fearScore(a)-fearScore(b));$('#fear-reading').hidden=!fear;$('#manual').textContent=fear?'Ocultar percepción':'Mostrar sin cámara';$('#manual').setAttribute('aria-pressed',fear)}
$('#perception-button').onclick=()=>{const open=$('#perception-controls').hidden;$('#perception-controls').hidden=!open;$('#perception-button').setAttribute('aria-expanded',open);$('.plus').textContent=open?'−':'+'};$('#manual').onclick=()=>setFear(!fear);
const dialog=$('#info');$('#sources').onclick=$('#about').onclick=()=>dialog.showModal();$('.close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
let recognizer=null,stream=null,cameraTimer=null,needsFist=false,lastVideoTime=-1,lastGesture='',gestureFrames=0;
function stopCamera(){if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;clearTimeout(cameraTimer);$('#video').srcObject=null;$('#video').hidden=true;$('#camera').innerHTML='Activar cámara <span>↗</span>';$('#camera-status').textContent='Cámara apagada. También puedes usar el control manual.';setFear(false)}
async function recognize(){if(!stream)return;const video=$('#video');try{if(video.readyState>=2&&video.currentTime!==lastVideoTime){lastVideoTime=video.currentTime;const results=recognizer.recognizeForVideo(video,performance.now());const top=results.gestures[0]?.[0];const name=top&&top.score>.65?top.categoryName:'';gestureFrames=name===lastGesture?gestureFrames+1:0;lastGesture=name;if(gestureFrames>=2){if(name==='Closed_Fist'){needsFist=false;setFear(false);$('#camera-status').textContent='Puño cerrado · capa oculta'}else if(name==='Open_Palm'&&!needsFist){setFear(true);$('#camera-status').textContent='Palma abierta · percepción visible'}else if(needsFist){$('#camera-status').textContent='Nuevo año: cierra el puño y abre la palma.'}}}}catch(e){stopCamera();$('#camera-status').textContent='No se pudo leer el gesto. Usa el control manual.';return}cameraTimer=setTimeout(recognize,100)}
$('#camera').onclick=async()=>{if(stream){stopCamera();return}const button=$('#camera');button.disabled=true;$('#camera-status').textContent='Cargando reconocimiento de manos…';try{if(!navigator.mediaDevices?.getUserMedia)throw Error('unsupported');if(!recognizer){const {GestureRecognizer,FilesetResolver}=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/vision_bundle.mjs');const files=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm');recognizer=await GestureRecognizer.createFromOptions(files,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task'},runningMode:'VIDEO',numHands:1})}stream=await navigator.mediaDevices.getUserMedia({video:{width:320,height:240,facingMode:'user'},audio:false});$('#video').srcObject=stream;await $('#video').play();$('#video').hidden=false;button.textContent='Apagar cámara';$('#camera-status').textContent='Muestra la palma abierta a la cámara.';needsFist=false;recognize()}catch(e){if(stream)stopCamera();$('#camera-status').textContent=e.name==='NotAllowedError'?'Permiso de cámara denegado. Puedes usar el control manual.':'No se pudo iniciar la cámara. Revisa tu conexión o usa el control manual.'}finally{button.disabled=false}};
window.addEventListener('pagehide',stopCamera);document.addEventListener('visibilitychange',()=>{if(document.hidden&&stream)stopCamera()});
resize();rebuild();$('#loading').hidden=true;requestAnimationFrame(draw);
// Read-only diagnostics for data validation and browser QA.
window.sinapsis={getState:()=>({year,mode,selected,points:points.length,annual:data.years[year].total,accumulated:accumulated(),fear,perception:data.years[year].perception}),data};
