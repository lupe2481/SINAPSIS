// One shared curved surface keeps the atlas, lights and hit targets aligned.
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function project(x,y,w,h,view,time){
 const u=(x-w*.58)/w,v=(y-h*.48)/h;
 const wave=Math.sin(u*8+time*.0011)*Math.cos(v*7-time*.0008);
 const z=(.15*Math.exp(-u*u*5-v*v*3)+.012*wave)*w;
 const yaw=view.yaw+Math.sin(time*.00023)*.095,pitch=view.pitch+Math.sin(time*.00031)*.055;
 const xx=x-w*.58,yy=y-h*.48;
 const rx=xx*Math.cos(yaw)+z*Math.sin(yaw),rz=-xx*Math.sin(yaw)+z*Math.cos(yaw);
 const ry=yy*Math.cos(pitch)-rz*Math.sin(pitch),zz=yy*Math.sin(pitch)+rz*Math.cos(pitch);
 const perspective=w*2.5/(w*2.5-zz),breath=1+Math.sin(time*.0012)*.008;
 return {x:w*.58+rx*perspective*view.scale*breath,y:h*.48+ry*perspective*view.scale*breath};
}
export function stainScore(x,y,cx,cy,w,h){
 const dx=(x-cx)/(w*.5),dy=(y-cy)/(h*.58),angle=Math.atan2(dy,dx);
 return Math.hypot(dx,dy)/(1+.09*Math.sin(angle*5+.7)+.045*Math.sin(angle*9-1.3)+.025*Math.cos(angle*17));
}
export function createSurface(canvas){
 const gl=canvas.getContext('webgl',{alpha:false,antialias:true,preserveDrawingBuffer:true});
 if(!gl){const ctx=canvas.getContext('2d');return {render:source=>ctx.drawImage(source,0,0),project:(x,y)=>({x,y})}}
 const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 position; attribute vec2 uv; varying vec2 tex; void main(){tex=uv;gl_Position=vec4(position,0.,1.);}'));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float; varying vec2 tex; uniform sampler2D atlas; void main(){vec4 color=texture2D(atlas,tex); float edge=smoothstep(0.,.055,min(min(tex.x,1.-tex.x),min(tex.y,1.-tex.y)));gl_FragColor=vec4(mix(vec3(.0196078),color.rgb,edge),1.);}'));gl.linkProgram(program);gl.useProgram(program);
 const cols=56,rows=36,vertices=new Float32Array((cols+1)*(rows+1)*4),indices=[];
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;indices.push(a,b,a+1,a+1,b,b+1)}
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
 for(const [name,offset] of [['position',0],['uv',8]]){const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,16,offset)}
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
 gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 gl.clearColor(5/255,5/255,5/255,1);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault()});canvas.addEventListener('webglcontextrestored',()=>location.reload());
 return {project,render(source,w,h,view,time){
  let k=0;for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){const u=i/cols,v=j/rows,p=project(u*w,v*h,w,h,view,time);vertices[k++]=p.x/w*2-1;vertices[k++]=1-p.y/h*2;vertices[k++]=u;vertices[k++]=v}
  gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.DYNAMIC_DRAW);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
 }};
}
