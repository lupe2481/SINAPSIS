// Presentation aliases only. Never written into the factual source data.
const first=['Elena','Lucía','Mariana','Valeria','Camila','Renata','Andrea','Daniela','Sofía','Isabel','Clara','Julia','Natalia','Paula','Adriana','Victoria','Gabriela','Alejandra','Carolina','Emilia','Teresa','Diana','Jimena','Cecilia','Laura','Mónica','Rosa','Beatriz','Patricia','Silvia','Alicia','Irene'];
const last=['Ríos','Vega','Luna','Soto','Montes','Robles','Campos','Fuentes','Molina','Sierra','León','Solís','Cruz','Paz','Vargas','Navarro','Flores','Reyes','Castro','Romero','Medina','Torres','Salas','Mora','Aguilar','Cortés','Ramos','Delgado','Pineda','Lara','Ortega','Cano'];
export function demoName(id){return `${first[id%32]} ${last[Math.floor(id/32)%32]} ${last[Math.floor(id/1024)%32]}`}
export function advanceMotionClock(time,elapsed,paused,selected){return paused||selected?time:time+elapsed*.2}
