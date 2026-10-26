const $=s=>document.querySelector(s);
let currentProcess=0;
const processDialog=$('#process-reading');
function showProcess(step){
 currentProcess=step;
 $('#process-copy').replaceChildren($('#process-'+step).content.cloneNode(true));
 document.querySelectorAll('[data-process]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.process)===step));
 $('#previous-process').disabled=step===1;
 $('#next-process').textContent=step===4?'Cerrar y volver a la reflexión ↗':'Siguiente etapa →';
 if(!processDialog.open)processDialog.showModal();
 processDialog.scrollTop=0;
 $('#process-title').focus({preventScroll:true});
}
processDialog.addEventListener('close',()=>{
 currentProcess=0;
 document.querySelectorAll('[data-process]').forEach(b=>b.setAttribute('aria-pressed','false'));
});
$('#close-process').onclick=()=>processDialog.close();
processDialog.addEventListener('click',e=>{
 if(e.target!==processDialog)return;
 const r=processDialog.getBoundingClientRect();
 if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)processDialog.close();
});
$('#previous-process').onclick=()=>{if(currentProcess>1)showProcess(currentProcess-1)};
$('#next-process').onclick=()=>currentProcess===4?processDialog.close():showProcess(currentProcess+1);
document.querySelectorAll('[data-process]').forEach(b=>b.onclick=()=>showProcess(Number(b.dataset.process)));
