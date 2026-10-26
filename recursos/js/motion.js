// A cohort keeps the same gray throughout the timeline.
export const grayForYear = year => Math.round(102 + (year - 2015) * (153 / 11));
export function enterParticles(points, previousIds, { animate, preserve, width, height }) {
  let moving = 0;
  for (const p of points) {
    if (preserve && previousIds.has(p.id)) {
      // Retained records are immovable obstacles for the incoming generation.
      if (p.moving && animate) moving++;
      else { p.moving = false; p.vx = 0; p.vy = 0; p.delay = 0; }
      continue;
    }
    p.entryPath = [];
    p.moving = animate;
    p.delay = animate ? (p.id * 17 % 34) : 0;
    if (!animate) { p.x = p.tx; p.y = p.ty; p.vx = 0; p.vy = 0; continue; }
    const a = ((p.id * .61803398875) % 1) * Math.PI * 2;
    const distance = Math.hypot(width, height) * (.55 + p.jitter * .25);
    p.x = width * .58 + Math.cos(a) * distance;
    p.y = height * .46 + Math.sin(a) * distance;
    const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy) || 1;
    p.vx = dx / d * (12 + p.jitter * 14);
    p.vy = dy / d * (12 + p.jitter * 14);
    p.entryPath.push(p.x,p.y);
    moving++;
  }
  return moving;
}
export function collideParticles(points, strength = 1) {
  const cell = Math.max(8, ...points.map(p => p.r * 2 + 1));
  const grid = new Map(); let hits = 0;
  for (const p of points) {
    if (p.delay > 0) continue;
    const gx = Math.floor(p.x / cell), gy = Math.floor(p.y / cell);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      const others = grid.get(`${gx + dx},${gy + dy}`);
      if (!others) continue;
      for (const q of others) {
        if (!p.moving && !q.moving) continue;
        let x = p.x - q.x, y = p.y - q.y, d = Math.hypot(x, y);
        const min = p.r + q.r + .35;
        if (d >= min) continue;
        if (d < .001) { x = 1; y = 0; d = 1; }
        const nx = x / d, ny = y / d;
        const mp = p.moving ? 1 : 0, mq = q.moving ? 1 : 0, mass = mp + mq;
        const correction = (min - d) * .65 * strength / mass;
        p.x += nx * correction * mp; p.y += ny * correction * mp;
        q.x -= nx * correction * mq; q.y -= ny * correction * mq;
        const approach = (p.vx - q.vx) * nx + (p.vy - q.vy) * ny;
        if (approach < 0) {
          const impulse = -(1 + .72) * approach / mass * strength;
          p.vx += nx * impulse * mp; p.vy += ny * impulse * mp;
          q.vx -= nx * impulse * mq; q.vy -= ny * impulse * mq;
        }
        hits++;
      }
    }
    const key = `${gx},${gy}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(p);
  }
  return hits;
}
export function stepParticles(points, remaining, dt = 1) {
  const settle = remaining < 38;
  for (const p of points) {
    if (!p.moving) continue;
    if (p.delay > 0) { p.delay -= dt; continue; }
    const spring = settle ? .065 : .014;
    const damping = Math.pow(settle ? .68 : .94, dt);
    p.vx = (p.vx + (p.tx - p.x) * spring * dt) * damping;
    p.vy = (p.vy + (p.ty - p.y) * spring * dt) * damping;
    const speed = Math.hypot(p.vx, p.vy), max = 30;
    if (speed > max) { p.vx *= max / speed; p.vy *= max / speed; }
    p.x += p.vx * dt; p.y += p.vy * dt;
  }
  return remaining > 38 ? collideParticles(points) : 0;
}

// Capture the actual entry (including collisions) for reverse playback.
export function recordEntry(points){for(const p of points)if(p.moving){if(!p.entryPath)p.entryPath=[];p.entryPath.push(p.x,p.y)}}
export function makeExit(p,width,height){
 const a=((p.id*.61803398875)%1)*Math.PI*2,d=Math.hypot(width,height)*(.55+p.jitter*.25);
 const path=p.entryPath?.length>=4?[...p.entryPath]:[width*.58+Math.cos(a)*d,height*.46+Math.sin(a)*d];
 path.push(p.x,p.y);
 return {...p,entryPath:undefined,path,age:0,duration:2600+(p.id*17%34)*10,opacity:1,moving:false,delay:0};
}
export function stepExit(p,elapsed){
 p.age=Math.min(p.duration,p.age+elapsed);
 const progress=p.age/p.duration,n=p.path.length/2;
 // The same collision path, traversed backwards; ease through its quiet tail.
 const cursor=(n-1)*(1-Math.pow(progress,.65)),i=Math.floor(cursor),j=Math.min(n-1,i+1),f=cursor-i;
 p.vx=p.x;p.vy=p.y;
 p.x=p.path[i*2]*(1-f)+p.path[j*2]*f;p.y=p.path[i*2+1]*(1-f)+p.path[j*2+1]*f;
 p.vx=p.x-p.vx;p.vy=p.y-p.vy;
 p.opacity=progress<.85?1:(1-progress)/.15;
 return progress<1;
}
